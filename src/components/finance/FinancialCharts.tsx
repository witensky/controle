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
      icon={<Calendar size={18} className="text-sky-400" />}
      className="rounded-[3rem]"
      controls={(
        <div className="flex rounded-2xl border border-white/5 bg-slate-950/70 p-1">
          {config.periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setGranularity(option.id)}
              className={`rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${
                granularity === option.id
                  ? 'bg-sky-500 text-white shadow-[0_10px_25px_rgba(56,189,248,0.24)]'
                  : 'text-slate-500 hover:text-white'
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
            color: '#38bdf8',
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
  const config = useChartConfig(['#34d399', '#38bdf8', '#f59e0b', '#f43f5e']);
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
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="projection-optimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
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
              stroke="#34d399"
              fill="url(#projection-balance)"
              strokeWidth={3}
              fillOpacity={1}
              animationDuration={config.animation.duration}
            />
            <Line
              type="monotone"
              dataKey="projectionBalance"
              name="Projection"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={config.animation.duration}
            />
            <Area
              type="monotone"
              dataKey="optimistic"
              name="Zone optimiste"
              stroke="#38bdf8"
              fill="url(#projection-optimistic)"
              strokeWidth={2}
              fillOpacity={1}
              animationDuration={config.animation.duration}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              name="Scenario prudent"
              stroke="#f43f5e"
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
