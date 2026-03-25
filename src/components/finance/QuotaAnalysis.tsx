import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Pencil, Target, Zap } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { BarChartComponent } from '../charts';
import { formatChartCurrency } from '../../utils/chartHelpers';

interface QuotaAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  dailyQuota: number;
  suggestedDailyQuota: number;
  todaySpent: number;
  daysUntilReset: number;
  historyLast7Days: { date: string; amount: number }[];
  dailyQuotaOverride?: number | null;
  onSaveDailyQuota: (nextQuota: number | null) => Promise<void> | void;
  isSavingQuota?: boolean;
}

export const QuotaAnalysis: React.FC<QuotaAnalysisProps> = ({
  isOpen,
  onClose,
  dailyQuota,
  suggestedDailyQuota,
  todaySpent,
  daysUntilReset,
  historyLast7Days,
  dailyQuotaOverride = null,
  onSaveDailyQuota,
  isSavingQuota = false,
}) => {
  const safeDailyQuota = Number.isFinite(dailyQuota) ? Math.max(0, dailyQuota) : 0;
  const safeSuggestedDailyQuota = Number.isFinite(suggestedDailyQuota) ? Math.max(0, suggestedDailyQuota) : 0;
  const safeTodaySpent = Number.isFinite(todaySpent) ? Math.max(0, todaySpent) : 0;
  const safeDaysUntilReset = Number.isFinite(daysUntilReset) ? Math.max(0, Math.round(daysUntilReset)) : 0;
  const remainingToday = safeDailyQuota - safeTodaySpent;
  const percentageUsed = safeDailyQuota > 0 ? (safeTodaySpent / safeDailyQuota) * 100 : 0;
  const isOver = safeTodaySpent > safeDailyQuota;
  const [quotaInput, setQuotaInput] = useState(() => String(Math.round(safeDailyQuota)));
  const hasCustomQuota = Number.isFinite(dailyQuotaOverride) && dailyQuotaOverride !== null;

  useEffect(() => {
    setQuotaInput(String(Math.round(safeDailyQuota)));
  }, [safeDailyQuota, isOpen]);

  const handleApplyQuota = async () => {
    const nextValue = Math.max(0, Number(quotaInput) || 0);
    await onSaveDailyQuota(nextValue);
  };

  const handleResetQuota = async () => {
    await onSaveDailyQuota(null);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Analyse Quota"
      subtitle="Lecture de quota journalière"
      icon={<Target size={20} className="text-emerald-500" />}
      maxWidthClassName="max-w-2xl"
      bodyClassName="space-y-6"
      centered
    >
      <div className="text-center">
        <div className="relative mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full border-4 border-[color:var(--border-strong)] sm:h-48 sm:w-48">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50%" cy="50%" r="46%" className="fill-none" stroke="var(--border-strong)" strokeWidth="8" />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className={`fill-none transition-all duration-1000 ${isOver ? 'stroke-rose-500' : 'stroke-emerald-500'}`}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 74}`}
              strokeDashoffset={`${2 * Math.PI * 74 * (1 - Math.min(percentageUsed, 100) / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div>
            <span className={`block text-4xl font-black tracking-tighter ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
              {Math.round(percentageUsed)}%
            </span>
            <span className="mt-1 block text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Utilisé</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Dépensé</p>
            <p className="text-xl font-black text-[color:var(--text-primary)]">{safeTodaySpent.toLocaleString()} DH</p>
          </div>
          <div className="h-10 w-px bg-[color:var(--border)]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Quota</p>
            <p className="text-xl font-black text-emerald-500">{safeDailyQuota.toLocaleString()} DH</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">
              <Pencil size={12} /> Quota du jour
            </p>
            <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
              Modifiez la limite du jour ou revenez au calcul auto.
            </p>
          </div>
          <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${hasCustomQuota ? 'border border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'}`}>
            {hasCustomQuota ? 'Personnalise' : 'Auto'}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="ui-field flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border px-4 py-3.5">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Quota</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={quotaInput}
              onChange={(event) => setQuotaInput(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-right text-lg font-black text-[color:var(--text-primary)] outline-none"
            />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--text-muted)]">DH</span>
          </label>

          <button
            type="button"
            onClick={handleApplyQuota}
            disabled={isSavingQuota}
            className="rounded-[1.1rem] bg-emerald-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-950 transition-all disabled:opacity-50"
          >
            {isSavingQuota ? '...' : 'Appliquer'}
          </button>
        </div>

        {hasCustomQuota ? (
          <button
            type="button"
            onClick={handleResetQuota}
            disabled={isSavingQuota}
            className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)] transition-all hover:text-[color:var(--text-primary)] disabled:opacity-40"
          >
            Revenir au calcul auto
          </button>
        ) : null}
      </div>

      {isOver ? (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-500/20 bg-rose-500/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />
          <div>
            <h4 className="mb-1 text-[10px] font-black uppercase tracking-widest text-rose-500">Dépassement détecté</h4>
            <p className="text-[11px] text-[color:var(--text-secondary)]">
              Vous avez dépassé votre quota de <span className="font-bold text-[color:var(--text-primary)]">{Math.abs(remainingToday).toLocaleString()} DH</span>. Cela sera déduit du budget des {safeDaysUntilReset} prochains jours.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">
            <Calendar size={12} /> Historique 7 jours
          </p>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400">
            Quota {safeDailyQuota.toLocaleString()} DH
          </div>
        </div>
        <BarChartComponent
          data={historyLast7Days}
          xKey="date"
          series={[
            {
              key: 'amount',
              label: 'Depense',
              color: '#38bdf8',
              radius: [6, 6, 0, 0],
            },
          ]}
          emptyMessage="Historique indisponible pour le moment."
          fallbackTitle="Historique indisponible"
          heightClassName="h-[180px]"
          minHeightClassName="min-h-[180px]"
          hideYAxis
          tooltipValueFormatter={(value) => formatChartCurrency(value)}
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Jours restants</span>
        <span className="flex items-center justify-center gap-2 text-sm font-black text-[color:var(--text-primary)]">
          <Zap size={14} className="text-amber-500" /> {safeDaysUntilReset} jours
        </span>
      </div>
    </ModalShell>
  );
};
