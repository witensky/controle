import React, { memo, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { SparklineChart } from '../common/InlineCharts';
import { dashboardToneTokens } from '../../theme/tokens';
import { cx } from '../../theme/recipes';

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

const RTL_SCRIPT_REGEX = /[\u0590-\u08FF]/;

const extractAnimatedValueParts = (value: string | number) => {
  if (typeof value === 'number') {
    return { raw: value, animated: true, prefix: '', suffix: '', numericValue: value };
  }

  const raw = String(value);
  const match = raw.match(/(-?[\d,.]+)/);
  if (!match) return { raw, animated: false, prefix: '', suffix: '', numericValue: 0 };

  const numericChunk = match[0];
  const numericValue = Number(numericChunk.replace(/,/g, ''));
  if (Number.isNaN(numericValue)) return { raw, animated: false, prefix: '', suffix: '', numericValue: 0 };

  return {
    raw,
    animated: true,
    prefix: raw.slice(0, match.index ?? 0),
    suffix: raw.slice((match.index ?? 0) + numericChunk.length),
    numericValue,
  };
};

const containsRtlScript = (...values: Array<string | number | undefined>) =>
  values.some((value) => RTL_SCRIPT_REGEX.test(String(value ?? '')));

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

      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [parts, prefersReducedMotion]);

  if (!parts.animated) return <span className={className}>{parts.raw}</span>;

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
  const styles = dashboardToneTokens[tone];
  const isRtlContent = containsRtlScript(title, subtitle, value);
  const textAlignClass = isRtlContent ? 'text-right' : 'text-left';
  const compactRowClass = isRtlContent ? 'flex-row-reverse' : '';

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
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      dir={isRtlContent ? 'rtl' : 'ltr'}
      className={cx(
        'group relative cursor-pointer overflow-hidden rounded-[1.65rem] border transition-all duration-300 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-md)]',
        textAlignClass,
        compact
          ? 'min-h-[92px] p-3 min-[430px]:min-h-[98px] min-[430px]:p-3.5 md:min-h-[104px] md:p-4'
          : featured
            ? 'min-h-[138px] p-4 md:min-h-[148px] md:p-5'
            : 'min-h-[118px] p-4 md:min-h-[126px] md:p-4.5',
        styles.card,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-strong)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_32%)] opacity-70" />

      {featured ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
      ) : null}

      {trendData && trendData.length > 0 ? (
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 opacity-30 ${compact ? 'h-[40%] min-[430px]:h-[44%]' : 'h-[54%]'}`}>
          <SparklineChart
            data={trendData}
            stroke={styles.spark}
            fill={styles.spark}
            showArea
            height={compact ? 56 : 90}
          />
        </div>
      ) : null}

      <div className={`relative z-10 flex h-full ${featured ? '' : 'flex-col justify-between'}`}>
        {featured ? (
          <>
            <div className={`absolute ${isRtlContent ? 'left-0' : 'right-0'} top-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border ${styles.iconShell} ${styles.icon}`}>
              <Icon size={16} strokeWidth={2.2} />
            </div>

            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--text-secondary)] md:text-[10px]">
                  {title}
                </p>
                <div className={`${subtitle ? 'space-y-2' : 'space-y-0'} mt-3 flex flex-col items-center justify-center`}>
                  <AnimatedMetric
                    value={value}
                    className="block translate-y-1 font-outfit text-[2.3rem] font-black italic leading-none tracking-[-0.06em] text-[color:var(--heading)] drop-shadow-[0_12px_24px_rgba(17,24,39,0.12)] md:text-[2.7rem]"
                  />
                  {subtitle ? (
                    <p className="text-[9px] font-bold uppercase italic leading-none tracking-[0.22em] text-[color:var(--text-secondary)]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col justify-between">
            <div className={`flex items-start justify-between gap-3 ${compactRowClass}`}>
              <p
                className={`min-w-0 font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] ${isRtlContent ? 'pl-1.5 min-[430px]:pl-2' : 'pr-1.5 min-[430px]:pr-2'} ${compact ? 'text-[7px] leading-[1.55] min-[430px]:text-[8px] md:text-[9px]' : 'text-[9px] md:text-[10px]'}`}
              >
                {title}
              </p>
              <div className={`flex shrink-0 items-center justify-center rounded-[0.95rem] border ${styles.iconShell} ${styles.icon} ${compact ? 'h-7 w-7 min-[430px]:h-8 min-[430px]:w-8' : 'h-8 w-8'} shadow-sm`}>
                <Icon size={compact ? 11 : 14} strokeWidth={2.2} />
              </div>
            </div>

            <div className={`${subtitle ? 'space-y-2' : ''} ${compact ? 'mt-2 md:mt-2.5' : 'mt-2.5'}`}>
              <AnimatedMetric
                value={value}
                className={`block font-outfit font-black italic leading-none tracking-[-0.045em] text-[color:var(--heading)] ${compact ? 'text-[1.35rem] min-[430px]:text-[1.56rem] md:text-[1.76rem]' : 'text-[1.95rem] md:text-[2.15rem]'}`}
              />
              {subtitle ? (
                <p className={`font-bold uppercase italic leading-[1.35] tracking-[0.12em] text-[color:var(--text-secondary)] ${compact ? 'text-[7px] min-[430px]:text-[8px]' : 'text-[9px]'}`}>
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
