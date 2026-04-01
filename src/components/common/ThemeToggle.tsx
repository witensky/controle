import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { cx, uiRecipes } from '../../theme/recipes';

type ThemeToggleProps = {
  className?: string;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        toggleTheme();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      aria-label={isDark ? 'Activer le theme clair' : 'Activer le theme sombre'}
      className={cx(
        uiRecipes.ghostButton,
        'h-11 w-11 rounded-2xl px-0 py-0 text-[color:var(--text)] shadow-soft backdrop-blur-xl',
        className,
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
