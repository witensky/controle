import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../features/studies/hooks/useStudies';
import { CreateSubjectDTO, LawSubject, LawSubjectStatus, StudyReminder, StudyScheduleSlot, StudySession } from '../features/studies/types';
import CourseSchedule from '../components/studies/CourseSchedule';
import CourseList from '../components/studies/CourseList';
import StudyMode from '../components/studies/StudyMode';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { localStore } from '../lib/localStorage';
import { requestBrowserNotificationPermission } from '../lib/browserNotifications';

type ToastType = 'success' | 'error' | 'info';

const REMINDER_LOG_KEY = 'study_reminder_log';

const scheduleFromLegacyDateTime = (courseDateTime?: string | null): StudyScheduleSlot[] => {
  if (!courseDateTime) return [];
  const date = new Date(courseDateTime);
  if (Number.isNaN(date.getTime())) return [];

  const startHours = String(date.getHours()).padStart(2, '0');
  const startMinutes = String(date.getMinutes()).padStart(2, '0');
  const endDate = new Date(date.getTime() + 60 * 60 * 1000);

  return [{
    id: `legacy-${courseDateTime}`,
    weekday: date.getDay(),
    startTime: `${startHours}:${startMinutes}`,
    endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
  }];
};

const STATUS_OPTIONS: Array<{ value: LawSubjectStatus; label: string; activeClass: string }> = [
  { value: 'En cours', label: 'En cours', activeClass: 'bg-amber-500 border-amber-500 text-slate-950' },
  { value: 'Termine', label: 'Termine', activeClass: 'bg-emerald-500 border-emerald-500 text-slate-950' },
  { value: 'En attente', label: 'En attente', activeClass: 'bg-blue-500 border-blue-500 text-white' },
];

