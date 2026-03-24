export type FinanceResetRecurrence = 'monthly' | 'custom';

const toStartOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDateInput = (value?: string | null): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const normalizeResetDay = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(31, Math.max(1, Math.round(value)));
};

export const computeUpcomingMonthlyResetDate = (
  dayOfMonth: number,
  referenceDate: Date = new Date(),
) => {
  const normalizedDay = normalizeResetDay(dayOfMonth);
  const today = toStartOfDay(referenceDate);

  const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  let candidate = new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(normalizedDay, currentMonthLastDay),
  );

  if (candidate < today) {
    const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    candidate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      Math.min(normalizedDay, nextMonthLastDay),
    );
  }

  return formatLocalDate(candidate);
};

export const normalizeCustomResetDate = (
  value?: string | null,
  referenceDate: Date = new Date(),
) => {
  const today = toStartOfDay(referenceDate);
  const parsed = parseLocalDateInput(value);
  if (!parsed) {
    return formatLocalDate(today);
  }
  return formatLocalDate(parsed < today ? today : parsed);
};

export const resolveFinanceResetDate = ({
  recurrence,
  dayOfMonth,
  customDate,
  referenceDate = new Date(),
}: {
  recurrence: FinanceResetRecurrence;
  dayOfMonth?: number;
  customDate?: string | null;
  referenceDate?: Date;
}) => {
  if (recurrence === 'monthly') {
    return computeUpcomingMonthlyResetDate(dayOfMonth ?? 10, referenceDate);
  }

  return normalizeCustomResetDate(customDate, referenceDate);
};

export const computeDaysUntilReset = (
  targetDate: string,
  referenceDate: Date = new Date(),
) => {
  const today = toStartOfDay(referenceDate);
  const target = parseLocalDateInput(targetDate);
  if (!target) return 1;
  const diffMs = toStartOfDay(target).getTime() - today.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};
