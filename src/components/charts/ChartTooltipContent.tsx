import React from 'react';
import { formatChartNumber } from '../../utils/chartHelpers';

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: string | number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  labelFormatter?: (label: string | number | undefined) => string;
  valueFormatter?: (value: string | number | undefined, key: string) => string;
}

const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip min-w-[180px] rounded-[1.25rem] border border-white/10 bg-[#020617]/96 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        {labelFormatter ? labelFormatter(label) : label}
      </p>

      <div className="space-y-2.5">
        {payload.map((entry) => {
          const labelText = String(entry.name ?? entry.dataKey ?? 'Valeur');
          const formattedValue = valueFormatter
            ? valueFormatter(entry.value, labelText)
            : formatChartNumber(entry.value);

          return (
            <div key={`${labelText}-${entry.dataKey}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_currentColor]"
                  style={{ backgroundColor: entry.color ?? '#38bdf8', color: entry.color ?? '#38bdf8' }}
                />
                {labelText}
              </span>
              <span className="text-sm font-black italic text-white">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltipContent;
