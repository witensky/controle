import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BellRing, BookOpenCheck, CalendarClock, Clock3, Edit3, GraduationCap, NotebookPen, Trash2 } from 'lucide-react';
import type { LawSubject } from '../../features/studies/types';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';
import { getStudyLevelMeta, sumStudySeconds } from '../../utils/studyMode';
import { formatWeeklySchedule } from '../../utils/studyReminders';
import ProgressBar from './ProgressBar';

interface CourseItemExpandedProps {
  subject: LawSubject;
  onEdit: () => void;
  onDelete: () => void;
  onStudy: () => void;
}

const formatExamDate = (examDate?: string | null) => {
  if (!examDate) return 'Aucune date definie';
  const parsed = new Date(examDate);
  if (Number.isNaN(parsed.getTime())) return examDate;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CourseItemExpanded: React.FC<CourseItemExpandedProps> = ({
  subject,
  onEdit,
  onDelete,
  onStudy,
}) => {
  const totalStudySeconds = sumStudySeconds(subject.studySessions || []);
  const studyLevel = getStudyLevelMeta(totalStudySeconds);
  const totalMinutes = Math.round(totalStudySeconds / 60);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-[1.7rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              <CalendarClock size={13} className="text-[color:var(--tone-info-text)]" />
              Planning
            </div>
            <p className="mt-3 text-sm font-bold text-[color:var(--text-primary)]">
              {subject.courseSchedule.length > 0 ? formatWeeklySchedule(subject.courseSchedule) : 'Aucun creneau defini'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              <BellRing size={12} className={subject.reminders.length > 0 ? 'text-[color:var(--tone-info-text)]' : 'text-[color:var(--text-muted)]'} />
              {subject.reminders.length > 0
                ? subject.reminders.map((reminder) => reminder.label).join(' - ')
                : 'Sans rappel'}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              <GraduationCap size={13} className="text-[color:var(--tone-warning-text)]" />
              Revision
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-black italic tracking-[-0.05em] text-[color:var(--text-primary)]">{totalMinutes} min</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  Niveau {studyLevel.level} - {studyLevel.label}
                </p>
              </div>
              <span className={cx(uiRecipes.chip, toneClassNames.warning.chip)}>
                {studyLevel.nextLabel}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={studyLevel.progressPercent} />
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              <Clock3 size={13} className="text-[color:var(--tone-success-text)]" />
              Suivi
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xl font-black italic text-[color:var(--text-primary)]">{subject.progress}%</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  {subject.chaptersDone}/{subject.chaptersTotal} chapitres
                </p>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                {formatExamDate(subject.examDate)}
              </span>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              <NotebookPen size={13} className="text-[color:var(--tone-info-text)]" />
              Notes
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {subject.notes || 'Aucune note ajoutee pour ce module.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStudy}
            className={cx(uiRecipes.secondaryButton, toneClassNames.info.shell, toneClassNames.info.text, 'inline-flex flex-1 gap-2 rounded-[1.2rem] px-4 py-3')}
          >
            <BookOpenCheck size={14} />
            Mode revision
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)]"
          >
            <Edit3 size={14} />
            Modifier
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cx(uiRecipes.ghostButton, toneClassNames.danger.shell, toneClassNames.danger.text, 'inline-flex gap-2 rounded-[1.2rem] px-4 py-3')}
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(
  CourseItemExpanded,
  (previous, next) => previous.subject === next.subject,
);
