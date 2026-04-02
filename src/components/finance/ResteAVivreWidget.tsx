import React from 'react';
import { motion } from 'framer-motion';
import { toneClassNames } from '../../theme/tokens';
import { cx, uiRecipes } from '../../theme/recipes';
import { getCurrencyLabel, getStoredCurrency } from '../../utils/currency';

interface ResteAVivreWidgetProps {
  amount: number;
  totalBudget: number;
  onClick?: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ResteAVivreWidget: React.FC<ResteAVivreWidgetProps> = ({ amount, totalBudget, onClick }) => {
  const currencyLabel = getCurrencyLabel(getStoredCurrency());
  const percentage = totalBudget > 0 ? clamp((amount / totalBudget) * 100, 0, 100) : 0;

  const tone =
    percentage >= 70
      ? toneClassNames.success
      : percentage >= 40
        ? toneClassNames.warning
        : percentage >= 20
          ? toneClassNames.info
          : toneClassNames.danger;

  const liquidGradient =
    percentage >= 70
      ? 'linear-gradient(180deg,var(--success),var(--primary))'
      : percentage >= 40
        ? 'linear-gradient(180deg,var(--warning),var(--accent))'
        : percentage >= 20
          ? 'linear-gradient(180deg,var(--info),var(--chart-5))'
          : 'linear-gradient(180deg,var(--danger),var(--chart-4))';

  const liquidHeight = clamp(percentage, 8, 100);
  const liquidTop = 100 - liquidHeight;

  return (
    <div
      onClick={onClick}
      className={cx(
        uiRecipes.cardElevated,
        'group relative flex min-h-[196px] cursor-pointer flex-col gap-6 overflow-hidden rounded-[2rem] border border-[color:var(--tone-warning-border)] bg-gradient-to-br from-[color:var(--surface-elevated)] via-[color:var(--surface)] to-[color:var(--tone-warning-surface)] p-5 shadow-premium transition-all hover:-translate-y-0.5 sm:min-h-[220px] sm:rounded-[2.75rem] sm:p-6 lg:flex-row lg:items-center lg:gap-8 lg:p-8 dark:border-[color:var(--border)] dark:bg-[color:var(--surface-elevated)]',
      )}
    >
      <div className={cx('pointer-events-none absolute right-[-34px] top-[-34px] h-32 w-32 rounded-full blur-2xl', tone.shell)} />

      <div className="relative mx-auto flex h-[132px] w-[76px] shrink-0 items-center justify-center lg:mx-0">
        <div className="absolute top-0 h-4 w-9 rounded-t-xl bg-[color:var(--tone-warning-surface)] shadow-soft dark:bg-[color:var(--surface-muted)]" />
        <div className="relative mt-3 h-[116px] w-[76px] overflow-hidden rounded-[1.5rem] border-[3px] border-[color:var(--tone-warning-border)] bg-[color:var(--surface)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] dark:border-[color:var(--border)] dark:bg-[color:var(--surface-muted)]">
          <motion.div
            className="absolute inset-x-[3px] bottom-[3px] rounded-[0.85rem]"
            style={{ background: liquidGradient }}
            initial={false}
            animate={{ height: `calc(${liquidHeight}% - 3px)` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="absolute left-[-18%] top-[-11px] h-6 w-[136%] rounded-[100%] bg-white/20"
              animate={{ x: [-6, 8, -6], y: [0, -3, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-4 left-2 w-2.5 rounded-full bg-white/20"
              animate={{ height: ['26%', '52%', '34%'], opacity: [0.3, 0.65, 0.35] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-2 top-3 w-1.5 rounded-full bg-white/30"
              animate={{ height: ['12%', '30%', '16%'], opacity: [0.2, 0.55, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-[3px] rounded-[1rem] border border-[color:var(--tone-warning-border)]/60 dark:border-[color:var(--border-subtle)]" style={{ top: `calc(${liquidTop}% + 3px)`, bottom: '3px' }} />
        </div>
      </div>

      <div className="flex-1 text-center lg:text-left">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className={cx('whitespace-nowrap text-[10px] font-black uppercase tracking-[0.24em] italic sm:text-[11px]', tone.text)}>Reste à vivre</p>
          <span className={cx(uiRecipes.chip, tone.chip, 'shrink-0')}>{Math.round(percentage)}%</span>
        </div>
        <div className="mb-2 flex items-baseline justify-center gap-1.5 lg:justify-start">
          <h2 className="text-4xl font-black italic tracking-[-0.05em] text-[color:var(--heading)] sm:text-5xl">{amount.toLocaleString()}</h2>
          <span className={cx('text-sm font-black italic uppercase', tone.text)}>{currencyLabel}</span>
        </div>

        <div className="mx-auto mt-5 h-3 w-full max-w-[220px] overflow-hidden rounded-full border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] lg:mx-0 dark:border-[color:var(--border)] dark:bg-[color:var(--surface-muted)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: liquidGradient }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResteAVivreWidget;
