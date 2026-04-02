import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { formatStudyTime } from '../../utils/studyMode';

interface TimerProps {
  elapsedSeconds: number;
  level: number;
  label: string;
  progressPercent: number;
  nextLabel: string;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({
  elapsedSeconds,
  level,
  label,
  progressPercent,
  nextLabel,
  isRunning,
}) => {
  return (
    <div className="study-timer-shell relative overflow-hidden rounded-[1.7rem] p-4 sm:p-5">
      <div className="study-timer-shine absolute inset-0 opacity-30" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[color:var(--tone-info-text)]">Mode revision</p>
            <p className="mt-1.5 font-outfit text-[3rem] font-black italic leading-none tracking-[-0.08em] text-[color:var(--heading)] dark:text-white sm:text-[3.4rem]">
              {formatStudyTime(elapsedSeconds)}
            </p>
          </div>
          <motion.div
            animate={isRunning ? { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.88 }}
            transition={{ repeat: isRunning ? Infinity : 0, duration: 2.2, ease: 'easeInOut' }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-info-text)]"
          >
            <Sparkles size={12} />
            Niveau {level}
          </motion.div>
        </div>

        <div className="flex items-center justify-between gap-4 text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          <span>{label}</span>
          <span>{nextLabel}</span>
        </div>

        <div className="study-progress-track h-2.5 overflow-hidden rounded-full">
          <motion.div
            className="study-progress-fill h-full rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;
