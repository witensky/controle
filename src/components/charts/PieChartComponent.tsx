import React, { memo, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { DEFAULT_CHART_PALETTE } from '../../hooks/useChartConfig';
import { ChartRecord, formatChartNumber } from '../../utils/chartHelpers';
import BaseChart from './BaseChart';
import ChartTooltipContent from './ChartTooltipContent';

interface PieChartComponentProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  dataKey: string;
  nameKey: string;
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  valueFormatter?: (value: string | number | undefined, key: string) => string;
}

function PieChartComponent<T extends ChartRecord>({
  data,
  dataKey,
  nameKey,
  emptyMessage,
  fallbackTitle,
  minHeightClassName,
  heightClassName,
  innerRadius = 62,
  outerRadius = 92,
  colors = DEFAULT_CHART_PALETTE,
  valueFormatter,
}: PieChartComponentProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') || document.documentElement.dataset.theme === 'dark');

  const total = useMemo(
    () =>
      (Array.isArray(data) ? data : []).reduce(
        (sum, entry) => sum + Number(entry?.[dataKey] ?? 0),
        0,
      ),
    [data, dataKey],
  );

  return (
    <BaseChart
      data={data}
      emptyMessage={emptyMessage}
      fallbackTitle={fallbackTitle}
      minHeightClassName={minHeightClassName}
      heightClassName={heightClassName}
    >
      {(safeData) => (
        <PieChart>
          <Tooltip
            content={(
              <ChartTooltipContent
                valueFormatter={valueFormatter}
              />
            )}
          />
          <Pie
            data={safeData}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            stroke="none"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {safeData.map((entry, index) => (
              <Cell
                key={`${String(entry[nameKey])}-${index}`}
                fill={colors[index % colors.length]}
                fillOpacity={index === activeIndex ? 1 : 0.82}
              />
            ))}
          </Pie>
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDark ? 'var(--text-secondary)' : 'var(--text-muted)'}
            className="text-[10px] font-black uppercase tracking-[0.24em]"
          >
            Total
          </text>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDark ? 'var(--heading)' : 'var(--heading)'}
            className="text-2xl font-black italic"
          >
            {formatChartNumber(total)}
          </text>
        </PieChart>
      )}
    </BaseChart>
  );
}

export default memo(PieChartComponent) as typeof PieChartComponent;
