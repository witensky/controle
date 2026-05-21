import React from 'react';
import { cx, uiRecipes } from '../../theme/recipes';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    wrapper: 'py-6 px-4',
    iconShell: 'h-10 w-10 rounded-xl',
    title: 'text-xs font-black uppercase tracking-[0.22em]',
    description: 'text-[10px]',
    gap: 'gap-3',
  },
  md: {
    wrapper: 'py-10 px-5',
    iconShell: 'h-14 w-14 rounded-2xl',
    title: 'text-sm font-black uppercase tracking-[0.2em]',
    description: 'text-xs',
    gap: 'gap-4',
  },
  lg: {
    wrapper: 'py-14 px-6',
    iconShell: 'h-16 w-16 rounded-2xl',
    title: 'text-base font-black uppercase tracking-tight italic',
    description: 'text-sm',
    gap: 'gap-5',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) => {
  const s = SIZE_STYLES[size];

  return (
    <div className={cx(uiRecipes.emptyState, 'flex flex-col items-center', s.wrapper, s.gap, className)}>
      {icon ? (
        <div
          className={cx(
            'flex shrink-0 items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]',
            s.iconShell,
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <p className={cx(s.title, 'text-[color:var(--text-secondary)]')}>{title}</p>
        {description ? (
          <p className={cx(s.description, 'text-[color:var(--text-muted)]')}>{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
};

export default EmptyState;
