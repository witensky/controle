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
    <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] p-6">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-40" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-300/70">Mode revision</p>
            <p className="mt-2 text-5xl font-black italic tracking-[-0.08em] text-white font-outfit">
              {formatStudyTime(elapsedSeconds)}
            </p>
          </div>
          <motion.div
            animate={isRunning ? { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.8 }}
            transition={{ repeat: isRunning ? Infinity : 0, duration: 2.2, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200"
          >
            <Sparkles size={12} />
            Niveau {level}
          </motion.div>
        </div>

        <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
          <span>{label}</span>
          <span>{nextLabel}</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#3b82f6,#8b5cf6)] shadow-[0_0_24px_rgba(34,211,238,0.35)]"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;
