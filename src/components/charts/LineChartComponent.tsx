import React, { memo, useId } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartConfig } from '../../hooks/useChartConfig';
import { ChartRecord, PRIMARY_CHART_AXIS_ID, createGradientId } from '../../utils/chartHelpers';
import BaseChart from './BaseChart';
import ChartTooltipContent from './ChartTooltipContent';

type LineSeries = {
  key: string;
  label?: string;
  color: string;
  type?: 'monotone' | 'linear' | 'stepAfter';
  strokeWidth?: number;
  dashed?: boolean;
  showDots?: boolean;
};

interface LineChartComponentProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  xKey: string;
  series: LineSeries[];
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  tooltipLabelFormatter?: (value: string | number | undefined) => string;
  tooltipValueFormatter?: (value: string | number | undefined, key: string) => string;
  yDomain?: [number, number] | ['auto', 'auto'];
  hideYAxis?: boolean;
}

function LineChartComponent<T extends ChartRecord>({
  data,
  xKey,
  series,
  emptyMessage,
  fallbackTitle,
  minHeightClassName,
  heightClassName,
  xTickFormatter,
  yTickFormatter,
  tooltipLabelFormatter,
  tooltipValueFormatter,
  yDomain,
  hideYAxis = false,
}: LineChartComponentProps<T>) {
  const config = useChartConfig(series.map((entry) => entry.color));
  const chartId = useId();

  return (
    <BaseChart
      data={data}
      emptyMessage={emptyMessage}
      fallbackTitle={fallbackTitle}
      minHeightClassName={minHeightClassName}
      heightClassName={heightClassName}
    >
      {(safeData) => (
        <LineChart data={safeData} margin={config.margin}>
          <defs>
            {series.map((entry) => (
              <linearGradient key={entry.key} id={createGradientId(chartId, entry.key)} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.45} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid {...config.grid} />
          <XAxis
            dataKey={xKey}
            xAxisId={PRIMARY_CHART_AXIS_ID}
            {...config.xAxis}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            yAxisId={PRIMARY_CHART_AXIS_ID}
            {...config.yAxis}
            domain={yDomain}
            hide={hideYAxis}
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            cursor={config.tooltipCursor}
            content={(
              <ChartTooltipContent
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />

          {series.map((entry) => (
            <Line
              key={entry.key}
              xAxisId={PRIMARY_CHART_AXIS_ID}
              yAxisId={PRIMARY_CHART_AXIS_ID}
              type={entry.type ?? 'monotone'}
              dataKey={entry.key}
              name={entry.label ?? entry.key}
              stroke={entry.color}
              strokeWidth={entry.strokeWidth ?? 3}
              dot={entry.showDots ? { r: 3, fill: entry.color, stroke: '#020617', strokeWidth: 2 } : false}
              activeDot={{ r: 5, stroke: '#e2e8f0', strokeWidth: 2, fill: entry.color }}
              strokeDasharray={entry.dashed ? '5 5' : undefined}
              animationDuration={config.animation.duration}
              animationBegin={config.animation.begin}
            />
          ))}
        </LineChart>
      )}
    </BaseChart>
  );
}

export default memo(LineChartComponent) as typeof LineChartComponent;
