import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

type ThemeToggleProps = {
  className?: string;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      className={
        className ||
        'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--text-primary)] shadow-sm backdrop-blur transition-colors hover:bg-[color:var(--surface)]'
      }
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;

