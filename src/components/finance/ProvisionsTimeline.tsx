import React, { useMemo } from 'react';
import { Calendar, Check, Clock, Calculator } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { Transaction } from '../../features/finance/types';
import { normalizeDateOnly } from '../../utils/transactionDates';

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
  const totalProvisions = useMemo(
    () => futureTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0),
    [futureTransactions],
  );

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
          <p className="text-2xl font-black italic text-white">
            {totalProvisions.toLocaleString()} <span className="text-sm text-slate-500 not-italic">DH</span>
          </p>
        </div>
      }
      bodyClassName="space-y-6"
    >
      <div className="sm:hidden rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Projection sortante</p>
        <p className="mt-1 text-2xl font-black italic text-white">
          {totalProvisions.toLocaleString()} <span className="text-sm text-slate-500 not-italic">DH</span>
        </p>
      </div>

      {Object.keys(groupedProvisions).length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/20 text-center">
          <Calendar size={42} className="mb-4 text-slate-600" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Aucune provision planifiée</p>
        </div>
      ) : (
        <div className="relative ml-3 space-y-8 border-l-2 border-white/10 pl-6 sm:ml-5 sm:pl-8">
          {Object.entries(groupedProvisions).map(([date, items]) => (
            <div key={date} className="relative">
              <div className="absolute -left-[34px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500 bg-slate-900 sm:-left-[42px]">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </div>

              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-300">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              <div className="space-y-3">
                {items.map((transaction) => (
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
                    className="glass block w-full rounded-[1.5rem] border-white/5 bg-slate-900/55 p-4 text-left sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-950">
                          <span className="text-[9px] font-black uppercase text-amber-500">{transaction.date.split('-')[1]}</span>
                          <span className="text-lg font-black italic text-white leading-tight">{transaction.date.split('-')[2]}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black uppercase italic text-white">{transaction.title}</h4>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-300">
                              {transaction.category}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-500/70">
                              <Clock size={10} />
                              En attente
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <p className="text-lg font-black italic text-white">{transaction.amount.toLocaleString()} DH</p>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[1.75rem] border border-white/5 bg-slate-900/40 p-5">
        <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
          <Calculator size={14} className="text-amber-500" /> Impact budgétaire
        </h4>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Si toutes ces provisions sont exécutées, votre solde de sécurité sera ajusté en conséquence. Ces montants sont déjà déduits du solde de sécurité, mais pas du solde réel actuel.
        </p>
      </div>
    </ModalShell>
  );
};
