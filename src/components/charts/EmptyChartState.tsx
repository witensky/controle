import React from 'react';
import { History } from 'lucide-react';
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
    className={cx(uiRecipes.emptyPanel, 'flex flex-col items-center justify-center px-6', minHeightClassName)}
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] shadow-soft">
      <History size={28} />
    </div>
    <p className="max-w-[280px] text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
      {message}
    </p>
  </div>
);

export default EmptyChartState;
