import React, { memo } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from 'recharts';
import { ChartRecord } from '../../utils/chartHelpers';
import BaseChart from './BaseChart';
import ChartTooltipContent from './ChartTooltipContent';

interface RadarChartComponentProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  angleKey: string;
  valueKey: string;
  color: string;
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
}

function RadarChartComponent<T extends ChartRecord>({
  data,
  angleKey,
  valueKey,
  color,
  emptyMessage,
  fallbackTitle,
  minHeightClassName,
  heightClassName,
}: RadarChartComponentProps<T>) {
  return (
    <BaseChart
      data={data}
      emptyMessage={emptyMessage}
      fallbackTitle={fallbackTitle}
      minHeightClassName={minHeightClassName}
      heightClassName={heightClassName}
    >
      {(safeData) => (
        <RadarChart data={safeData} cx="50%" cy="50%" outerRadius="76%">
          <PolarGrid stroke="rgba(148, 163, 184, 0.16)" />
          <PolarAngleAxis dataKey={angleKey} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
          <Tooltip content={<ChartTooltipContent />} />
          <Radar dataKey={valueKey} stroke={color} fill={color} fillOpacity={0.28} strokeWidth={3} />
        </RadarChart>
      )}
    </BaseChart>
  );
}

export default memo(RadarChartComponent) as typeof RadarChartComponent;
