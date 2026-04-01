import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { useChartConfig } from '../../hooks/useChartConfig';
import { useChartData } from '../../hooks/useChartData';
import {
  AreaChartComponent,
  BaseChart,
  ChartContainer,
  ChartTooltipContent,
  PieChartComponent,
} from '../charts';
import {
  formatChartCurrency,
  mergeChartDatasets,
  sanitizeChartData,
} from '../../utils/chartHelpers';
import { chartPalette, chartToneByIntent } from '../../theme/tokens';
import { cx, uiRecipes } from '../../theme/recipes';

interface EvolutionChartProps {
  data: { date: string; amount: number }[];
}

export const ExpensesEvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const config = useChartConfig();
  const preparedData = useChartData(data, {
    dateKey: 'date',
    valueKeys: ['amount'],
    period: granularity,
    labelKey: 'label',
  });

  return (
    <ChartContainer
      title="Evolution Depenses"
      subtitle="Lecture multi-periode avec aggregation stable"
      icon={<Calendar size={18} className="text-[color:var(--tone-info-text)]" />}
      className="rounded-[3rem]"
      controls={(
        <div className="flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1">
          {config.periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setGranularity(option.id)}
              className={`rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${
                granularity === option.id
                  ? 'bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] shadow-soft'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    >
      <AreaChartComponent
        data={preparedData}
        xKey="label"
        emptyMessage="Aucune depense exploitable pour afficher l'evolution."
        fallbackTitle="Evolution indisponible"
        heightClassName="h-[300px]"
        minHeightClassName="min-h-[300px]"
        hideYAxis
        tooltipValueFormatter={(value) => formatChartCurrency(value)}
        series={[
          {
            key: 'amount',
            label: 'Depenses',
            color: chartToneByIntent.info,
            opacity: 0.36,
            strokeWidth: 3,
          },
        ]}
      />
    </ChartContainer>
  );
};

interface VectorDistributionProps {
  data: { name: string; value: number }[];
}

export const VectorDistributionChart: React.FC<VectorDistributionProps> = ({ data }) => (
  <ChartContainer
    title="Repartition Vectorielle"
    subtitle="Ventilation interactive des postes actifs"
    className="rounded-[3rem]"
  >
    <PieChartComponent
      data={data}
      dataKey="value"
      nameKey="name"
      emptyMessage="Aucune repartition disponible pour le moment."
      fallbackTitle="Repartition indisponible"
      heightClassName="h-[300px]"
      minHeightClassName="min-h-[300px]"
      valueFormatter={(value) => formatChartCurrency(value)}
    />
  </ChartContainer>
);

interface ProjectionChartProps {
  history: { date: string; balance: number }[];
  projection: { date: string; balance: number; optimistic: number; pessimistic: number }[];
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ history, projection }) => {
  const config = useChartConfig([chartToneByIntent.success, chartToneByIntent.info, chartToneByIntent.warning, chartToneByIntent.danger]);
  const safeHistory = useMemo(
    () => sanitizeChartData(history).map((entry) => ({ date: entry.date, historyBalance: entry.balance })),
    [history],
  );
  const safeProjection = useMemo(
    () =>
      sanitizeChartData(projection).map((entry) => ({
        date: entry.date,
        projectionBalance: entry.balance,
        optimistic: entry.optimistic,
        pessimistic: entry.pessimistic,
      })),
    [projection],
  );

  const mergedData = useMemo(
    () => mergeChartDatasets(safeHistory, safeProjection, 'date'),
    [safeHistory, safeProjection],
  );

  return (
    <ChartContainer
      title="Projection Financiere IA"
      subtitle="Historique reel, trajectoire projetee et zone de risque"
      className="col-span-1 rounded-[3rem] lg:col-span-2"
    >
      <BaseChart
        data={mergedData}
        emptyMessage="Aucune donnee historique ou projetee disponible."
        fallbackTitle="Projection indisponible"
        minHeightClassName="min-h-[350px]"
        heightClassName="h-[350px]"
        resetKey={`${safeHistory.length}-${safeProjection.length}`}
      >
        {(safeData) => (
          <AreaChart data={safeData} margin={{ top: 20, right: 18, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projection-balance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartToneByIntent.success} stopOpacity={0.32} />
                <stop offset="100%" stopColor={chartToneByIntent.success} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="projection-optimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartToneByIntent.info} stopOpacity={0.18} />
                <stop offset="100%" stopColor={chartToneByIntent.info} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid {...config.grid} />
            <XAxis dataKey="date" {...config.xAxis} />
            <YAxis {...config.yAxis} />
            <Tooltip
              cursor={config.tooltipCursor}
              content={(
                <ChartTooltipContent
                  valueFormatter={(value) => formatChartCurrency(value)}
                />
              )}
            />

            <Area
              type="monotone"
              dataKey="historyBalance"
              name="Solde reel"
              stroke={chartToneByIntent.success}
              fill="url(#projection-balance)"
              strokeWidth={3}
              fillOpacity={1}
              animationDuration={config.animation.duration}
            />
            <Line
              type="monotone"
              dataKey="projectionBalance"
              name="Projection"
              stroke={chartToneByIntent.success}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={config.animation.duration}
            />
            <Area
              type="monotone"
              dataKey="optimistic"
              name="Zone optimiste"
              stroke={chartToneByIntent.info}
              fill="url(#projection-optimistic)"
              strokeWidth={2}
              fillOpacity={1}
              animationDuration={config.animation.duration}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              name="Scenario prudent"
              stroke={chartToneByIntent.danger}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              animationDuration={config.animation.duration}
            />
          </AreaChart>
        )}
      </BaseChart>
    </ChartContainer>
  );
};
