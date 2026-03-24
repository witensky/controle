import { useMemo } from 'react';
import {
  ChartPeriod,
  ChartRecord,
  aggregateChartDataByPeriod,
  sanitizeChartData,
} from '../utils/chartHelpers';

export const useChartData = <T extends ChartRecord>(
  data: T[] | null | undefined,
  {
    dateKey,
    valueKeys,
    period,
    labelKey,
  }: {
    dateKey?: string;
    valueKeys?: string[];
    period?: ChartPeriod;
    labelKey?: string;
  } = {},
) =>
  useMemo(() => {
    const safeData = sanitizeChartData(data);

    if (!dateKey || !valueKeys?.length || !period) {
      return safeData;
    }

    return aggregateChartDataByPeriod(safeData, {
      dateKey,
      valueKeys,
      period,
      labelKey,
    });
  }, [data, dateKey, labelKey, period, valueKeys]);
