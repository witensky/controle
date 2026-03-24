import React, { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import useChartContainerSize from '../../hooks/useChartContainerSize';
import { formatChartNumber } from '../../utils/chartHelpers';

type GradientConfig = {
  start: string;
  end: string;
};

export interface RadialProgressChartProps {
  value?: number | null;
  max?: number | null;
  label?: string;
  color?: string;
  gradient?: GradientConfig;
  className?: string;
  theme?: 'dark' | 'light';
  showTooltip?: boolean;
  multiLayer?: boolean;
  showSurface?: boolean;
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const ProgressTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { percentage: number; displayValue: number; max: number } }>;
  label?: string;
}) => {
  if (!active || !payload?.[0]?.payload) return null;

  const { percentage, displayValue, max } = payload[0].payload;

  return (
    <div className="rounded-[1rem] border border-white/10 bg-[#020617]/95 px-4 py-3 text-white shadow-[0_18px_48px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-6">
        <span className="text-lg font-black italic">{Math.round(percentage)}%</span>
        <span className="text-[11px] font-bold text-slate-300">
          {formatChartNumber(displayValue)} / {formatChartNumber(max)}
        </span>
      </div>
    </div>
  );
};

const RadialProgressChart = ({
  value = 0,
  max = 100,
  label = 'Progression',
  color = '#f59e0b',
  gradient,
  className = '',
  theme = 'dark',
  showTooltip = true,
  multiLayer = true,
  showSurface = true,
}: RadialProgressChartProps) => {
  const safeMax = Number.isFinite(Number(max)) && Number(max) > 0 ? Number(max) : 100;
  const safeValue = clamp(Number.isFinite(Number(value)) ? Number(value) : 0, 0, safeMax);
  const targetPercentage = clamp((safeValue / safeMax) * 100, 0, 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const progressRef = useRef(0);
  const chartId = useId();

  useEffect(() => {
    let frame = 0;
    let startTime = 0;
    const from = progressRef.current;
    const to = targetPercentage;
    const duration = 950;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = clamp((timestamp - startTime) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      const nextValue = from + (to - from) * eased;

      progressRef.current = nextValue;
      setAnimatedPercentage(nextValue);

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [targetPercentage]);

  const animatedDisplayValue = useMemo(
    () => (animatedPercentage / 100) * safeMax,
    [animatedPercentage, safeMax],
  );

  const gradientStops = gradient ?? {
    start: color,
    end: theme === 'light' ? '#38bdf8' : '#facc15',
  };

  const data = useMemo(
    () => [
      {
        name: label,
        value: animatedPercentage,
        percentage: animatedPercentage,
        displayValue: animatedDisplayValue,
        max: safeMax,
      },
      {
        name: 'remaining',
        value: Math.max(100 - animatedPercentage, 0),
        percentage: animatedPercentage,
        displayValue: animatedDisplayValue,
        max: safeMax,
      },
    ],
    [animatedDisplayValue, animatedPercentage, label, safeMax],
  );

  const gradientId = `${chartId}-radial-gradient`;
  const glowId = `${chartId}-radial-glow`;
  const haloId = `${chartId}-radial-halo`;
  const { ref: chartRef, size, isReady } = useChartContainerSize<HTMLDivElement>();

  const surfaceClasses =
    theme === 'light'
      ? 'from-white via-slate-50 to-slate-100 text-slate-950'
      : 'from-[#020617] via-[#0b1121] to-[#111827] text-white';

  const trackFill = theme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(30, 41, 59, 0.42)';
  const centerLabelClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const captionClass = theme === 'light' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div
      className={`group relative isolate aspect-square min-h-[220px] w-full overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${showSurface ? `rounded-[2rem] bg-gradient-to-br p-5 ${surfaceClasses}` : ''} ${className}`.trim()}
      aria-label={`${label}: ${Math.round(targetPercentage)}%`}
    >
      {showSurface ? (
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-6 rounded-full border border-white/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_62%)]" />
        </div>
      ) : null}

      <div ref={chartRef} className="relative h-full w-full min-w-0">
        {isReady ? (
          <ResponsiveContainer width={Math.max(size.width, 1)} height={Math.max(size.height, 1)} minWidth={0} minHeight={1}>
            <PieChart>
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradientStops.start} />
                  <stop offset="100%" stopColor={gradientStops.end} />
                </linearGradient>

                <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 0.45 0"
                  />
                </filter>

                <linearGradient id={haloId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gradientStops.start} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={gradientStops.end} stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {showTooltip ? (
                <Tooltip
                  content={<ProgressTooltip label={label} />}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{ zIndex: 30 }}
                />
              ) : null}

              {multiLayer ? (
                <Pie
                  data={[{ name: 'halo', value: 100 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="79%"
                  outerRadius="85%"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill={`url(#${haloId})`} />
                </Pie>
              ) : null}

              <Pie
                data={[{ name: 'track', value: 100 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius="68%"
                outerRadius="82%"
                stroke="none"
                isAnimationActive={false}
                cornerRadius={24}
              >
                <Cell fill={trackFill} />
              </Pie>

              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius="68%"
                outerRadius="82%"
                paddingAngle={0}
                stroke="none"
                cornerRadius={24}
                isAnimationActive={false}
              >
                <Cell fill={`url(#${gradientId})`} filter={`url(#${glowId})`} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div
            className={`flex h-[52%] w-[52%] flex-col items-center justify-center rounded-full px-4 text-center backdrop-blur-xl transition-all duration-300 group-hover:scale-[1.03] ${
              showSurface
                ? 'border border-white/6 bg-[linear-gradient(180deg,rgba(2,6,23,0.78),rgba(15,23,42,0.72))]'
                : 'border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.9))] shadow-[0_12px_40px_rgba(2,6,23,0.45)]'
            }`}
          >
            <span className="animate-in fade-in duration-500 text-4xl font-black italic tracking-tight sm:text-5xl">
              {Math.round(animatedPercentage)}%
            </span>
            <span className={`mt-2 text-[10px] font-black uppercase tracking-[0.3em] ${centerLabelClass}`}>
              {label}
            </span>
            <span className={`mt-1.5 text-[11px] font-bold ${captionClass}`}>
              {formatChartNumber(animatedDisplayValue)} / {formatChartNumber(safeMax)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RadialProgressChart);
