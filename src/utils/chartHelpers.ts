export type ChartRecord = Record<string, string | number | null | undefined>;
export type ChartPeriod = 'day' | 'week' | 'month';
export const PRIMARY_CHART_AXIS_ID = 'primary-axis';

const FR_LOCALE = 'fr-FR';

const toDate = (value: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const sanitizeChartData = <T extends ChartRecord>(data: T[] | null | undefined) =>
  Array.isArray(data) ? data.filter(Boolean) : [];

export const hasChartData = <T extends ChartRecord>(data: T[] | null | undefined) => sanitizeChartData(data).length > 0;

export const formatChartNumber = (value: unknown, options?: Intl.NumberFormatOptions) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return '--';

  return new Intl.NumberFormat(FR_LOCALE, {
    maximumFractionDigits: 0,
    ...options,
  }).format(numericValue);
};

export const formatChartCurrency = (value: unknown, currency = 'DH') => {
  const formatted = formatChartNumber(value);
  return formatted === '--' ? formatted : `${formatted} ${currency}`;
};

export const createGradientId = (prefix: string, key: string) =>
  `${prefix}-${key}`.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

export const getChartDomain = <T extends ChartRecord>(
  data: T[] | null | undefined,
  keys: string[],
  padding = 0,
): [number, number] => {
  const values = sanitizeChartData(data)
    .flatMap((entry) => keys.map((key) => Number(entry[key] ?? 0)))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return [0, 100];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const delta = Math.max(1, Math.abs(min) * 0.15);
    return [Math.floor(min - delta), Math.ceil(max + delta)];
  }

  return [Math.floor(min - padding), Math.ceil(max + padding)];
};

export const aggregateChartDataByPeriod = <T extends ChartRecord>(
  data: T[] | null | undefined,
  {
    dateKey,
    valueKeys,
    period,
    labelKey = 'label',
  }: {
    dateKey: string;
    valueKeys: string[];
    period: ChartPeriod;
    labelKey?: string;
  },
) => {
  const safeData = sanitizeChartData(data);

  if (period === 'day') {
    return safeData.map((entry) => {
      const date = toDate(entry[dateKey]);
      return {
        ...entry,
        [labelKey]:
          entry[labelKey] ??
          (date ? date.toLocaleDateString(FR_LOCALE, { day: '2-digit', month: 'short' }) : String(entry[dateKey] ?? '')),
      };
    });
  }

  const grouped = new Map<
    string,
    {
      date: Date;
      label: string;
      values: Record<string, number>;
    }
  >();

  safeData.forEach((entry) => {
    const date = toDate(entry[dateKey]);
    if (!date) return;

    let bucketKey = '';
    let label = '';

    if (period === 'week') {
      const start = new Date(date);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      bucketKey = start.toISOString();
      label = `${start.toLocaleDateString(FR_LOCALE, { day: '2-digit', month: 'short' })}`;
    } else {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      bucketKey = start.toISOString();
      label = start.toLocaleDateString(FR_LOCALE, { month: 'short', year: '2-digit' });
    }

    const current = grouped.get(bucketKey) ?? {
      date,
      label,
      values: Object.fromEntries(valueKeys.map((key) => [key, 0])),
    };

    valueKeys.forEach((key) => {
      current.values[key] += Number(entry[key] ?? 0);
    });

    grouped.set(bucketKey, current);
  });

  return Array.from(grouped.values())
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .map((group) => ({
      [dateKey]: group.date.toISOString(),
      [labelKey]: group.label,
      ...group.values,
    })) as Array<T & Record<string, string | number>>;
};

export const mergeChartDatasets = <
  TPrimary extends ChartRecord,
  TSecondary extends ChartRecord,
>(
  primary: TPrimary[] | null | undefined,
  secondary: TSecondary[] | null | undefined,
  key: string,
) => {
  const merged = new Map<string, ChartRecord>();
  const order: string[] = [];

  [...sanitizeChartData(primary), ...sanitizeChartData(secondary)].forEach((entry) => {
    const entryKey = String(entry[key] ?? '');
    if (!entryKey) return;

    if (!merged.has(entryKey)) {
      merged.set(entryKey, { [key]: entryKey });
      order.push(entryKey);
    }

    merged.set(entryKey, {
      ...merged.get(entryKey),
      ...entry,
    });
  });

  return order.map((entryKey) => merged.get(entryKey) ?? { [key]: entryKey });
};
