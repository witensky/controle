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
        const resilienceOffset = (sources.total * 0.06) * (1 - progress);

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
          SUIVI DE <span className={color}>TRÉSORERIE</span>
        </>
      }
      icon={<ShieldCheck size={20} className={color} />}
      maxWidthClassName="max-w-6xl"
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
        <div className="space-y-4">
          <h4 className="pl-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Répartition des sources</h4>

          <div className="glass flex items-center gap-4 rounded-[1.75rem] border-emerald-500/20 bg-emerald-500/[0.02] p-5 border-l-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Alimentation AMCI</p>
              <p className="text-2xl font-black italic text-white">{sources.amci.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="glass flex items-center gap-4 rounded-[1.75rem] border-blue-500/20 bg-blue-500/[0.02] p-5 border-l-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Heart size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Flux externes</p>
              <p className="text-2xl font-black italic text-white">{sources.don.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="glass flex items-center gap-4 rounded-[1.75rem] border-slate-500/20 bg-slate-500/[0.02] p-5 border-l-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Autres sources</p>
              <p className="text-2xl font-black italic text-white">{sources.autres.toLocaleString()} DH</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/5 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacité totale</span>
              <span className="text-xl font-black italic text-white">{sources.total.toLocaleString()} DH</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
              <div className="h-full w-full bg-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={`glass rounded-[1.9rem] border ${borderColor}/30 bg-slate-900/40 p-5 sm:p-6`}>
              <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${color}`}>Indice de solidité</p>
              <h3 className="mb-4 text-4xl font-black italic text-white sm:text-5xl">{safetyRatio.toFixed(1)}%</h3>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-950">
                <div className={`h-full ${bgColor} transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, safetyRatio))}%` }} />
              </div>
            </div>

            <div className="glass rounded-[1.9rem] border-white/5 bg-slate-900/30 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Solde brut actuel</span>
                  <span className="text-base font-black text-white">{currentBalance.toLocaleString()} DH</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Engagements futurs</span>
                  <span className="text-base font-black text-amber-500">-{provisionsAmount.toLocaleString()} DH</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Solde projeté</span>
                  <span className="text-2xl font-black italic text-emerald-400">{projectedBalance.toLocaleString()} DH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[1.9rem] border-white/5 bg-slate-900/15 p-5 sm:p-6">
            <h4 className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <TrendingUp size={16} className="text-emerald-500" /> État de la trésorerie (30 j)
            </h4>
            <div className="h-[240px] sm:h-[280px]">
              <ChartErrorBoundary fallbackTitle="Tresorerie indisponible" minHeightClassName="min-h-[240px]" resetKey={`${currentBalance}-${projectedBalance}-${sources.total}`}>
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
