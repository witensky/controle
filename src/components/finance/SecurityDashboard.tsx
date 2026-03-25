import React, { useMemo } from 'react';
import { Heart, Layers, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { SparklineChart } from '../common/InlineCharts';

interface SecurityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  projectedBalance: number;
  totalBudget: number;
  provisionsAmount: number;
  sources: {
    amci: number;
    don: number;
    autres: number;
    total: number;
  };
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  isOpen,
  onClose,
  currentBalance,
  projectedBalance,
  totalBudget,
  provisionsAmount,
  sources,
}) => {
  const safetyRatio = totalBudget > 0 ? (projectedBalance / totalBudget) * 100 : 0;

  let color = 'text-emerald-500';
  let bgColor = 'bg-emerald-500';
  let borderColor = 'border-emerald-500';
  if (safetyRatio < 10) {
    color = 'text-rose-500';
    bgColor = 'bg-rose-500';
    borderColor = 'border-rose-500';
  } else if (safetyRatio < 25) {
    color = 'text-amber-500';
    bgColor = 'bg-amber-500';
    borderColor = 'border-amber-500';
  }

  const trendData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const progress = index / 5;
        const projectedStep = currentBalance + (projectedBalance - currentBalance) * progress;
        const resilienceOffset = sources.total * 0.06 * (1 - progress);

        return {
          day: `J-${30 - index * 6}`,
          value: Math.round(projectedStep + resilienceOffset),
        };
      }),
    [currentBalance, projectedBalance, sources.total],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Suivi de <span className={color}>trésorerie</span>
        </>
      }
      icon={<ShieldCheck size={20} className={color} />}
      maxWidthClassName="max-w-6xl"
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
        <div className="space-y-4">
          <h4 className="pl-1 text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Répartition des sources
          </h4>

          <div className="flex items-center gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card border-l-4 border-emerald-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Alimentation AMCI</p>
              <p className="truncate text-2xl font-black italic text-[color:var(--text-primary)]">{sources.amci.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card border-l-4 border-blue-500/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Heart size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Flux externes</p>
              <p className="truncate text-2xl font-black italic text-[color:var(--text-primary)]">{sources.don.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card border-l-4 border-slate-400/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <Layers size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Autres sources</p>
              <p className="truncate text-2xl font-black italic text-[color:var(--text-primary)]">{sources.autres.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Capacité totale</span>
              <span className="text-xl font-black italic text-[color:var(--text-primary)]">{sources.total.toLocaleString()} DH</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--muted)]">
              <div className="h-full w-full bg-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={`rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card sm:p-6`}>
              <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${color}`}>Indice de solidité</p>
              <h3 className="mb-4 text-4xl font-black italic text-[color:var(--text-primary)] sm:text-5xl">{safetyRatio.toFixed(1)}%</h3>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[color:var(--muted)]">
                <div className={`h-full ${bgColor} transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, safetyRatio))}%` }} />
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-[color:var(--text-muted)]">
                Plus ce score est élevé, plus ton solde projeté couvre ton budget total.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Solde brut actuel</span>
                  <span className="text-base font-black text-[color:var(--text-primary)]">{currentBalance.toLocaleString()} DH</span>
                </div>
                <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Engagements futurs</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-500">-{provisionsAmount.toLocaleString()} DH</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Solde projeté</span>
                  <span className="text-2xl font-black italic text-emerald-600 dark:text-emerald-400">{projectedBalance.toLocaleString()} DH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card sm:p-6">
            <h4 className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">
              <TrendingUp size={16} className="text-emerald-500" /> État de la trésorerie (30 j)
            </h4>
            <div className="h-[240px] sm:h-[280px]">
              <ChartErrorBoundary
                fallbackTitle="Trésorerie indisponible"
                minHeightClassName="min-h-[240px]"
                resetKey={`${currentBalance}-${projectedBalance}-${sources.total}`}
              >
                <SparklineChart
                  data={trendData.map((item) => ({
                    label: String(item.day || ''),
                    value: Number(item.value || 0),
                  }))}
                  stroke="#10b981"
                  fill="#10b981"
                  showArea
                  showDots
                  height={260}
                />
              </ChartErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

