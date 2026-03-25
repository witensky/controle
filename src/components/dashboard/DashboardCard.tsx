import React, { memo, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { SparklineChart } from '../common/InlineCharts';

type DashboardCardTone = 'rose' | 'amber' | 'emerald' | 'blue';

type DashboardCardTrendPoint = {
  label: string;
  value: number;
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  tone: DashboardCardTone;
  index?: number;
  onClick?: () => void;
  trendData?: DashboardCardTrendPoint[];
  compact?: boolean;
  className?: string;
  featured?: boolean;
}

const TONE_STYLES: Record<
  DashboardCardTone,
  {
    shell: string;
    border: string;
    glow: string;
    iconShell: string;
    iconColor: string;
    valueColor: string;
    accentLine: string;
    sparkStroke: string;
    sparkFill: string;
  }
> = {
  rose: {
    shell: 'bg-[color:var(--card)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))]',
    border: 'border-rose-500/14 hover:border-rose-400/30',
    glow: 'hover:shadow-[0_24px_60px_rgba(244,63,94,0.14)]',
    iconShell: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    valueColor: 'text-[color:var(--text-primary)] dark:text-white',
    accentLine: 'from-rose-400/0 via-rose-400/75 to-rose-400/0',
    sparkStroke: '#f43f5e',
    sparkFill: '#f43f5e',
  },
  amber: {
    shell: 'bg-[color:var(--card)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))]',
    border: 'border-amber-500/14 hover:border-amber-400/30',
    glow: 'hover:shadow-[0_24px_60px_rgba(245,158,11,0.14)]',
    iconShell: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    valueColor: 'text-[color:var(--text-primary)] dark:text-white',
    accentLine: 'from-amber-400/0 via-amber-400/75 to-amber-400/0',
    sparkStroke: '#f59e0b',
    sparkFill: '#f59e0b',
  },
  emerald: {
    shell: 'bg-[color:var(--card)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))]',
    border: 'border-emerald-500/14 hover:border-emerald-400/30',
    glow: 'hover:shadow-[0_24px_60px_rgba(16,185,129,0.14)]',
    iconShell: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    valueColor: 'text-[color:var(--text-primary)] dark:text-white',
    accentLine: 'from-emerald-400/0 via-emerald-400/75 to-emerald-400/0',
    sparkStroke: '#10b981',
    sparkFill: '#10b981',
  },
  blue: {
    shell: 'bg-[color:var(--card)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))]',
    border: 'border-blue-500/14 hover:border-blue-400/30',
    glow: 'hover:shadow-[0_24px_60px_rgba(59,130,246,0.14)]',
    iconShell: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    valueColor: 'text-[color:var(--text-primary)] dark:text-white',
    accentLine: 'from-blue-400/0 via-blue-400/75 to-blue-400/0',
    sparkStroke: '#3b82f6',
    sparkFill: '#3b82f6',
  },
};

const extractAnimatedValueParts = (value: string | number) => {
  if (typeof value === 'number') {
    return {
      raw: value,
      animated: true,
      prefix: '',
      suffix: '',
      numericValue: value,
    };
  }

  const raw = String(value);
  const match = raw.match(/(-?[\d,.]+)/);

  if (!match) {
    return {
      raw,
      animated: false,
      prefix: '',
      suffix: '',
      numericValue: 0,
    };
  }

  const [numericChunk] = match;
  const numericValue = Number(numericChunk.replace(/,/g, ''));

  if (Number.isNaN(numericValue)) {
    return {
      raw,
      animated: false,
      prefix: '',
      suffix: '',
      numericValue: 0,
    };
  }

  return {
    raw,
    animated: true,
    prefix: raw.slice(0, match.index ?? 0),
    suffix: raw.slice((match.index ?? 0) + numericChunk.length),
    numericValue,
  };
};

const AnimatedMetric: React.FC<{ value: string | number; className?: string }> = ({ value, className }) => {
  const prefersReducedMotion = useReducedMotion();
  const parts = useMemo(() => extractAnimatedValueParts(value), [value]);
  const [displayValue, setDisplayValue] = useState(parts.animated ? 0 : parts.raw);

  useEffect(() => {
    if (!parts.animated) {
      setDisplayValue(parts.raw);
      return;
    }

    if (prefersReducedMotion) {
      setDisplayValue(parts.numericValue.toLocaleString('fr-FR'));
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 720;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(parts.numericValue * eased);

      setDisplayValue(next.toLocaleString('fr-FR'));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [parts, prefersReducedMotion]);

  if (!parts.animated) {
    return <span className={className}>{parts.raw}</span>;
  }

  return (
    <span className={className}>
      {parts.prefix}
      {displayValue}
      {parts.suffix}
    </span>
  );
};

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  index = 0,
  onClick,
  trendData,
  compact = false,
  className = '',
  featured = false,
}: DashboardCardProps) => {
  const styles = TONE_STYLES[tone];

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && onClick) {
          event.preventDefault();
          onClick();
        }
      }}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.65rem] border text-left transition-all duration-300 ${compact ? 'min-h-[84px] p-2.5 min-[430px]:min-h-[92px] min-[430px]:p-3 md:min-h-[98px] md:p-3.5' : featured ? 'min-h-[138px] p-4 md:min-h-[148px] md:p-5' : 'min-h-[112px] p-3.5 md:min-h-[122px] md:p-4'} ${styles.shell} ${styles.border} ${styles.glow} ${className}`}
    >
      <div className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${styles.accentLine}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_30%)] opacity-70" />
      {featured ? (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-95"
            style={{
              background:
                tone === 'emerald'
                  ? 'radial-gradient(circle at 18% 82%, rgba(16,185,129,0.34), transparent 30%), radial-gradient(circle at 82% 24%, rgba(20,184,166,0.18), transparent 22%), linear-gradient(135deg, rgba(5,46,34,0.86), rgba(6,78,59,0.34) 38%, rgba(3,10,26,0.9) 72%)'
                  : 'radial-gradient(circle at 18% 82%, rgba(255,255,255,0.12), transparent 30%), radial-gradient(circle at 82% 24%, rgba(255,255,255,0.08), transparent 22%), linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.4) 38%, rgba(2,6,23,0.92) 72%)',
              backgroundSize: '170% 170%',
            }}
            animate={{
              backgroundPosition: ['0% 45%', '100% 55%', '0% 45%'],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-[-12%] top-[34%] h-[92%] rounded-[46%] blur-3xl ${
              tone === 'emerald' ? 'bg-emerald-400/22' : 'bg-white/10'
            }`}
            animate={{
              x: ['-3%', '3%', '-3%'],
              y: ['0%', '-9%', '0%'],
              scaleX: [1, 1.08, 1],
            }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-[-8%] top-[40%] h-[78%] rounded-[42%] border border-[color:var(--border)] dark:border-white/6 ${
              tone === 'emerald' ? 'bg-emerald-300/12' : 'bg-white/8'
            }`}
            style={{
              clipPath: 'ellipse(70% 52% at 50% 48%)',
              filter: 'blur(1px)',
            }}
            animate={{
              x: ['2%', '-2%', '2%'],
              y: ['0%', '-6%', '0%'],
              rotate: [0, 1.25, 0],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : null}

      {trendData && trendData.length > 0 ? (
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 opacity-35 ${compact ? 'h-[40%] min-[430px]:h-[44%]' : 'h-[54%]'}`}>
          <SparklineChart
            data={trendData}
            stroke={styles.sparkStroke}
            fill={styles.sparkFill}
            showArea
            height={compact ? 56 : 90}
          />
        </div>
      ) : null}

      <div className={`relative z-10 flex h-full ${featured ? '' : 'flex-col justify-between'}`}>
        {featured ? (
          <>
            <div className={`absolute right-0 top-0 flex shrink-0 items-center justify-center rounded-xl border border-[color:var(--border)] dark:border-white/6 ${styles.iconShell} ${styles.iconColor} h-10 w-10`}>
              <Icon size={16} strokeWidth={2.2} />
            </div>

              <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center justify-center text-center">
              <p className="font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)] dark:text-slate-300/80 text-[9px] md:text-[10px]">
                {title}
              </p>
              <div className={`${subtitle ? 'space-y-2' : 'space-y-0'} mt-3 flex flex-col items-center justify-center`}>
                <AnimatedMetric
                  value={value}
                  className={`block translate-y-1 font-black italic leading-none tracking-[-0.06em] font-outfit drop-shadow-none dark:drop-shadow-[0_10px_22px_rgba(255,255,255,0.12)] text-[2.3rem] md:text-[2.7rem] ${styles.valueColor}`}
                />
                {subtitle ? (
                  <p className="font-bold uppercase italic leading-none tracking-[0.22em] text-[color:var(--text-secondary)] dark:text-slate-300/70 text-[9px]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className={`min-w-0 pr-1.5 font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] dark:text-slate-500 ${compact ? 'text-[7px] leading-[1.35] min-[430px]:pr-2 min-[430px]:text-[8px] md:text-[9px]' : 'text-[9px] md:text-[10px]'}`}>
                {title}
              </p>
              <div className={`flex shrink-0 items-center justify-center rounded-xl border border-[color:var(--border)] dark:border-white/6 ${styles.iconShell} ${styles.iconColor} ${compact ? 'h-6 w-6 min-[430px]:h-7 min-[430px]:w-7' : 'h-8 w-8'}`}>
                <Icon size={compact ? 11 : 14} strokeWidth={2.2} />
              </div>
            </div>

            <div className={`${subtitle ? 'space-y-1.5' : ''} ${compact ? 'mt-1 md:mt-1.5' : 'mt-2'}`}>
              <AnimatedMetric
                value={value}
                className={`block font-black italic leading-none tracking-[-0.06em] font-outfit drop-shadow-none dark:drop-shadow-[0_6px_18px_rgba(255,255,255,0.08)] ${compact ? 'text-[1.28rem] min-[430px]:text-[1.5rem] md:text-[1.7rem]' : 'text-[1.95rem] md:text-[2.15rem]'} ${styles.valueColor}`}
              />
              {subtitle ? (
                <p className={`font-bold uppercase italic leading-none tracking-[0.18em] text-[color:var(--text-secondary)] dark:text-slate-500 ${compact ? 'text-[7px] min-[430px]:text-[8px]' : 'text-[9px]'}`}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(DashboardCard);
