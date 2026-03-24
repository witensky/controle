import React, { memo, useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartConfig } from '../../hooks/useChartConfig';
import { ChartRecord, PRIMARY_CHART_AXIS_ID, createGradientId } from '../../utils/chartHelpers';
import BaseChart from './BaseChart';
import ChartTooltipContent from './ChartTooltipContent';

type AreaSeries = {
  key: string;
  label?: string;
  color: string;
  type?: 'monotone' | 'linear' | 'stepAfter';
  opacity?: number;
  stackId?: string;
  strokeWidth?: number;
};

interface AreaChartComponentProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  xKey: string;
  series: AreaSeries[];
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  tooltipLabelFormatter?: (value: string | number | undefined) => string;
  tooltipValueFormatter?: (value: string | number | undefined, key: string) => string;
  hideYAxis?: boolean;
  yDomain?: [number, number] | ['auto', 'auto'];
}

function AreaChartComponent<T extends ChartRecord>({
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
  hideYAxis = false,
  yDomain,
}: AreaChartComponentProps<T>) {
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
        <AreaChart data={safeData} margin={config.margin}>
          <defs>
            {series.map((entry) => (
              <linearGradient key={entry.key} id={createGradientId(chartId, entry.key)} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={entry.opacity ?? 0.34} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.02} />
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
            hide={hideYAxis}
            domain={yDomain}
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
            <Area
              key={entry.key}
              xAxisId={PRIMARY_CHART_AXIS_ID}
              yAxisId={PRIMARY_CHART_AXIS_ID}
              type={entry.type ?? 'monotone'}
              dataKey={entry.key}
              name={entry.label ?? entry.key}
              stroke={entry.color}
              fill={`url(#${createGradientId(chartId, entry.key)})`}
              fillOpacity={1}
              strokeWidth={entry.strokeWidth ?? 3}
              stackId={entry.stackId}
              activeDot={{ r: 5, stroke: '#e2e8f0', strokeWidth: 2, fill: entry.color }}
              animationDuration={config.animation.duration}
              animationBegin={config.animation.begin}
            />
          ))}
        </AreaChart>
      )}
    </BaseChart>
  );
}

export default memo(AreaChartComponent) as typeof AreaChartComponent;
