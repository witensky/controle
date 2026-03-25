import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localStore } from '../lib/localStorage';
import { applyThemeToDom, getSystemTheme, isTheme, THEME_STORAGE_KEY, type Theme } from './theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hasPreference: boolean;
  clearPreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStoredTheme = () => {
  const stored = localStore.get<unknown>(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : null;
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [hasPreference, setHasPreference] = useState(() => readStoredTheme() !== null);
  const [theme, setThemeState] = useState<Theme>(() => {
    const domTheme = typeof document !== 'undefined' ? document.documentElement.dataset.theme : undefined;
    if (isTheme(domTheme)) return domTheme;
    return readStoredTheme() || getSystemTheme();
  });

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    if (hasPreference) return undefined;
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;

    const onChange = () => setThemeState(getSystemTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [hasPreference]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    setHasPreference(true);
    localStore.set(THEME_STORAGE_KEY, next);
  };

  const clearPreference = () => {
    localStore.remove(THEME_STORAGE_KEY);
    setHasPreference(false);
    setThemeState(getSystemTheme());
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, hasPreference, clearPreference }),
    [hasPreference, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
