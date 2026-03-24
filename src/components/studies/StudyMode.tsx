import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, Pause, Play, RotateCcw, Trophy, X } from 'lucide-react';
import type { LawSubject, StudySession } from '../../features/studies/types';
import Timer from './Timer';
import { getStudyLevelMeta, sumStudySeconds } from '../../utils/studyMode';

interface StudyModeProps {
  subject: LawSubject | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (subjectId: string, session: StudySession) => Promise<void> | void;
}

const StudyMode: React.FC<StudyModeProps> = ({ subject, isOpen, onClose, onSaveSession }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setElapsedSeconds(0);
      setStartedAt(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const levelMeta = useMemo(() => getStudyLevelMeta(elapsedSeconds), [elapsedSeconds]);
  const previousSessions = subject?.studySessions || [];
  const totalStudySeconds = sumStudySeconds(previousSessions);

  const handleStartPause = () => {
    if (!startedAt) {
      setStartedAt(new Date());
    }
    setIsRunning((current) => !current);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setStartedAt(null);
  };

  const handleFinish = async () => {
    if (!subject || elapsedSeconds <= 0) {
      handleReset();
      onClose();
      return;
    }

    const session: StudySession = {
      id: `study-${Date.now()}`,
      startedAt: (startedAt || new Date()).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      levelReached: levelMeta.level,
    };

    await onSaveSession(subject.id, session);
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && subject ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[420] bg-slate-950/96 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-4 pb-6 pt-4"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-300">Mode revision</p>
                <h3 className="mt-2 text-3xl font-black uppercase italic tracking-tight text-white">{subject.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{subject.professor || 'Professeur non defini'} • {subject.semester}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-400 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[1.45fr,0.85fr]">
              <div className="space-y-5">
                <Timer
                  elapsedSeconds={elapsedSeconds}
                  level={levelMeta.level}
                  label={levelMeta.label}
                  progressPercent={levelMeta.progressPercent}
                  nextLabel={levelMeta.nextLabel}
                  isRunning={isRunning}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartPause}
                    className="inline-flex items-center justify-center gap-3 rounded-[1.6rem] bg-cyan-400 px-5 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.28)]"
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Demarrer'}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-3 rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    className="inline-flex items-center justify-center gap-3 rounded-[1.6rem] border border-emerald-400/20 bg-emerald-400/12 px-5 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-100"
                  >
                    <BookOpenCheck size={16} />
                    Terminer
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Progression globale</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/60 px-4 py-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">Temps cumule</p>
                      <p className="mt-2 text-2xl font-black italic text-white">{Math.round((totalStudySeconds + elapsedSeconds) / 60)} min</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/60 px-4 py-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">Sessions</p>
                      <p className="mt-2 text-2xl font-black italic text-white">{previousSessions.length + (elapsedSeconds > 0 ? 1 : 0)}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/60 px-4 py-4">
                      <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-amber-300"><Trophy size={12} /> Niveau atteint</p>
                      <p className="mt-2 text-2xl font-black italic text-white">Niv. {levelMeta.level}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Historique recent</p>
                  <div className="mt-4 space-y-3">
                    {previousSessions.length > 0 ? previousSessions.slice(-4).reverse().map((session) => (
                      <div key={session.id} className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/8 bg-slate-950/60 px-4 py-3">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                            {new Date(session.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">{Math.round(session.durationSeconds / 60)} min</p>
                        </div>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                          Niveau {session.levelReached}
                        </span>
                      </div>
                    )) : (
                      <p className="rounded-[1.1rem] border border-dashed border-white/10 px-4 py-4 text-sm text-slate-500">
                        Aucune session sauvegardee pour l'instant.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default StudyMode;
