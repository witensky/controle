import React, { useMemo } from 'react';
import {
  ArrowDownCircle,
  Clock,
  Download,
  Edit3,
  Tag,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { BarChartComponent, PieChartComponent } from '../charts';
import { formatChartCurrency } from '../../utils/chartHelpers';
import { Transaction } from '../../features/finance/types';

interface DailyExpensesDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  date: string;
  monthlyBudget: number;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  onSelectTransaction?: (transaction: Transaction) => void;
}

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const DailyExpensesDetail: React.FC<DailyExpensesDetailProps> = ({
  isOpen,
  onClose,
  transactions,
  date,
  monthlyBudget,
  onDelete,
  onEdit,
  onSelectTransaction,
}) => {
  const dailyTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date === date && transaction.type === 'expense'),
    [date, transactions],
  );

  const totalAmount = useMemo(
    () => dailyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [dailyTransactions],
  );

  const categoryData = useMemo(() => {
    const aggregate: Record<string, number> = {};
    dailyTransactions.forEach((transaction) => {
      aggregate[transaction.category] = (aggregate[transaction.category] || 0) + transaction.amount;
    });
    return Object.entries(aggregate).map(([name, value]) => ({ name, value }));
  }, [dailyTransactions]);

  const transactionBreakdownData = useMemo(
    () =>
      dailyTransactions
        .slice()
        .sort((first, second) => second.amount - first.amount)
        .slice(0, 6)
        .map((transaction) => ({
          name: transaction.title.length > 12 ? `${transaction.title.slice(0, 12)}…` : transaction.title,
          amount: transaction.amount,
        })),
    [dailyTransactions],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={(
        <>
          DETAIL DES <span className="text-rose-500">DEPENSES</span>
        </>
      )}
      subtitle={`Journee du ${date}`}
      icon={<TrendingDown size={20} className="text-rose-500" />}
      maxWidthClassName="max-w-6xl"
      headerActions={(
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Total jour</p>
          <p className="text-2xl font-black italic text-white">
            {formatChartCurrency(totalAmount)}
          </p>
        </div>
      )}
      bodyClassName="space-y-6"
    >
      <div className="sm:hidden rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Total jour</p>
        <p className="mt-1 text-2xl font-black italic text-white">
          {formatChartCurrency(totalAmount)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="glass rounded-[1.75rem] border-white/5 bg-slate-900/40 p-5 sm:p-6">
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Repartition categorielle</h3>
              <PieChartComponent
                data={categoryData}
                dataKey="value"
                nameKey="name"
                colors={COLORS}
                emptyMessage="Aucun segment a afficher pour aujourd'hui."
                fallbackTitle="Repartition indisponible"
                heightClassName="h-[220px]"
                minHeightClassName="min-h-[220px]"
                valueFormatter={(value) => formatChartCurrency(value)}
              />
            </div>

            <div className="glass rounded-[1.75rem] border-white/5 bg-slate-900/40 p-5 sm:p-6">
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Montants du jour</h3>
              <BarChartComponent
                data={transactionBreakdownData}
                xKey="name"
                series={[
                  {
                    key: 'amount',
                    label: 'Montant',
                    color: '#f43f5e',
                    radius: [8, 8, 0, 0],
                  },
                ]}
                emptyMessage="Aucune depense exploitable pour le jour selectionne."
                fallbackTitle="Montants indisponibles"
                heightClassName="h-[220px]"
                minHeightClassName="min-h-[220px]"
                hideYAxis
                barSize={22}
                activeIndex={0}
                tooltipValueFormatter={(value) => formatChartCurrency(value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-rose-500/10 bg-rose-500/5 p-5">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-rose-400">Impact mensuel</p>
              <p className="text-sm text-rose-200">
                Ces depenses representent <strong>{monthlyBudget > 0 ? ((totalAmount / monthlyBudget) * 100).toFixed(1) : '0.0'}%</strong> du budget mensuel.
              </p>
            </div>
            <ArrowDownCircle className="shrink-0 text-rose-500/60" size={28} />
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/5 bg-slate-950/25">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{dailyTransactions.length} operation(s)</span>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-white">
              <Download size={14} />
              Exporter
            </button>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {dailyTransactions.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/20 text-center">
                <TrendingDown size={40} className="mb-4 text-slate-600" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Aucune depense ce jour</p>
              </div>
            ) : (
              dailyTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTransaction?.(transaction)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectTransaction?.(transaction);
                    }
                  }}
                  className="block w-full rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 text-left shadow-soft transition-all hover:border-[color:var(--tone-danger-border)] hover:bg-[color:var(--surface)] dark:border-white/5 dark:bg-slate-900/45 dark:hover:border-rose-500/25 dark:hover:bg-slate-900/70"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-[color:var(--text-secondary)] dark:border-white/5 dark:bg-slate-950 dark:text-slate-400">
                          <Tag size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-[color:var(--heading)] dark:text-white">{transaction.title}</h4>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[color:var(--text-secondary)] dark:border-white/5 dark:bg-slate-800 dark:text-white">
                              {transaction.category}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-[color:var(--text-muted)]">
                              <Clock size={10} />
                              Jour planifie
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="font-mono text-lg font-black text-[color:var(--heading)] dark:text-white">-{formatChartCurrency(transaction.amount)}</span>
                      <div className="flex gap-2">
                        {onEdit ? (
                          <button onClick={(event) => { event.stopPropagation(); onEdit(transaction); }} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-[color:var(--text-muted)] transition-colors hover:border-[color:var(--tone-info-border)] hover:bg-[color:var(--tone-info-surface)] hover:text-[color:var(--tone-info-text)] dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400">
                            <Edit3 size={15} />
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button onClick={(event) => { event.stopPropagation(); onDelete(transaction.id); }} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-[color:var(--text-muted)] transition-colors hover:border-[color:var(--tone-danger-border)] hover:bg-[color:var(--tone-danger-surface)] hover:text-[color:var(--tone-danger-text)] dark:border-white/5 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-500">
                            <Trash2 size={15} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
