import React, { memo } from 'react';
import { ResponsiveContainer } from 'recharts';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import useChartContainerSize from '../../hooks/useChartContainerSize';
import { ChartRecord, sanitizeChartData } from '../../utils/chartHelpers';
import EmptyChartState from './EmptyChartState';

interface BaseChartProps<T extends ChartRecord> {
  data: T[] | null | undefined;
  emptyMessage: string;
  fallbackTitle?: string;
  minHeightClassName?: string;
  heightClassName?: string;
  resetKey?: string | number | boolean | null;
  children: (data: T[]) => React.ReactNode;
}

function BaseChartComponent<T extends ChartRecord>({
  data,
  emptyMessage,
  fallbackTitle,
  minHeightClassName = 'min-h-[220px]',
  heightClassName = 'h-[220px]',
  resetKey,
  children,
}: BaseChartProps<T>) {
  const safeData = sanitizeChartData(data);
  const { ref, size, isReady } = useChartContainerSize<HTMLDivElement>();

  if (safeData.length === 0) {
    return <EmptyChartState message={emptyMessage} minHeightClassName={minHeightClassName} />;
  }

  return (
    <ChartErrorBoundary
      fallbackTitle={fallbackTitle}
      minHeightClassName={minHeightClassName}
      resetKey={resetKey ?? safeData.length}
    >
      <div ref={ref} className={`${heightClassName} min-w-0`} style={{ minHeight: 1 }}>
        {isReady ? (
          <ResponsiveContainer width={size.width} height={size.height} minWidth={0} minHeight={1}>
            {children(safeData)}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full min-h-[1px]" />
        )}
      </div>
    </ChartErrorBoundary>
  );
}

const BaseChart = memo(BaseChartComponent) as typeof BaseChartComponent;

export default BaseChart;
