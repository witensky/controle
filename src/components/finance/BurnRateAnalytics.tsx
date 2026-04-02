import React, { useMemo } from 'react';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { PieChartComponent, RadialProgressChart } from '../charts';
import { formatChartCurrency } from '../../utils/chartHelpers';
import { chartPalette, chartToneByIntent, toneClassNames } from '../../theme/tokens';
import { cx, uiRecipes } from '../../theme/recipes';

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
  tone: keyof typeof toneClassNames;
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

  const insight = useMemo<InsightTone>(() => {
    const safeQuota = Math.max(0, Number(dailyQuota) || 0);
    const safeTodaySpent = Math.max(0, Number(todaySpent) || 0);
    const quotaRatio = safeQuota > 0 ? safeTodaySpent / safeQuota : 0;
    const projectedPressure = currentBalance > 0 ? futureExpenses / currentBalance : 0;

    if (projectedBalance < 0) {
      return {
        title: 'Projection negative',
        description: `Les engagements futurs font basculer la trajectoire sous zero. Le solde projete descend a ${formatChartCurrency(projectedBalance)}.`,
        tone: 'danger',
        icon: TrendingUp,
      };
    }

    if (deviation > 10 || quotaRatio > 1.2) {
      return {
        title: 'Rythme a corriger',
        description:
          safeQuota > 0
            ? `Les depenses du jour (${formatChartCurrency(safeTodaySpent)}) depassent le quota cible de ${formatChartCurrency(safeQuota)}.`
            : 'La consommation accelere plus vite que le rythme ideal du cycle en cours.',
        tone: 'danger',
        icon: TrendingUp,
      };
    }

    if (projectedPressure > 0.45 || deviation > 3) {
      return {
        title: 'Vigilance moderee',
        description:
          projectedPressure > 0.45
            ? `Les provisions a venir (${formatChartCurrency(futureExpenses)}) commencent a peser sur la marge restante.`
            : 'Le rythme reste acceptable, mais la consommation depasse legerement la cible ideale.',
        tone: 'warning',
        icon: TrendingUp,
      };
    }

    if (deviation < -8 && projectedBalance > currentBalance * 0.55) {
      return {
        title: 'Marge confortable',
        description: 'La consommation reste sous controle et laisse une reserve saine pour la suite du cycle.',
        tone: 'success',
        icon: TrendingDown,
      };
    }

    return {
      title: 'Rythme sous controle',
      description: `La trajectoire reste coherente avec le cycle en cours, avec un solde projete de ${formatChartCurrency(projectedBalance)}.`,
      tone: 'success',
      icon: TrendingDown,
    };
  }, [currentBalance, dailyQuota, deviation, futureExpenses, projectedBalance, todaySpent]);

  const InsightIcon = insight.icon;
  const radialColor =
    projectedBalance < 0 || deviation > 10
      ? chartToneByIntent.danger
      : deviation > 3
        ? chartToneByIntent.warning
        : chartToneByIntent.success;
  const radialGradient =
    projectedBalance < 0 || deviation > 10
      ? { start: chartToneByIntent.danger, end: chartPalette[4] }
      : deviation > 3
        ? { start: chartToneByIntent.warning, end: chartPalette[4] }
        : { start: chartToneByIntent.success, end: chartToneByIntent.primary };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Analyse de consommation"
      subtitle="Comparaison entre rythme reel, quota et projection"
      icon={<Flame size={20} className="text-[color:var(--tone-warning-text)]" />}
      maxWidthClassName="max-w-5xl"
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className={cx(uiRecipes.cardElevated, 'p-5 sm:p-6')}>
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-5 h-48 w-48 sm:h-56 sm:w-56">
              <RadialProgressChart value={burnRate} max={100} label="Brule" color={radialColor} gradient={radialGradient} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={cx(uiRecipes.cardMuted, 'p-4 text-center')}>
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Rythme ideal</p>
              <p className="text-xl font-black text-[color:var(--tone-info-text)]">{idealBurnRate.toFixed(1)}%</p>
            </div>
            <div className={cx(uiRecipes.cardMuted, 'p-4 text-center')}>
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Deviation</p>
              <p className={`text-xl font-black ${deviation > 0 ? 'text-[color:var(--tone-danger-text)]' : 'text-[color:var(--tone-success-text)]'}`}>
                {deviation > 0 ? '+' : ''}
                {deviation.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={cx(uiRecipes.cardElevated, 'p-5 sm:p-6')}>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">Consommation par categorie</h3>
            <PieChartComponent
              data={expensesByCategory}
              dataKey="value"
              nameKey="name"
              colors={chartPalette as unknown as string[]}
              emptyMessage="Ajoute des depenses pour afficher la ventilation."
              fallbackTitle="Ventilation indisponible"
              heightClassName="h-[260px]"
              minHeightClassName="min-h-[260px]"
              valueFormatter={(value) => formatChartCurrency(value)}
            />
          </div>

          {expensesByCategory.length > 0 ? (
            <div className={cx(uiRecipes.cardMuted, 'p-5')}>
              <div className="space-y-3">
                {expensesByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
                      <span className="text-[10px] font-bold uppercase text-[color:var(--text-secondary)]">{entry.name}</span>
                    </div>
                    <span className="text-sm font-black text-[color:var(--heading)]">{formatChartCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className={cx(uiRecipes.cardMuted, 'p-4')}>
            <div className={cx('mb-2 flex items-center gap-3', toneClassNames[insight.tone].text)}>
              <InsightIcon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{insight.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[color:var(--text-secondary)]">{insight.description}</p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
