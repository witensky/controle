export type SupportedCurrencyCode = 'USD' | 'DH' | 'HTG' | 'EUR' | 'FRANC';

export const CURRENCY_STORAGE_KEY = 'myflow.currency';
export const DEFAULT_CURRENCY: SupportedCurrencyCode = 'DH';

export const SUPPORTED_CURRENCIES: Array<{
  code: SupportedCurrencyCode;
  label: string;
  description: string;
}> = [
  { code: 'USD', label: 'USD', description: 'Dollar' },
  { code: 'DH', label: 'DH', description: 'Dirham' },
  { code: 'HTG', label: 'HTG', description: 'Haitian Gourdes' },
  { code: 'EUR', label: 'EUR', description: 'Euro' },
  { code: 'FRANC', label: 'Franc', description: 'Franc' },
];

const CURRENCY_LABELS: Record<SupportedCurrencyCode, string> = {
  USD: 'USD',
  DH: 'DH',
  HTG: 'HTG',
  EUR: 'EUR',
  FRANC: 'Franc',
};

export const resolveCurrency = (value: unknown): SupportedCurrencyCode => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');

  if (normalized === 'USD') return 'USD';
  if (normalized === 'DH' || normalized === 'MAD') return 'DH';
  if (normalized === 'HTG') return 'HTG';
  if (normalized === 'EUR' || normalized === 'EURO') return 'EUR';
  if (normalized === 'FRANC' || normalized === 'CHF' || normalized === 'XOF' || normalized === 'XAF') return 'FRANC';

  return DEFAULT_CURRENCY;
};

export const getCurrencyLabel = (currency: unknown) => CURRENCY_LABELS[resolveCurrency(currency)];

export const getStoredCurrency = (): SupportedCurrencyCode => {
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCY;
  }

  try {
    return resolveCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY));
  } catch {
    return DEFAULT_CURRENCY;
  }
};

export const persistCurrency = (currency: unknown) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, resolveCurrency(currency));
  } catch {
    // Ignore storage failures; UI falls back to default currency.
  }
};

export const formatCurrencyAmount = (
  value: number | string | null | undefined,
  currency?: unknown,
  options?: Intl.NumberFormatOptions,
) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return `-- ${getCurrencyLabel(currency ?? getStoredCurrency())}`;

  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    ...options,
  }).format(numericValue);

  return `${formatted} ${getCurrencyLabel(currency ?? getStoredCurrency())}`;
};