const Studies: React.FC = () => {
  const { data: subjectsRaw, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const subjects = useMemo(
    () => (subjectsRaw || []).map((subject) => ({
      ...subject,
      courseDateTime: subject.courseDateTime ?? null,
      courseSchedule: subject.courseSchedule?.length ? subject.courseSchedule : scheduleFromLegacyDateTime(subject.courseDateTime),
      reminders: subject.reminders ?? [],
      studySessions: subject.studySessions ?? [],
    })),
    [subjectsRaw],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LawSubject | null>(null);
  const [activeStudySubject, setActiveStudySubject] = useState<LawSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { showConfirm } = useAppDialog();

  const [formName, setFormName] = useState('');
  const [formSemester, setFormSemester] = useState('S1');
  const [formProf, setFormProf] = useState('');
  const [formStatus, setFormStatus] = useState<LawSubjectStatus>('En cours');
  const [formChaptersTotal, setFormChaptersTotal] = useState(10);
  const [formChaptersDone, setFormChaptersDone] = useState(0);
  const [formExamDate, setFormExamDate] = useState('');
  const [formEcts, setFormEcts] = useState(5);
  const [formNotes, setFormNotes] = useState('');
  const [formCourseSchedule, setFormCourseSchedule] = useState<StudyScheduleSlot[]>([]);
  const [formReminders, setFormReminders] = useState<StudyReminder[]>([]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!editingSubject) return;
    setFormName(editingSubject.name);
    setFormSemester(editingSubject.semester);
    setFormProf(editingSubject.professor || '');
    setFormStatus(editingSubject.status);
    setFormChaptersTotal(editingSubject.chaptersTotal);
    setFormChaptersDone(editingSubject.chaptersDone);
    setFormExamDate(editingSubject.examDate || '');
    setFormEcts(editingSubject.ects);
    setFormNotes(editingSubject.notes || '');
    setFormCourseSchedule(editingSubject.courseSchedule?.length ? editingSubject.courseSchedule : scheduleFromLegacyDateTime(editingSubject.courseDateTime));
    setFormReminders(editingSubject.reminders || []);
  }, [editingSubject]);

  const resetForm = () => {
    setFormName('');
    setFormSemester('S1');
    setFormProf('');
    setFormStatus('En cours');
    setFormChaptersTotal(10);
    setFormChaptersDone(0);
    setFormExamDate('');
    setFormEcts(5);
    setFormNotes('');
    setFormCourseSchedule([]);
    setFormReminders([]);
    setEditingSubject(null);
  };

  const clearReminderLogForSubject = (subjectId: string) => {
    const currentLog = localStore.get<Record<string, string>>(REMINDER_LOG_KEY) || {};
    const nextLog = Object.fromEntries(
      Object.entries(currentLog).filter(([key]) => !key.startsWith(`${subjectId}:`)),
    );
    localStore.set(REMINDER_LOG_KEY, nextLog);
  };

  const probeNotificationPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    if (permission === 'granted') {
      setToast({ type: 'success', message: 'Notifications navigateur activées pour les rappels.' });
      return;
    }

    if (permission === 'denied') {
      setToast({ type: 'info', message: 'Permission refusée. Les rappels resteront visibles dans l’application.' });
      return;
    }

    if (permission === 'unsupported') {
      setToast({ type: 'info', message: 'Les notifications système ne sont pas disponibles ici. Les rappels restent dans l’application.' });
      return;
    }

    setToast({ type: 'info', message: 'Autorise les notifications pour recevoir les rappels même hors écran.' });
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);

    try {
      const payload: CreateSubjectDTO = {
        name: formName.trim(),
        semester: formSemester,
        professor: formProf || undefined,
        status: formStatus,
        chaptersTotal: Math.max(1, Number(formChaptersTotal)),
        chaptersDone: Math.min(Math.max(0, Number(formChaptersDone)), Math.max(1, Number(formChaptersTotal))),
        examDate: formExamDate || undefined,
        ects: Number(formEcts) || 5,
        notes: formNotes || undefined,
        courseDateTime: undefined,
        courseSchedule: formCourseSchedule,
        reminders: formReminders,
        studySessions: editingSubject?.studySessions || [],
      };

      if (editingSubject) {
        clearReminderLogForSubject(editingSubject.id);
        await updateSubject.mutateAsync({ id: editingSubject.id, updates: payload });
      } else {
        await createSubject.mutateAsync(payload);
      }

      if (formReminders.length > 0) {
        await probeNotificationPermission();
      }

      setToast({ type: 'success', message: editingSubject ? 'Module mis a jour.' : 'Module ajoute avec succes.' });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement du module." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubject = async (subject: LawSubject) => {
    const confirmed = await showConfirm({
      title: 'Supprimer le module',
      message: `Le module "${subject.name}" sera retire avec ses rappels et sessions de revision.`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!confirmed) return;
    clearReminderLogForSubject(subject.id);
    await deleteSubject.mutateAsync(subject.id);
    setToast({ type: 'success', message: 'Module supprime.' });
  };

  const handleSaveStudySession = async (subjectId: string, session: StudySession) => {
    const subject = subjects.find((entry) => entry.id === subjectId);
    if (!subject) return;

    await updateSubject.mutateAsync({
      id: subjectId,
      updates: {
        studySessions: [...(subject.studySessions || []), session],
      },
    });

    setToast({ type: 'success', message: 'Session de revision sauvegardee.' });
  };

  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => subject.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, subjects],
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white md:text-4xl">
              Mes <span className="font-outfit text-amber-500">Etudes</span>
            </h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Modules, rappels et revision concentree</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="relative min-w-[16rem] flex-1 md:flex-none">
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un module"
                className="w-full rounded-2xl border border-white/5 bg-[#020617] py-4 pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-white/15"
              />
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 shadow-[0_18px_44px_rgba(251,191,36,0.28)] transition-transform hover:scale-[1.02]"
            >
              <Plus size={16} strokeWidth={3} />
              Ajouter un module
            </button>
          </div>
        </div>

        {filteredSubjects.length > 0 ? (
          <CourseList
            subjects={filteredSubjects}
            onEdit={(subject) => {
              setEditingSubject(subject);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteSubject}
            onStudy={setActiveStudySubject}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center"
          >
            <p className="text-sm font-bold text-white">Aucun module ne correspond a cette recherche.</p>
            <p className="mt-2 text-[11px] text-slate-500">Essaie un autre mot-cle ou ajoute un nouveau module.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-start justify-center overflow-y-auto bg-slate-950/98 p-4 pt-6 backdrop-blur-2xl md:p-6 md:pt-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-slate-900 p-6 shadow-2xl md:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Parametres du <span className="text-amber-500">module</span>
                  </h3>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Cours, rappels et focus de revision</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="rounded-2xl border border-white/8 bg-white/5 p-3 text-slate-400 transition-colors hover:text-white">
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Nom du module</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    placeholder="Ex: module principal"
                    className="w-full rounded-2xl border border-white/5 bg-[#020617] px-6 py-5 text-sm font-bold text-white outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Semestre</label>
                    <select
                      value={formSemester}
                      onChange={(event) => setFormSemester(event.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-[#020617] px-4 py-4 text-[10px] font-black uppercase text-white outline-none focus:border-amber-500/40"
                    >
                      {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((semester) => <option key={semester} value={semester}>{semester}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Credits ECTS</label>
                    <input
                      type="number"
                      value={formEcts}
                      onChange={(event) => setFormEcts(Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/5 bg-[#020617] px-4 py-4 text-[11px] font-black text-white outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Professeur referent</label>
                  <input
                    type="text"
                    value={formProf}
                    onChange={(event) => setFormProf(event.target.value)}
                    placeholder="Pr. Dupont"
                    className="w-full rounded-2xl border border-white/5 bg-[#020617] px-6 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Statut</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormStatus(status.value)}
                        className={`rounded-xl border py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                          formStatus === status.value
                            ? status.activeClass
                            : 'border-white/5 bg-slate-950 text-slate-500 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Chapitres faits</label>
                    <input
                      type="number"
                      value={formChaptersDone}
                      onChange={(event) => setFormChaptersDone(Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/5 bg-[#020617] px-4 py-4 text-[11px] font-black text-white outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Total chapitres</label>
                    <input
                      type="number"
                      value={formChaptersTotal}
                      onChange={(event) => setFormChaptersTotal(Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/5 bg-[#020617] px-4 py-4 text-[11px] font-black text-white outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <CourseSchedule
                  schedule={formCourseSchedule}
                  onChange={(value) => {
                    setFormCourseSchedule(value);
                    if (!value.length) {
                      setFormReminders([]);
                    }
                  }}
                  reminders={formReminders}
                  onRemindersChange={setFormReminders}
                  onProbeNotifications={probeNotificationPermission}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Date d'examen</label>
                    <input
                      type="date"
                      value={formExamDate}
                      onChange={(event) => setFormExamDate(event.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-[#020617] px-6 py-4 text-sm font-bold text-white outline-none [color-scheme:dark] focus:border-amber-500/40"
                    />
                  </div>

                  <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      <GraduationCap size={14} className="text-cyan-300" />
                      Revision gamifiee
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Lance le mode revision depuis la carte du module pour suivre le temps, le niveau et les sessions.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Notes de cours</label>
                  <textarea
                    value={formNotes}
                    onChange={(event) => setFormNotes(event.target.value)}
                    placeholder="Points cles, ressources, axes de revision..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/5 bg-[#020617] px-6 py-4 text-sm text-white outline-none focus:border-amber-500/40"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !formName.trim()}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 px-6 py-5 text-[11px] font-black uppercase tracking-[0.28em] text-slate-950 shadow-[0_18px_44px_rgba(251,191,36,0.25)] transition-transform hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} strokeWidth={3} />}
                  Confirmer le module
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <StudyMode
        subject={activeStudySubject}
        isOpen={Boolean(activeStudySubject)}
        onClose={() => setActiveStudySubject(null)}
        onSaveSession={handleSaveStudySession}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-24 left-1/2 z-[430] w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/90 px-5 py-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-center gap-3 text-center">
              <span className={`h-2.5 w-2.5 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-cyan-300'
              }`} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white">{toast.message}</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default Studies;
