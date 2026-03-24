import React, { useMemo } from 'react';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { PieChartComponent, RadialProgressChart } from '../charts';
import { formatChartCurrency } from '../../utils/chartHelpers';

interface BurnRateAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  burnRate: number;
  daysPassed: number;
  totalDays: number;
  todaySpent: number;
  dailyQuota: number;
  currentBalance: number;
  projectedBalance: number;
  futureExpenses: number;
  expensesByCategory: { name: string; value: number }[];
}

type InsightTone = {
  title: string;
  description: string;
  toneClassName: string;
  icon: typeof TrendingUp;
};

export const BurnRateAnalytics: React.FC<BurnRateAnalyticsProps> = ({
  isOpen,
  onClose,
  burnRate,
  daysPassed,
  totalDays,
  todaySpent,
  dailyQuota,
  currentBalance,
  projectedBalance,
  futureExpenses,
  expensesByCategory,
}) => {
  const idealBurnRate = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
  const deviation = burnRate - idealBurnRate;
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const insight = useMemo<InsightTone>(() => {
    const safeQuota = Math.max(0, Number(dailyQuota) || 0);
    const safeTodaySpent = Math.max(0, Number(todaySpent) || 0);
    const quotaRatio = safeQuota > 0 ? safeTodaySpent / safeQuota : 0;
    const projectedPressure = currentBalance > 0 ? futureExpenses / currentBalance : 0;

    if (projectedBalance < 0) {
      return {
        title: 'Projection negative',
        description: `Les engagements futurs font basculer la trajectoire sous zero. Le solde projete descend a ${projectedBalance.toLocaleString()} DH.`,
        toneClassName: 'text-rose-400',
        icon: TrendingUp,
      };
    }

    if (deviation > 10 || quotaRatio > 1.2) {
      return {
        title: 'Rythme a corriger',
        description:
          safeQuota > 0
            ? `Les depenses du jour (${safeTodaySpent.toLocaleString()} DH) depassent le quota cible de ${safeQuota.toLocaleString()} DH.`
            : 'La consommation accelere plus vite que le rythme ideal du cycle en cours.',
        toneClassName: 'text-rose-400',
        icon: TrendingUp,
      };
    }

    if (projectedPressure > 0.45 || deviation > 3) {
      return {
        title: 'Vigilance moderee',
        description:
          projectedPressure > 0.45
            ? `Les provisions a venir (${futureExpenses.toLocaleString()} DH) commencent a peser sur la marge restante.`
            : 'Le rythme reste acceptable, mais la consommation depasse legerement la cible ideale.',
        toneClassName: 'text-amber-300',
        icon: TrendingUp,
      };
    }

    if (deviation < -8 && projectedBalance > currentBalance * 0.55) {
      return {
        title: 'Marge confortable',
        description: 'La consommation reste sous controle et laisse une reserve saine pour la suite du cycle.',
        toneClassName: 'text-emerald-400',
        icon: TrendingDown,
      };
    }

    return {
      title: 'Rythme sous controle',
      description: `La trajectoire reste coherente avec le cycle en cours, avec un solde projete de ${projectedBalance.toLocaleString()} DH.`,
      toneClassName: 'text-emerald-400',
      icon: TrendingDown,
    };
  }, [currentBalance, dailyQuota, deviation, futureExpenses, projectedBalance, todaySpent]);

  const InsightIcon = insight.icon;
  const radialColor = projectedBalance < 0 || deviation > 10 ? '#f43f5e' : deviation > 3 ? '#f59e0b' : '#10b981';
  const radialGradient =
    projectedBalance < 0 || deviation > 10
      ? { start: '#fb7185', end: '#f43f5e' }
      : deviation > 3
        ? { start: '#fbbf24', end: '#f97316' }
        : { start: '#34d399', end: '#10b981' };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Analyse de Consommation"
      subtitle="Comparaison entre rythme reel, quota et projection"
      icon={<Flame size={20} className="text-amber-500" />}
      maxWidthClassName="max-w-5xl"
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] bg-gradient-to-br from-slate-900 via-[#0b1121] to-[#0b1121] p-5 sm:p-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-5 h-48 w-48 sm:h-56 sm:w-56">
              <RadialProgressChart
                value={burnRate}
                max={100}
                label="Brule"
                color={radialColor}
                gradient={radialGradient}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.25rem] border border-white/5 bg-slate-950/50 p-4 text-center">
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Rythme ideal</p>
              <p className="text-xl font-black text-blue-500">{idealBurnRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/5 bg-slate-950/50 p-4 text-center">
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Deviation</p>
              <p className={`text-xl font-black ${deviation > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {deviation > 0 ? '+' : ''}
                {deviation.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.9rem] border border-white/5 bg-slate-950/25 p-5 sm:p-6">
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Consommation par categorie</h3>
            <PieChartComponent
              data={expensesByCategory}
              dataKey="value"
              nameKey="name"
              colors={colors}
              emptyMessage="Ajoute des depenses pour afficher la ventilation."
              fallbackTitle="Ventilation indisponible"
              heightClassName="h-[260px]"
              minHeightClassName="min-h-[260px]"
              valueFormatter={(value) => formatChartCurrency(value)}
            />
          </div>

          {expensesByCategory.length > 0 ? (
            <div className="rounded-[1.75rem] border border-white/5 bg-slate-900/35 p-5">
              <div className="space-y-3">
                {expensesByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="text-[10px] font-bold uppercase text-slate-300">{entry.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{entry.value.toLocaleString()} DH</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-white/5 bg-slate-900 p-4">
            <div className={`mb-2 flex items-center gap-3 ${insight.toneClassName}`}>
              <InsightIcon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{insight.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">{insight.description}</p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
