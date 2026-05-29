import { Activity, ArrowUpRight, ChevronRight, PieChart, TrendingUp, Wallet } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Transaction } from '../../features/finance/types';
import { cx, uiRecipes } from '../../theme/recipes';
import { chartPalette, chartToneByIntent, toneClassNames } from '../../theme/tokens';
import { formatChartCurrency } from '../../utils/chartHelpers';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { HorizontalBarsChart, SparklineChart } from '../common/InlineCharts';
import ModalShell from '../common/ModalShell';

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
  budgetUsageData?: Array<{
    name: string;
    spent: number;
    limit: number;
    percent: number;
  }>;
  onSelectTransaction?: (transaction: Transaction) => void;
}

const TacticalFinanceCharts: React.FC<TacticalFinanceChartsProps> = ({ fluxData, categoryData, budgetUsageData = [], onSelectTransaction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const safeFluxData = useMemo(() => (Array.isArray(fluxData) ? fluxData : []), [fluxData]);
  const safeCategoryData = useMemo(() => (Array.isArray(categoryData) ? categoryData : []), [categoryData]);
  const safeBudgetUsageData = useMemo(() => (Array.isArray(budgetUsageData) ? budgetUsageData : []), [budgetUsageData]);

  const menuDetails: Record<string, any> = {
    flux: {
      title: 'Analyse des flux',
      icon: Activity,
      tone: toneClassNames.warning,
      chartColor: chartToneByIntent.warning,
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
          value: formatChartCurrency(amount),
          progress: Math.min(100, (amount / Math.max(...safeFluxData.map((entry) => Number(entry.amount || 0)), 1)) * 100),
          flowType: type,
          flowLabel: type === 'deposit' ? 'Revenu' : 'Depense',
        };
      }),
      action: 'Optimiser liquidites',
    },
    categories: {
      title: 'Repartition',
      icon: PieChart,
      tone: toneClassNames.info,
      chartColor: chartToneByIntent.info,
      description: "Segmentation des depenses par vecteurs d'operation.",
      stats: safeCategoryData.map((item) => ({
        label: item.name,
        value: formatChartCurrency(item.value),
        progress:
          safeCategoryData.length > 0
            ? (Number(item.value || 0) / Math.max(...safeCategoryData.map((entry) => Number(entry.value || 0)), 1)) * 100
            : 0,
      })),
      action: 'Reallouer budget',
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
        icon={<Icon size={20} className={menu.tone.icon} />}
        maxWidthClassName="max-w-lg"
        centered
        bodyClassName="space-y-6"
        footer={
          <button type="button" onClick={() => setActiveMenu(null)} className={cx(uiRecipes.primaryButton, 'w-full')}>
            {menu.action} <ChevronRight size={14} className="ml-2 inline-block" />
          </button>
        }
      >
        <p className="text-xs font-medium leading-relaxed text-[color:var(--text-secondary)]">{menu.description}</p>

        <div className="max-h-[52dvh] space-y-4 overflow-y-auto pr-1">
          {isEmpty ? (
            <div className={cx(uiRecipes.emptyState, 'px-5 py-10')}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Aucune donnee</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">Aucune donnee exploitable n'est disponible pour ce panneau.</p>
            </div>
          ) : (
            menu.stats.map((item: any, index: number) => (
              <button
                key={`${activeMenu}-${index}`}
                type="button"
                onClick={() => item.transaction && onSelectTransaction?.(item.transaction)}
                className={cx(uiRecipes.card, 'block w-full p-4 text-left hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-muted)]')}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">{item.label}</span>
                    {item.flowType ? (
                      <span className={cx(uiRecipes.chip, item.flowType === 'deposit' ? toneClassNames.success.chip : toneClassNames.danger.chip)}>
                        {item.flowLabel}
                      </span>
                    ) : null}
                  </div>
                  <span className={`text-xs font-black italic ${item.flowType === 'deposit' ? toneClassNames.success.text : item.flowType === 'expense' ? toneClassNames.danger.text : menu.tone.text}`}>
                    {item.flowType === 'deposit' ? '+' : item.flowType === 'expense' ? '-' : ''}
                    {item.value}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    className={`h-full opacity-80 transition-all duration-1000 ${item.flowType === 'deposit' ? 'bg-[color:var(--success)]' : item.flowType === 'expense' ? 'bg-[color:var(--danger)]' : menu.tone.progress}`}
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
      <div onClick={() => setActiveMenu('flux')} className={cx(uiRecipes.cardElevated, 'min-h-[320px] cursor-pointer overflow-hidden p-5 sm:p-6')}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className={toneClassNames.warning.icon} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-[color:var(--heading)]">Analyse des flux</h3>
          </div>
          <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--tone-warning-text)]" size={16} />
        </div>

        <div className="w-full flex-1">
          {safeFluxData.length === 0 ? (
            <div className={cx(uiRecipes.emptyState, 'flex h-full min-h-[220px] items-center justify-center')}>
              <p className="max-w-[180px] text-[11px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Aucun flux recent a afficher.</p>
            </div>
          ) : (
            <ChartErrorBoundary fallbackTitle="Flux indisponibles" minHeightClassName="min-h-[220px]" resetKey={safeFluxData.length}>
              <SparklineChart
                data={safeFluxData.map((item) => ({
                  label: String(item.date || ''),
                  value: Number(item.signedAmount ?? item.amount ?? 0),
                }))}
                stroke={chartToneByIntent.warning}
                fill={chartToneByIntent.warning}
                showArea
                showDots
                height={220}
              />
            </ChartErrorBoundary>
          )}
        </div>
      </div>

      <div onClick={() => setActiveMenu('categories')} className={cx(uiRecipes.cardElevated, 'min-h-[320px] cursor-pointer overflow-hidden p-5 sm:p-6')}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PieChart size={18} className={toneClassNames.info.icon} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-[color:var(--heading)]">Repartition par categorie</h3>
          </div>
          <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--tone-info-text)]" size={16} />
        </div>

        <div className="h-full flex-1 w-full rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] p-4">
          {safeCategoryData.length === 0 ? (
            <div className={cx(uiRecipes.emptyState, 'flex h-full min-h-[220px] items-center justify-center')}>
              <p className="max-w-[180px] text-[11px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Aucune categorie depensee pour l'instant.</p>
            </div>
          ) : (
            <ChartErrorBoundary fallbackTitle="Repartition indisponible" minHeightClassName="min-h-[220px]" resetKey={safeCategoryData.length}>
              <HorizontalBarsChart
                data={safeCategoryData.map((item) => ({
                  label: String(item.name || ''),
                  value: Number(item.value || 0),
                }))}
                getColor={(_, index) => chartPalette[index % chartPalette.length]}
              />
            </ChartErrorBoundary>
          )}
        </div>
      </div>

      <div className={cx(uiRecipes.cardElevated, 'min-h-[320px] overflow-hidden p-5 sm:p-6')}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet size={18} className={toneClassNames.warning.icon} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] italic text-[color:var(--heading)]">Consommation vs budget</h3>
          </div>
          <ArrowUpRight className="text-[color:var(--text-muted)]" size={16} />
        </div>

        <div className="space-y-3">
          {safeBudgetUsageData.length === 0 ? (
            <div className={cx(uiRecipes.emptyState, 'min-h-[220px] p-4')}>Aucune consommation budgétaire à afficher.</div>
          ) : (
            safeBudgetUsageData.slice(0, 5).map((item) => (
              <div key={item.name} className="rounded-[1.25rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  <span>{item.name}</span>
                  <span className="text-[color:var(--heading)]">{Math.round(item.percent)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--tone-warning-surface)]"
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[color:var(--text-secondary)]">
                  <span>Utilisé {formatChartCurrency(item.spent)}</span>
                  <span>Budget {formatChartCurrency(item.limit)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {renderMenu()}
    </div>
  );
};

export default TacticalFinanceCharts;
