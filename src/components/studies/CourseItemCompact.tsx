import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BellRing, BookOpenCheck, ChevronDown, Edit3, Sparkles, Trash2 } from 'lucide-react';
import type { LawSubject } from '../../features/studies/types';
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
  'En cours': 'text-amber-300 border-amber-400/20 bg-amber-400/10',
  'Termine': 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10',
  'En attente': 'text-sky-300 border-sky-400/20 bg-sky-400/10',
  Echec: 'text-rose-300 border-rose-400/20 bg-rose-400/10',
  Rattrapage: 'text-violet-300 border-violet-400/20 bg-violet-400/10',
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
      whileHover={{ y: -2, scale: 1.01 }}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
      className="group relative overflow-hidden rounded-[1.9rem] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.68),rgba(2,6,23,0.88))] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.28)] transition-all"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-amber-400">
              {subject.semester}
            </span>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${STATUS_TONE[subject.status]}`}>
              {subject.status}
            </span>
          </div>

          <h3 className="mt-3 truncate text-lg font-black uppercase italic tracking-tight text-white md:text-xl">
            {subject.name}
          </h3>
          <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {subject.professor || 'Professeur a definir'}
          </p>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex items-end justify-between gap-3">
            <span className="text-2xl font-black italic tracking-[-0.05em] text-white">{subject.progress}%</span>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {subject.chaptersDone}/{subject.chaptersTotal}
            </span>
          </div>
          <ProgressBar value={subject.progress} />
          <div className="flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
            <span>{totalMinutes} min revisees</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Sparkles size={11} />
              Niveau {studyLevel.level}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
          <div className="space-y-1 text-left md:text-right">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{shortSchedule}</div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 md:justify-end">
              <BellRing size={11} className={subject.reminders.length > 0 ? 'text-cyan-300' : 'text-slate-600'} />
              {subject.reminders.length > 0 ? `${subject.reminders.length} rappel${subject.reminders.length > 1 ? 's' : ''}` : 'Sans rappel'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 opacity-0 transition-all duration-200 md:flex md:translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  stopPropagation(event);
                  onStudy();
                }}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100 transition-colors hover:bg-cyan-400 hover:text-slate-950"
              >
                <BookOpenCheck size={14} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  stopPropagation(event);
                  onEdit();
                }}
                className="rounded-xl border border-white/8 bg-white/[0.04] p-2 text-slate-400 transition-colors hover:text-white"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  stopPropagation(event);
                  onDelete();
                }}
                className="rounded-xl border border-white/8 bg-white/[0.04] p-2 text-slate-400 transition-colors hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} className="text-slate-400" />
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseItemCompact;
