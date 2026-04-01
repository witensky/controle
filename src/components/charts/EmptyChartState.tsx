import React from 'react';
import { cx, uiRecipes } from '../../theme/recipes';

interface EmptyChartStateProps {
  message: string;
  minHeightClassName?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  message,
  minHeightClassName = 'min-h-[220px]',
}) => (
  <div
    className={cx(uiRecipes.emptyState, 'flex items-center justify-center px-6', minHeightClassName)}
  >
    <p className="max-w-[260px] text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
      {message}
    </p>
  </div>
);

export default EmptyChartState;
