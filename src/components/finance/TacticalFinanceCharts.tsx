import React, { useMemo, useState } from 'react';
import { TrendingUp, PieChart, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { HorizontalBarsChart, SparklineChart } from '../common/InlineCharts';
import { Transaction } from '../../features/finance/types';

interface TacticalFinanceChartsProps {
  fluxData: Array<{
    id: string;
    date: string;
    title: string;
    category: string;
    amount: number;
    type?: 'expense' | 'deposit';
    signedAmount?: number;
    comment?: string;
    source?: string;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  onSelectTransaction?: (transaction: Transaction) => void;
}

const CATEGORY_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#64748b'];

const TacticalFinanceCharts: React.FC<TacticalFinanceChartsProps> = ({ fluxData, categoryData, onSelectTransaction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const safeFluxData = useMemo(() => (Array.isArray(fluxData) ? fluxData : []), [fluxData]);
  const safeCategoryData = useMemo(() => (Array.isArray(categoryData) ? categoryData : []), [categoryData]);

  const menuDetails: Record<string, any> = {
    flux: {
      title: 'Analyse des Flux',
      icon: Activity,
      color: 'text-amber-500',
      description: "Suivi temporel de l'intensite des entrees et sorties de capitaux.",
      stats: safeFluxData.slice(-5).map((item) => {
        const amount = Number(item.amount || 0);
        const type = item.type === 'deposit' ? 'deposit' : 'expense';
        return {
          transaction: {
            id: item.id,
            user_id: '',
            date: item.date,
            title: item.title,
            category: item.category,
            amount,
            type,
            comment: item.comment,
            source: item.source,
          } satisfies Transaction,
          label: `Date: ${String(item.date || '').split('-').pop() || item.date}`,
          value: `${amount.toLocaleString()} DH`,
          progress: Math.min(100, (amount / Math.max(...safeFluxData.map((entry) => Number(entry.amount || 0)), 1)) * 100),
          flowType: type,
          flowLabel: type === 'deposit' ? 'Revenu' : 'Depense',
        };
      }),
      action: 'Optimiser Liquidites',
    },
    categories: {
      title: 'Repartition',
      icon: PieChart,
      color: 'text-blue-500',
      description: "Segmentation des depenses par vecteurs d'operation.",
      stats: safeCategoryData.map((item) => ({
        label: item.name,
        value: `${item.value} DH`,
        progress:
          safeCategoryData.length > 0
            ? (Number(item.value || 0) / Math.max(...safeCategoryData.map((entry) => Number(entry.value || 0)), 1)) * 100
            : 0,
      })),
      action: 'Reallouer Budget',
    },
  };

  const renderMenu = () => {
    if (!activeMenu) return null;

    const menu = menuDetails[activeMenu];
    if (!menu) return null;

    const Icon = menu.icon;
    const isEmpty = !Array.isArray(menu.stats) || menu.stats.length === 0;

    return (
      <ModalShell
        isOpen={Boolean(activeMenu)}
        onClose={() => setActiveMenu(null)}
        title={menu.title}
        subtitle="Finance intelligence"
        icon={<Icon size={20} className={menu.color} />}
        maxWidthClassName="max-w-lg"
        centered
        bodyClassName="space-y-6"
        footer={
          <button
            type="button"
            onClick={() => setActiveMenu(null)}
            className="w-full rounded-2xl bg-white px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all"
          >
            {menu.action} <ChevronRight size={14} className="ml-2 inline-block" />
          </button>
        }
      >
        <p className="text-xs font-medium leading-relaxed text-slate-400">{menu.description}</p>

        <div className="max-h-[52dvh] space-y-4 overflow-y-auto pr-1">
          {isEmpty ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/35 px-5 py-10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Aucune donnee</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Aucune donnee exploitable n&apos;est disponible pour ce panneau.
              </p>
            </div>
          ) : (
            menu.stats.map((item: any, index: number) => (
              <button
                key={`${activeMenu}-${index}`}
                type="button"
                onClick={() => item.transaction && onSelectTransaction?.(item.transaction)}
                className="block w-full rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-left transition-all hover:border-white/10 hover:bg-slate-950/70"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.label}</span>
                    {item.flowType ? (
                      <span
                        className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${
                          item.flowType === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {item.flowLabel}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs font-black italic ${
                      item.flowType === 'deposit'
                        ? 'text-emerald-400'
                        : item.flowType === 'expense'
                          ? 'text-rose-400'
                          : menu.color
                    }`}
                  >
                    {item.flowType === 'deposit' ? '+' : item.flowType === 'expense' ? '-' : ''}
                    {item.value}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className={`h-full opacity-70 transition-all duration-1000 ${
                      item.flowType === 'deposit'
                        ? 'bg-emerald-500'
                        : item.flowType === 'expense'
                          ? 'bg-rose-500'
                          : menu.color.replace('text-', 'bg-')
                    }`}
                    style={{ width: `${Math.min(100, Number(item.progress || 0))}%` }}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </ModalShell>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <div
        onClick={() => setActiveMenu('flux')}
        className="glass min-h-[320px] cursor-pointer overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-all hover:border-amber-500/20 group shadow-card dark:border-white/5 dark:bg-[#0b1121]/60 sm:p-6"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-amber-500" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-[color:var(--text-primary)] dark:text-white">Analyse des Flux</h3>
          </div>
          <ArrowUpRight className="text-slate-700 transition-colors group-hover:text-amber-500" size={16} />
        </div>

        <div className="flex-1 w-full">
          {safeFluxData.length === 0 ? (
            <div className="flex min-h-[220px] h-full items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] text-center dark:border-white/10 dark:bg-slate-950/20">
              <p className="max-w-[180px] text-[11px] font-black uppercase tracking-widest text-[color:var(--text-muted)] dark:text-slate-500">Aucun flux récent à afficher.</p>
            </div>
          ) : (
            <ChartErrorBoundary fallbackTitle="Flux indisponibles" minHeightClassName="min-h-[220px]" resetKey={safeFluxData.length}>
              <SparklineChart
                data={safeFluxData.map((item) => ({
                  label: String(item.date || ''),
                  value: Number(item.signedAmount ?? item.amount ?? 0),
                }))}
                stroke="#f59e0b"
                fill="#f59e0b"
                showArea
                showDots
                height={220}
              />
            </ChartErrorBoundary>
          )}
        </div>
      </div>

      <div
        onClick={() => setActiveMenu('categories')}
        className="glass min-h-[320px] cursor-pointer overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-all hover:border-blue-500/20 group shadow-card dark:border-white/5 dark:bg-[#0b1121]/60 sm:p-6"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PieChart size={18} className="text-blue-500" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-[color:var(--text-primary)] dark:text-white">Répartition par Catégorie</h3>
          </div>
          <ArrowUpRight className="text-slate-700 transition-colors group-hover:text-blue-500" size={16} />
        </div>

        <div className="h-full flex-1 w-full rounded-3xl bg-[color:var(--surface-2)] p-4 dark:bg-slate-950/20">
          {safeCategoryData.length === 0 ? (
            <div className="flex min-h-[220px] h-full items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] text-center dark:border-white/10 dark:bg-slate-950/20">
              <p className="max-w-[180px] text-[11px] font-black uppercase tracking-widest text-[color:var(--text-muted)] dark:text-slate-500">Aucune catégorie dépensée pour l&apos;instant.</p>
            </div>
          ) : (
            <ChartErrorBoundary fallbackTitle="Repartition indisponible" minHeightClassName="min-h-[220px]" resetKey={safeCategoryData.length}>
              <HorizontalBarsChart
                data={safeCategoryData.map((item) => ({
                  label: String(item.name || ''),
                  value: Number(item.value || 0),
                }))}
                getColor={(_, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            </ChartErrorBoundary>
          )}
        </div>
      </div>

      {renderMenu()}
    </div>
  );
};

export default TacticalFinanceCharts;
