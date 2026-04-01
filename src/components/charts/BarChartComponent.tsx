import React, { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartConfig } from '../../hooks/useChartConfig';
import { ChartRecord, PRIMARY_CHART_AXIS_ID } from '../../utils/chartHelpers';
import BaseChart from './BaseChart';
import ChartTooltipContent from './ChartTooltipContent';

type BarSeries = {
  key: string;
  label?: string;
  color: string;
  radius?: [number, number, number, number];
  stackId?: string;
};

interface BarChartComponentProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  xKey: string;
  series: BarSeries[];
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  tooltipLabelFormatter?: (value: string | number | undefined) => string;
  tooltipValueFormatter?: (value: string | number | undefined, key: string) => string;
  hideYAxis?: boolean;
  barSize?: number;
  activeIndex?: number | null;
}

function BarChartComponent<T extends ChartRecord>({
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
  barSize,
  activeIndex,
}: BarChartComponentProps<T>) {
  const config = useChartConfig(series.map((entry) => entry.color));

  return (
    <BaseChart
      data={data}
      emptyMessage={emptyMessage}
      fallbackTitle={fallbackTitle}
      minHeightClassName={minHeightClassName}
      heightClassName={heightClassName}
    >
      {(safeData) => (
        <BarChart data={safeData} margin={config.margin}>
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
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            content={(
              <ChartTooltipContent
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />

          {series.map((entry) => (
            <Bar
              key={entry.key}
              xAxisId={PRIMARY_CHART_AXIS_ID}
              yAxisId={PRIMARY_CHART_AXIS_ID}
              dataKey={entry.key}
              name={entry.label ?? entry.key}
              fill={entry.color}
              radius={entry.radius ?? [10, 10, 0, 0]}
              barSize={barSize}
              stackId={entry.stackId}
              animationDuration={config.animation.duration}
              animationBegin={config.animation.begin}
            >
              {activeIndex !== undefined && activeIndex !== null
                ? safeData.map((_, index) => (
                    <Cell
                      key={`${entry.key}-${index}`}
                      fill={entry.color}
                      fillOpacity={index === activeIndex ? 1 : 0.45}
                    />
                  ))
                : null}
            </Bar>
          ))}
        </BarChart>
      )}
    </BaseChart>
  );
}

export default memo(BarChartComponent) as typeof BarChartComponent;
