import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BellRing, BookOpenCheck, ChevronDown, Sparkles } from 'lucide-react';
import type { LawSubject } from '../../features/studies/types';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';
import { getStudyLevelMeta, sumStudySeconds } from '../../utils/studyMode';
import { getWeekdayMeta } from '../../utils/studyReminders';
import ProgressBar from './ProgressBar';

interface CourseItemCompactProps {
  subject: LawSubject;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStudy: () => void;
}

const STATUS_TONE: Record<LawSubject['status'], string> = {
  'En cours': toneClassNames.warning.chip,
  Termine: toneClassNames.success.chip,
  'En attente': toneClassNames.info.chip,
  Echec: toneClassNames.danger.chip,
  Rattrapage: toneClassNames.info.chip,
};

const CourseItemCompact: React.FC<CourseItemCompactProps> = ({
  subject,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onStudy,
}) => {
  const totalStudySeconds = sumStudySeconds(subject.studySessions || []);
  const studyLevel = getStudyLevelMeta(totalStudySeconds);
  const totalMinutes = Math.round(totalStudySeconds / 60);
  const hasProfessor = Boolean(subject.professor && subject.professor.trim());
  const hasSchedule = subject.courseSchedule.length > 0;
  const reminderCount = subject.reminders.length;

  const shortSchedule = useMemo(() => {
    if (!subject.courseSchedule.length) return 'Non planifie';

    const sortedSlots = [...subject.courseSchedule].sort(
      (left, right) => left.weekday - right.weekday || left.startTime.localeCompare(right.startTime),
    );
    const firstSlot = sortedSlots[0];
    const baseLabel = `${getWeekdayMeta(firstSlot.weekday).short} ${firstSlot.startTime}`;

    return sortedSlots.length > 1 ? `${baseLabel} +${sortedSlots.length - 1}` : baseLabel;
  }, [subject.courseSchedule]);

  const stopPropagation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      whileHover={{ y: -2, scale: 1.005 }}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cx(uiRecipes.compactItemCard, 'group relative overflow-hidden p-3.5')}
    >
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-item-badge inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-[color:var(--heading)]">
                {subject.semester}
              </span>
              <span className={cx(uiRecipes.statusBadge, STATUS_TONE[subject.status])}>
                {subject.status}
              </span>
            </div>

            <h3 className="mt-2 truncate text-[1.25rem] font-black uppercase italic leading-none tracking-tight text-[color:var(--heading)]">
              {subject.name}
            </h3>
            {hasProfessor ? (
              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                {subject.professor}
              </p>
            ) : null}
          </div>

          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <span className={cx(uiRecipes.compactActionIcon)}>
              <ChevronDown size={18} className="text-[color:var(--text-muted)]" />
            </span>
          </motion.span>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Progression
              </p>
              <span className="mt-1 block text-[1.75rem] font-black italic leading-none tracking-[-0.06em] text-[color:var(--heading)]">
                {subject.progress}%
              </span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
              {subject.chaptersDone}/{subject.chaptersTotal} chapitres
            </span>
          </div>
          <ProgressBar value={subject.progress} heightClassName="h-1.5" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cx(uiRecipes.chip, 'px-2 py-1 text-[8px] tracking-[0.16em]')}>
            {totalMinutes} min
          </span>
          <span className={cx(uiRecipes.chip, toneClassNames.warning.chip, 'gap-1 px-2 py-1 text-[8px] tracking-[0.16em]')}>
            <Sparkles size={9} />
            Niveau {studyLevel.level}
          </span>
          {hasSchedule ? (
            <span className={cx(uiRecipes.chip, 'max-w-full truncate px-2 py-1 text-[8px] tracking-[0.16em]')}>
              {shortSchedule}
            </span>
          ) : null}
          {reminderCount > 0 ? (
            <span className={cx(uiRecipes.chip, toneClassNames.info.chip, 'gap-1 px-2 py-1 text-[8px] tracking-[0.16em]')}>
              <BellRing size={9} />
              {reminderCount} rappel{reminderCount > 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {!hasSchedule && reminderCount === 0 ? (
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                Aucune planification
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={(event) => {
                stopPropagation(event);
                onStudy();
              }}
              className={cx(uiRecipes.compactActionIcon, toneClassNames.info.shell, toneClassNames.info.text)}
            >
              <BookOpenCheck size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(
  CourseItemCompact,
  (previous, next) =>
    previous.subject === next.subject &&
    previous.index === next.index &&
    previous.isExpanded === next.isExpanded,
);
