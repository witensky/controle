import React from 'react';
import { motion } from 'framer-motion';

interface ResteAVivreWidgetProps {
  amount: number;
  totalBudget: number;
  onClick?: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ResteAVivreWidget: React.FC<ResteAVivreWidgetProps> = ({ amount, totalBudget, onClick }) => {
  const percentage = totalBudget > 0 ? clamp((amount / totalBudget) * 100, 0, 100) : 0;

  const tone =
    percentage >= 70
      ? {
          label: 'text-emerald-300',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/18',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)]',
          shellGlow: 'bg-emerald-500/10',
          progress: 'from-emerald-400 via-emerald-500 to-lime-400',
          liquid: 'from-emerald-400 via-emerald-500 to-cyan-500',
          wave: 'bg-emerald-200/25',
        }
      : percentage >= 40
        ? {
            label: 'text-amber-200',
            accent: 'text-amber-300',
            border: 'border-amber-500/18',
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.18)]',
            shellGlow: 'bg-amber-500/10',
            progress: 'from-yellow-300 via-amber-400 to-orange-400',
            liquid: 'from-yellow-300 via-amber-400 to-orange-500',
            wave: 'bg-amber-100/25',
          }
        : percentage >= 20
          ? {
              label: 'text-orange-200',
              accent: 'text-orange-400',
              border: 'border-orange-500/18',
              glow: 'shadow-[0_0_30px_rgba(249,115,22,0.18)]',
              shellGlow: 'bg-orange-500/10',
              progress: 'from-orange-300 via-orange-400 to-rose-400',
              liquid: 'from-orange-300 via-orange-500 to-rose-500',
              wave: 'bg-orange-100/25',
            }
          : {
              label: 'text-rose-200',
              accent: 'text-rose-400',
              border: 'border-rose-500/18',
              glow: 'shadow-[0_0_30px_rgba(244,63,94,0.18)]',
              shellGlow: 'bg-rose-500/10',
              progress: 'from-rose-400 via-rose-500 to-red-500',
              liquid: 'from-rose-400 via-rose-500 to-red-500',
              wave: 'bg-rose-100/25',
            };

  const liquidHeight = clamp(percentage, 8, 100);
  const liquidTop = 100 - liquidHeight;

  return (
    <div
      onClick={onClick}
      className={`glass group relative flex min-h-[172px] cursor-pointer flex-col gap-5 overflow-hidden rounded-[2rem] border bg-[#020617]/55 p-5 transition-all sm:min-h-[196px] sm:p-6 lg:flex-row lg:items-center lg:gap-8 ${tone.border} ${tone.glow}`}
    >
      <div className={`pointer-events-none absolute right-[-34px] top-[-34px] h-32 w-32 rounded-full blur-2xl ${tone.shellGlow}`} />

      <div className="relative mx-auto flex h-[112px] w-[62px] shrink-0 items-center justify-center lg:mx-0">
        <div className="absolute top-0 h-3 w-7 rounded-t-lg bg-white/90 shadow-[0_4px_14px_rgba(255,255,255,0.14)]" />
        <div className="relative mt-2 h-[100px] w-[62px] overflow-hidden rounded-[1.15rem] border-[3px] border-white/85 bg-slate-950/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <motion.div
            className={`absolute inset-x-[3px] bottom-[3px] rounded-[0.85rem] bg-gradient-to-b ${tone.liquid}`}
            initial={false}
            animate={{ height: `calc(${liquidHeight}% - 3px)` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={`absolute left-[-18%] top-[-11px] h-6 w-[136%] rounded-[100%] ${tone.wave}`}
              animate={{ x: [-6, 8, -6], y: [0, -3, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-4 left-2 w-2.5 rounded-full bg-white/20"
              animate={{ height: ['26%', '52%', '34%'], opacity: [0.3, 0.65, 0.35] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-2 top-3 w-1.5 rounded-full bg-white/30"
              animate={{ height: ['12%', '30%', '16%'], opacity: [0.2, 0.55, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            />
          </motion.div>

          <div
            className="pointer-events-none absolute inset-x-[3px] rounded-[0.9rem] border border-white/6"
            style={{ top: `calc(${liquidTop}% + 3px)`, bottom: '3px' }}
          />
        </div>
      </div>

      <div className="flex-1 text-center lg:text-left">
        <div className="mb-2 flex items-center justify-center gap-2 lg:justify-start">
          <p className={`whitespace-nowrap text-[10px] font-black uppercase tracking-[0.22em] italic sm:text-[11px] ${tone.label}`}>
            Reste a vivre
          </p>
          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${tone.border} ${tone.label} bg-white/[0.03]`}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="mb-3 flex items-baseline justify-center gap-1.5 lg:justify-start">
          <h2 className="text-3xl font-black italic tracking-tighter text-white sm:text-4xl">
            {amount.toLocaleString()}
          </h2>
          <span className={`text-sm font-black italic uppercase ${tone.accent}`}>DH</span>
        </div>

        <div className="mx-auto mt-4 h-2 w-full max-w-[180px] overflow-hidden rounded-full border border-white/5 bg-slate-900/80 lg:mx-0">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tone.progress}`}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResteAVivreWidget;
