import React from 'react';
import {
  ArrowUpCircle,
  Calendar,
  Edit3,
  FileText,
  ShieldCheck,
  Tag,
  Trash2,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { Transaction } from '../../features/finance/types';

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

  const isDeposit = transaction.type === 'deposit';
  const amountTone = isDeposit ? 'text-emerald-400' : 'text-rose-400';
  const badgeTone = isDeposit
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    : 'border-rose-500/20 bg-rose-500/10 text-rose-300';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          DETAIL <span className={isDeposit ? 'text-emerald-400' : 'text-rose-400'}>TRANSACTION</span>
        </>
      }
      subtitle="Lecture complete du flux selectionne"
      icon={isDeposit ? <ArrowUpCircle size={20} className="text-emerald-400" /> : <TrendingDown size={20} className="text-rose-400" />}
      maxWidthClassName="max-w-xl"
      centered
      bodyClassName="space-y-5"
      footer={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {canExecute && onExecute ? (
            <button
              type="button"
              onClick={() => onExecute(transaction)}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 transition-all hover:bg-amber-500 hover:text-slate-950"
            >
              Executer
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 transition-all hover:bg-blue-500 hover:text-slate-950"
            >
              Modifier
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 transition-all hover:bg-rose-500 hover:text-slate-950"
            >
              Supprimer
            </button>
          ) : null}
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${badgeTone}`}>
              {isDeposit ? 'Revenu' : 'Depense'}
            </div>
            <h3 className="mt-4 text-xl font-black uppercase italic tracking-tight text-white">{transaction.title}</h3>
          </div>

          <div className="text-right">
            <p className={`text-3xl font-black italic tracking-[-0.05em] ${amountTone}`}>
              {isDeposit ? '+' : '-'}
              {transaction.amount.toLocaleString()}
            </p>
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">DH</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/6 bg-slate-950/35 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <Calendar size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Date</span>
          </div>
          <p className="text-sm font-bold text-white">{transaction.date}</p>
        </div>

        <div className="rounded-[1.25rem] border border-white/6 bg-slate-950/35 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <Tag size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Categorie</span>
          </div>
          <p className="text-sm font-bold text-white">{transaction.category || (isDeposit ? 'Depot' : 'Sans categorie')}</p>
        </div>

        {transaction.source ? (
          <div className="rounded-[1.25rem] border border-white/6 bg-slate-950/35 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <Wallet size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.24em]">Source</span>
            </div>
            <p className="text-sm font-bold text-white">{transaction.source}</p>
          </div>
        ) : null}

        <div className="rounded-[1.25rem] border border-white/6 bg-slate-950/35 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]">Statut</span>
          </div>
          <p className="text-sm font-bold text-white">{transaction.date > new Date().toISOString().split('T')[0] ? 'Planifiee' : 'Enregistree'}</p>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-white/6 bg-slate-950/35 p-4">
        <div className="mb-2 flex items-center gap-2 text-slate-500">
          <FileText size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.24em]">Note</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          {transaction.comment?.trim() || 'Aucune note associee a cette transaction.'}
        </p>
      </div>
    </ModalShell>
  );
};

export default TransactionDetailModal;
