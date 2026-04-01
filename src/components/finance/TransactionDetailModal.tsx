import React from 'react';
import {
  ArrowUpCircle,
  Calendar,
  FileText,
  ShieldCheck,
  Tag,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { Transaction } from '../../features/finance/types';
import { isPlannedProvision } from '../../utils/financeProvisions';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onExecute?: (transaction: Transaction) => void;
  canExecute?: boolean;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
  onExecute,
  canExecute = false,
}) => {
  if (!transaction) return null;

  const todayKey = new Date().toISOString().split('T')[0];
  const isDeposit = transaction.type === 'deposit';
  const isProvision = !isDeposit && isPlannedProvision(transaction);
  const isOverdueProvision = isProvision && transaction.date < todayKey;
  const isExecutedProvision = !isDeposit && transaction.planned === false && Boolean(transaction.planned_date);
  const badgeTone = isDeposit ? toneClassNames.success.chip : toneClassNames.danger.chip;
  const amountTone = isDeposit ? toneClassNames.success.text : toneClassNames.danger.text;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={<>Detail <span className={amountTone}>transaction</span></>}
      subtitle="Lecture complete du flux selectionne"
      icon={isDeposit ? <ArrowUpCircle size={20} className={toneClassNames.success.icon} /> : <TrendingDown size={20} className={toneClassNames.danger.icon} />}
      maxWidthClassName="max-w-xl"
      centered
      bodyClassName="space-y-5"
      footer={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {canExecute && onExecute ? (
            <button type="button" onClick={() => onExecute(transaction)} className={cx(uiRecipes.primaryButton, 'rounded-2xl px-4 py-3')}>
              Executer
            </button>
          ) : null}
          {onEdit ? (
            <button type="button" onClick={() => onEdit(transaction)} className={cx(uiRecipes.secondaryButton, 'rounded-2xl px-4 py-3')}>
              Modifier
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={() => onDelete(transaction)} className={cx(uiRecipes.ghostButton, toneClassNames.danger.chip, 'rounded-2xl px-4 py-3')}>
              Supprimer
            </button>
          ) : null}
        </div>
      }
    >
      <div className={cx(uiRecipes.panel, 'rounded-[1.5rem] p-5')}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className={cx(uiRecipes.chip, badgeTone)}>{isDeposit ? 'Revenu' : 'Depense'}</div>
            <h3 className="mt-4 text-xl font-black uppercase italic tracking-tight text-[color:var(--heading)]">{transaction.title}</h3>
          </div>

          <div className="text-right">
            <p className={cx('text-3xl font-black italic tracking-[-0.05em]', amountTone)}>
              {isDeposit ? '+' : '-'}
              {transaction.amount.toLocaleString()}
            </p>
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">DH</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={cx(uiRecipes.card, 'rounded-[1.25rem] p-4')}>
          <div className="mb-2 flex items-center gap-2 text-[color:var(--text-muted)]">
            <Calendar size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Date</span>
          </div>
          <p className="text-sm font-bold text-[color:var(--heading)]">{transaction.date}</p>
        </div>

        <div className={cx(uiRecipes.card, 'rounded-[1.25rem] p-4')}>
          <div className="mb-2 flex items-center gap-2 text-[color:var(--text-muted)]">
            <Tag size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Categorie</span>
          </div>
          <p className="text-sm font-bold text-[color:var(--heading)]">{transaction.category || (isDeposit ? 'Depot' : 'Sans categorie')}</p>
        </div>

        {transaction.source ? (
          <div className={cx(uiRecipes.card, 'rounded-[1.25rem] p-4')}>
            <div className="mb-2 flex items-center gap-2 text-[color:var(--text-muted)]">
              <Wallet size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">Source</span>
            </div>
            <p className="text-sm font-bold text-[color:var(--heading)]">{transaction.source}</p>
          </div>
        ) : null}

        <div className={cx(uiRecipes.card, 'rounded-[1.25rem] p-4')}>
          <div className="mb-2 flex items-center gap-2 text-[color:var(--text-muted)]">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Statut</span>
          </div>
          <p className="text-sm font-bold text-[color:var(--heading)]">
            {isProvision ? (isOverdueProvision ? 'Provision en retard' : 'Provision planifiee') : (isExecutedProvision ? 'Provision executee' : 'Enregistree')}
          </p>
        </div>
      </div>

      <div className={cx(uiRecipes.card, 'rounded-[1.25rem] p-4')}>
        <div className="mb-2 flex items-center gap-2 text-[color:var(--text-muted)]">
          <FileText size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.24em]">Note</span>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {transaction.comment?.trim() || 'Aucune note associee a cette transaction.'}
        </p>
      </div>
    </ModalShell>
  );
};

export default TransactionDetailModal;
