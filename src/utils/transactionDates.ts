export const normalizeDateOnly = (value?: string | null) => {
  if (!value) return '';
  return value.trim().slice(0, 10);
};

export const compareDateOnly = (left?: string | null, right?: string | null) => {
  const leftValue = normalizeDateOnly(left);
  const rightValue = normalizeDateOnly(right);

  if (leftValue === rightValue) return 0;
  return leftValue > rightValue ? 1 : -1;
};

export const isFutureDateOnly = (value?: string | null, today?: string | null) =>
  compareDateOnly(value, today) > 0;

export const isPastOrTodayDateOnly = (value?: string | null, today?: string | null) =>
  compareDateOnly(value, today) <= 0;

export const isSameDateOnly = (left?: string | null, right?: string | null) =>
  compareDateOnly(left, right) === 0;
