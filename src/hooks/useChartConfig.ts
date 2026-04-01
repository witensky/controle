import { useMemo } from 'react';
import { chartPalette } from '../theme/tokens';

export const DEFAULT_CHART_PALETTE = [...chartPalette];

export const useChartConfig = (palette: string[] = DEFAULT_CHART_PALETTE) =>
  useMemo(
    () => ({
      palette,
      margin: { top: 12, right: 12, bottom: 0, left: 0 },
      grid: {
        stroke: 'var(--chart-grid)',
        strokeDasharray: '3 3',
        vertical: false,
      },
      xAxis: {
        axisLine: false,
        tickLine: false,
        minTickGap: 24,
        tick: { fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 },
      },
      yAxis: {
        axisLine: false,
        tickLine: false,
        tick: { fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 },
      },
      tooltipCursor: {
        stroke: 'var(--chart-cursor)',
        strokeWidth: 1.5,
      },
      animation: {
        duration: 650,
        begin: 80,
      },
      periodOptions: [
        { id: 'day', label: 'Jour' },
        { id: 'week', label: 'Semaine' },
        { id: 'month', label: 'Mois' },
      ] as const,
    }),
    [palette],
  );
