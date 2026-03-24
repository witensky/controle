export const DEFAULT_MONTHLY_BUDGET = 0;

export const resolveMonthlyBudget = (value: unknown, fallback = DEFAULT_MONTHLY_BUDGET) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};
