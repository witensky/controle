import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Clock, Calculator, X } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { Transaction } from '../../features/finance/types';
import { normalizeDateOnly } from '../../utils/transactionDates';
import { LOCAL_KEYS, localStore } from '../../lib/localStorage';
import { formatChartCurrency } from '../../utils/chartHelpers';

interface ProvisionsTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  futureTransactions: Transaction[];
  onExecute: (transaction: Transaction) => void;
  onSelectTransaction?: (transaction: Transaction) => void;
}

export const ProvisionsTimeline: React.FC<ProvisionsTimelineProps> = ({
  isOpen,
  onClose,
  futureTransactions,
  onExecute,
  onSelectTransaction,
}) => {
  const todayKey = normalizeDateOnly(new Date().toISOString());
  const [showImpactTip, setShowImpactTip] = useState(true);
  const totalProvisions = useMemo(
    () => futureTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0),
    [futureTransactions],
  );

  useEffect(() => {
    if (!isOpen) return;

    const dismissedAt = localStore.get<number>(LOCAL_KEYS.FINANCE_IMPACT_TIP_DISMISSED_AT);
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const shouldShow = !dismissedAt || Number.isFinite(dismissedAt) && Date.now() - dismissedAt > weekMs;
    setShowImpactTip(Boolean(shouldShow));
  }, [isOpen]);

  const groupedProvisions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    futureTransactions
      .filter((transaction) => transaction.type === 'expense')
      .sort((first, second) => normalizeDateOnly(first.date).localeCompare(normalizeDateOnly(second.date)))
      .forEach((transaction) => {
        const dateKey = normalizeDateOnly(transaction.date);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(transaction);
      });
    return groups;
  }, [futureTransactions]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          CHRONOLOGIE DES <span className="text-amber-500">PROVISIONS</span>
        </>
      }
      subtitle="Flux futurs planifiés"
      icon={<Calculator size={20} className="text-amber-500" />}
      maxWidthClassName="max-w-5xl"
      centered
      headerActions={
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Projection sortante</p>
          <p className="text-2xl font-black italic text-[color:var(--text-primary)]">
            {formatChartCurrency(totalProvisions)}
          </p>
        </div>
      }
      bodyClassName="space-y-6"
    >
      <div className="sm:hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 text-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Projection sortante</p>
        <p className="mt-1 text-2xl font-black italic text-[color:var(--text-primary)]">
          {formatChartCurrency(totalProvisions)}
        </p>
      </div>

      {Object.keys(groupedProvisions).length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] text-center shadow-sm">
          <Calendar size={42} className="mb-4 text-[color:var(--text-muted)]" />
          <p className="text-[11px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Aucune provision planifiée</p>
        </div>
      ) : (
        <div className="relative ml-3 space-y-8 border-l-2 border-[color:var(--border-strong)] pl-6 sm:ml-5 sm:pl-8">
          {Object.entries(groupedProvisions).map(([date, items]) => (
            <div key={date} className="relative">
              <div className="absolute -left-[34px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500 bg-[color:var(--surface)] sm:-left-[42px]">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </div>

              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[color:var(--text-secondary)]">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              <div className="space-y-3">
                {items.map((transaction) => (
                  (() => {
                    const dateKey = normalizeDateOnly(transaction.date);
                    const isOverdue = dateKey < todayKey;

                    return (
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
                    className="glass block w-full rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-left shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
                          <span className="text-[9px] font-black uppercase text-amber-500">{transaction.date.split('-')[1]}</span>
                          <span className="text-lg font-black italic text-[color:var(--text-primary)] leading-tight">{transaction.date.split('-')[2]}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black uppercase italic text-[color:var(--text-primary)]">{transaction.title}</h4>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[color:var(--muted)] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[color:var(--text-secondary)]">
                              {transaction.category}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-500/70'}`}
                            >
                              <Clock size={10} />
                              {isOverdue ? 'En retard' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <p className="text-lg font-black italic text-[color:var(--text-primary)]">{formatChartCurrency(transaction.amount)}</p>
                        <button
                          onClick={(event) => { event.stopPropagation(); onExecute(transaction); }}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500 hover:text-slate-950"
                          title="Valider maintenant"
                        >
                          Exécuter
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showImpactTip ? (
        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-primary)]">
              <Calculator size={14} className="text-amber-500" /> Impact budgétaire
            </h4>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--muted)] text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
              aria-label="Fermer le tip"
              onClick={() => {
                localStore.set(LOCAL_KEYS.FINANCE_IMPACT_TIP_DISMISSED_AT, Date.now());
                setShowImpactTip(false);
              }}
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-[color:var(--text-secondary)]">
            Si toutes ces provisions sont exécutées, votre solde de sécurité sera ajusté en conséquence. Ces montants sont déjà déduits du solde de sécurité, mais pas du solde réel actuel.
          </p>
        </div>
      ) : null}
    </ModalShell>
  );
};
