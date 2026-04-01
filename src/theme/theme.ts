export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

export const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
};

export const applyThemeToDom = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.dataset.theme = theme;
  root.classList.remove('theme-ready');
};
