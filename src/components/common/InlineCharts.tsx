import React from 'react';
import { chartPalette, chartToneByIntent } from '../../theme/tokens';

type ValuePoint = {
  label: string;
  value: number;
};

type MultiLinePoint = {
  label: string;
  [key: string]: string | number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const buildPoints = (values: number[], width: number, height: number, padding: number) => {
  if (values.length === 0) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

const buildAreaPath = (points: string, width: number, height: number, padding: number) => {
  if (!points) return '';
  const pointList = points.split(' ');
  return `M${pointList[0]} L${pointList.join(' L')} L${width - padding},${height - padding} L${padding},${height - padding} Z`;
};

export const SparklineChart: React.FC<{
  data: ValuePoint[];
  stroke: string;
  fill?: string;
  showArea?: boolean;
  showDots?: boolean;
  height?: number;
}> = ({ data, stroke, fill, showArea = false, showDots = false, height = 180 }) => {
  const width = 420;
  const padding = 16;
  const values = data.map((item) => Number(item.value || 0));
  const points = buildPoints(values, width, height, padding);
  const areaPath = buildAreaPath(points, width, height, padding);

  if (data.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
      {showArea && areaPath ? <path d={areaPath} fill={fill || `${stroke}22`} opacity={0.45} /> : null}
      <polyline fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
      {showDots
        ? points.split(' ').map((point) => {
            const [cx, cy] = point.split(',');
            return <circle key={point} cx={cx} cy={cy} r="4" fill={stroke} stroke="var(--surface-elevated)" strokeWidth="2" />;
          })
        : null}
    </svg>
  );
};

export const DualSparklineChart: React.FC<{
  data: MultiLinePoint[];
  lines: { key: string; color: string }[];
  height?: number;
}> = ({ data, lines, height = 120 }) => {
  if (data.length === 0 || lines.length === 0) return null;

  const width = 420;
  const padding = 12;
  const allValues = data.flatMap((item) => lines.map((line) => Number(item[line.key] || 0)));
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 1);
  const range = max - min || 1;

  const makePoints = (key: string) =>
    data
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const value = Number(item[key] || 0);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

  const makeAreaPath = (key: string) => {
    const points = makePoints(key);
    if (!points) return '';
    const pointList = points.split(' ');
    return `M${pointList[0]} L${pointList.join(' L')} L${width - padding},${height - padding} L${padding},${height - padding} Z`;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
      <defs>
        {lines.map((line) => (
          <linearGradient key={line.key} id={`dual-gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={line.color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={line.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0.25, 0.5, 0.75].map((stop) => {
        const y = padding + ((height - padding * 2) * stop);
        return (
          <line
            key={stop}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            stroke="var(--chart-grid)"
            strokeDasharray="4 6"
          />
        );
      })}

      {lines.map((line) => (
        <g key={line.key}>
          <path d={makeAreaPath(line.key)} fill={`url(#dual-gradient-${line.key})`} />
          <polyline
            fill="none"
            stroke={line.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={makePoints(line.key)}
          />
          {makePoints(line.key).split(' ').map((point, index, points) => {
            const [cx, cy] = point.split(',');
            const isLast = index === points.length - 1;
            const radius = isLast ? 5 : 3;
            return (
              <circle
                key={`${line.key}-${point}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill={line.color}
                fillOpacity={isLast ? 1 : 0.65}
                stroke="var(--surface-elevated)"
                strokeWidth={isLast ? 2.5 : 1.5}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export const VerticalBarsChart: React.FC<{
  data: ValuePoint[];
  colors?: string[];
}> = ({ data, colors = [chartToneByIntent.info] }) => {
  const maxValue = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="flex h-full items-end justify-between gap-3">
      {data.map((item, index) => {
        const height = `${clamp((Number(item.value || 0) / maxValue) * 100, 6, 100)}%`;
        return (
          <div key={`${item.label}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div className="flex-1 rounded-t-2xl bg-[color:var(--surface-2)] relative overflow-hidden border border-[color:var(--border)]">
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-2xl"
                style={{ height, background: colors[index % colors.length] }}
              />
            </div>
            <span className="truncate text-center text-[8px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export const HorizontalBarsChart: React.FC<{
  data: ValuePoint[];
  getColor?: (item: ValuePoint, index: number) => string;
}> = ({ data, getColor = (_, index) => chartPalette[index % chartPalette.length] }) => {
  const maxValue = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="flex h-full flex-col justify-start gap-3 pt-1">
      {data.map((item, index) => (
        <div key={`${item.label}-${index}`} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">{item.label}</span>
            <span className="text-[10px] font-black italic text-[color:var(--text-primary)]">{Number(item.value || 0).toLocaleString()}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[color:var(--muted)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${clamp((Number(item.value || 0) / maxValue) * 100, 4, 100)}%`,
                background: getColor(item, index),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StackedBarsChart: React.FC<{
  data: Array<Record<string, number | string>>;
  valueKeys: string[];
  colors: string[];
  labelKey: string;
}> = ({ data, valueKeys, colors, labelKey }) => {
  const totals = data.map((row) => valueKeys.reduce((sum, key) => sum + Number(row[key] || 0), 0));
  const maxTotal = Math.max(...totals, 1);
  const peakIndex = totals.findIndex((total) => total === maxTotal);

  return (
    <div className="relative flex h-full items-end justify-between gap-2 sm:gap-3">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7">
        {[0.25, 0.5, 0.75].map((stop) => (
          <div key={stop} className="border-t border-dashed border-[color:var(--border)]" />
        ))}
      </div>
      {data.map((row, rowIndex) => {
        const total = totals[rowIndex];
        const columnHeight = total > 0 ? clamp((total / maxTotal) * 100, 14, 100) : 0;
        const isPeak = rowIndex === peakIndex && total > 0;
        const isLatest = rowIndex === data.length - 1;

        return (
          <div key={`${row[labelKey]}-${rowIndex}`} className="relative flex h-full flex-1 flex-col justify-end gap-2">
            <div className="flex min-h-[20px] items-end justify-center">
              {total > 0 ? (
                <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] ${isPeak ? 'bg-blue-500/18 text-blue-600 dark:text-blue-200' : 'text-[color:var(--text-muted)]'}`}>
                  {total.toLocaleString()}
                </span>
              ) : null}
            </div>
            <div className={`relative flex-1 overflow-hidden rounded-[1.35rem] border ${isPeak ? 'border-blue-400/30 bg-[color:var(--surface-2)] shadow-[0_0_30px_rgba(59,130,246,0.12)]' : 'border-[color:var(--border)] bg-[color:var(--surface-2)]'}`}>
              <div className="absolute inset-x-2 top-3 h-8 rounded-full bg-white/[0.03] blur-xl" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-[1.15rem]" style={{ height: `${columnHeight}%` }}>
                {valueKeys.map((key, keyIndex) => {
                  const value = Number(row[key] || 0);
                  const percentage = total > 0 ? (value / total) * 100 : 0;

                  if (value <= 0) return null;

                  return (
                    <div
                      key={`${String(row[labelKey])}-${key}`}
                      className="relative"
                      style={{
                        height: `${percentage}%`,
                        background: colors[keyIndex % colors.length],
                        boxShadow: keyIndex === 0 ? 'inset 0 1px 0 rgba(255,255,255,0.14)' : undefined,
                      }}
                    />
                  );
                })}
              </div>
              {isPeak ? (
                <div className="pointer-events-none absolute inset-x-[22%] top-5 h-10 rounded-full bg-blue-300/20 blur-2xl" />
              ) : null}
            </div>
            <span className={`truncate text-center text-[8px] font-black uppercase tracking-widest ${isLatest ? 'text-blue-600 dark:text-blue-300' : 'text-[color:var(--text-muted)]'}`}>
              {String(row[labelKey] || '')}
            </span>
          </div>
        );
      })}
    </div>
  );
};
