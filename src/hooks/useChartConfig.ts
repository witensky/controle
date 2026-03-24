import { useMemo } from 'react';

export const DEFAULT_CHART_PALETTE = ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e', '#a78bfa', '#f97316'];

export const useChartConfig = (palette: string[] = DEFAULT_CHART_PALETTE) =>
  useMemo(
    () => ({
      palette,
      margin: { top: 12, right: 12, bottom: 0, left: 0 },
      grid: {
        stroke: 'rgba(148, 163, 184, 0.12)',
        strokeDasharray: '3 3',
        vertical: false,
      },
      xAxis: {
        axisLine: false,
        tickLine: false,
        minTickGap: 24,
        tick: { fill: '#64748b', fontSize: 10, fontWeight: 700 },
      },
      yAxis: {
        axisLine: false,
        tickLine: false,
        tick: { fill: '#64748b', fontSize: 10, fontWeight: 700 },
      },
      tooltipCursor: {
        stroke: 'rgba(148, 163, 184, 0.24)',
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
