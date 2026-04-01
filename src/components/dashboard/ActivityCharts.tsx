import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  LayoutGrid,
  PieChart,
  Plus,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AppView } from '../../types';
import ModalShell from '../common/ModalShell';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { SparklineChart, VerticalBarsChart } from '../common/InlineCharts';
import { RadarChartComponent } from '../charts';
import { chartToneByIntent, toneClassNames } from '../../theme/tokens';
import { cx, uiRecipes } from '../../theme/recipes';

interface ActivityChartsProps {
  focusAreaData: any[];
  energyData: any[];
  workIntensityData: any[];
  masteryTrendData: any[];
  missions: any[];
  onNavigate: (view: AppView) => void;
}

const ActivityCharts: React.FC<ActivityChartsProps> = ({
  focusAreaData,
  energyData,
  workIntensityData,
  masteryTrendData,
  missions,
  onNavigate,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const safeFocusAreaData = Array.isArray(focusAreaData) ? focusAreaData : [];
  const safeEnergyData = Array.isArray(energyData) ? energyData : [];
  const safeWorkIntensityData = Array.isArray(workIntensityData) ? workIntensityData : [];
  const safeMasteryTrendData = Array.isArray(masteryTrendData) ? masteryTrendData : [];
  const safeMissions = Array.isArray(missions) ? missions : [];
  const pendingMissions = safeMissions.filter(
    (mission) =>
      !String(mission.status || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes('termine'),
  );
  const completedMissionCount = safeMissions.filter((mission) =>
    String(mission.status || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes('termine'),
  ).length;
  const completionRate = Math.round((completedMissionCount / (safeMissions.length || 1)) * 100);

  const tones = {
    focus: toneClassNames.info,
    energy: toneClassNames.success,
    work: toneClassNames.danger,
    mastery: toneClassNames.warning,
  } as const;

  const menuDetails: Record<string, any> = {
    focus: {
      title: 'Equilibre de vie',
      icon: Target,
      tone: tones.focus,
      chartColor: chartToneByIntent.info,
      description: "Repartition de l'energie et des accomplissements par domaine.",
      stats: safeFocusAreaData.map((item) => ({ label: item.subject, value: `${item.A}%`, progress: item.A })),
      action: { label: 'Voir parametres', view: 'SETTINGS' },
    },
    energy: {
      title: "Courbe d'energie",
      icon: Zap,
      tone: tones.energy,
      chartColor: chartToneByIntent.success,
      description: "Analyse des pics d'energie sur la journee.",
      stats: [
        { label: 'Matin (09h)', value: 'Haut', progress: 85 },
        { label: 'Apres-midi (15h)', value: 'Bas', progress: 55 },
        { label: 'Soir (18h)', value: 'Recuperation', progress: 80 },
      ],
      action: { label: 'Gerer routines', view: 'DISCIPLINE' },
    },
    work: {
      title: 'Intensite de travail',
      icon: Activity,
      tone: tones.work,
      chartColor: chartToneByIntent.danger,
      description: "Charge de travail actuelle sur les modules d'etudes.",
      stats: safeWorkIntensityData.map((item) => ({
        label: item.name,
        value: `${item.value}/${item.total || 0} Ch.`,
        progress: item.total ? (item.value / item.total) * 100 : 0,
      })),
      action: { label: 'Ouvrir etudes', view: 'STUDIES' },
    },
    mastery: {
      title: 'Progression globale',
      icon: TrendingUp,
      tone: tones.mastery,
      chartColor: chartToneByIntent.warning,
      description: "Evolution de l'XP globale et progression du niveau.",
      stats: [
        { label: 'XP totale', value: safeMasteryTrendData[safeMasteryTrendData.length - 1]?.xp || 0, progress: 65 },
        { label: 'Niveau actuel', value: 'Confirme', progress: 100 },
      ],
      action: { label: 'Voir profil', view: 'PROFILE' },
    },
  };

  const renderMenu = () => {
    if (!activeMenu) return null;

    const menu = menuDetails[activeMenu];
    if (!menu) return null;

    const Icon = menu.icon;
    const isEmpty = menu.stats.length === 0;
    const emptyMessage =
      activeMenu === 'work'
        ? "Aucun cours n'est encore enregistre dans la section Etudes, donc l'intensite de travail reste vide."
        : "Aucune donnee n'est encore disponible pour ce panneau.";

    return (
      <ModalShell
        isOpen
        onClose={() => setActiveMenu(null)}
        title={menu.title}
        subtitle="Details"
        icon={<Icon size={20} className={menu.tone.icon} />}
        centered
        maxWidthClassName="max-w-xl"
        bodyClassName="space-y-5 pb-6 sm:pb-8"
        panelClassName="animate-in zoom-in-95 duration-200"
        footer={
          <button
            type="button"
            onClick={() => {
              onNavigate(menu.action.view as AppView);
              setActiveMenu(null);
            }}
            className={cx(uiRecipes.primaryButton, 'w-full')}
          >
            <span className="flex items-center justify-center gap-2">
              {menu.action.label} <ChevronRight size={14} />
            </span>
          </button>
        }
      >
        <p className="max-w-md text-sm font-medium leading-7 text-[color:var(--text-secondary)]">{menu.description}</p>

        {isEmpty ? (
          <div className={cx(uiRecipes.emptyState, 'px-5 py-10')}>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Aucune donnee</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {menu.stats.map((stat: any, idx: number) => (
              <div key={idx} className={cx(uiRecipes.card, 'px-4 py-4 sm:px-5')}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{stat.label}</span>
                  <span className={`text-sm font-black italic ${menu.tone.text}`}>{stat.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    className={`h-full rounded-full opacity-95 transition-all duration-700 ${menu.tone.progress}`}
                    style={{ width: `${Math.min(100, stat.progress)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalShell>
    );
  };

  const tileClass = 'flex cursor-pointer flex-col rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6';
  const chartShellClass = 'h-[140px] flex-1 rounded-[1.2rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] p-4 sm:h-[200px]';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        <div onClick={() => setActiveMenu('focus')} className={cx(uiRecipes.cardElevated, tileClass, 'col-span-2 lg:col-span-1')}>
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-2">
              <Target className={tones.focus.icon} size={16} />
              <h3 className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--heading)]">
                Matrice d'activite
              </h3>
            </div>
            <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text)]" size={14} />
          </div>
          <div className={chartShellClass}>
            <ChartErrorBoundary fallbackTitle="Matrice indisponible" minHeightClassName="min-h-[170px] sm:min-h-[200px]">
              <RadarChartComponent
                data={safeFocusAreaData}
                angleKey="subject"
                valueKey="A"
                color={chartToneByIntent.info}
                emptyMessage="Aucune donnee de focus disponible."
                fallbackTitle="Matrice indisponible"
                heightClassName="h-[170px] sm:h-[200px]"
                minHeightClassName="min-h-[170px] sm:min-h-[200px]"
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <div onClick={() => setActiveMenu('energy')} className={cx(uiRecipes.cardElevated, tileClass)}>
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-2">
              <Zap className={tones.energy.icon} size={16} />
              <h3 className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--heading)]">
                Courbe d'energie
              </h3>
            </div>
            <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text)]" size={14} />
          </div>
          <div className={chartShellClass}>
            <ChartErrorBoundary fallbackTitle="Courbe indisponible" minHeightClassName="min-h-[140px] sm:min-h-[200px]">
              <SparklineChart
                data={safeEnergyData.map((item) => ({ label: item.time, value: Number(item.level || 0) }))}
                stroke={chartToneByIntent.success}
                showDots
                height={180}
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <div onClick={() => setActiveMenu('work')} className={cx(uiRecipes.cardElevated, tileClass)}>
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-2">
              <Activity className={tones.work.icon} size={16} />
              <h3 className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--heading)]">
                Intensite de travail
              </h3>
            </div>
            <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text)]" size={14} />
          </div>
          <div className={chartShellClass}>
            {safeWorkIntensityData.length === 0 ? (
              <div className={cx(uiRecipes.emptyState, 'flex h-full items-center justify-center rounded-[1.25rem] px-4')}>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Aucun cours enregistre</p>
              </div>
            ) : (
              <ChartErrorBoundary fallbackTitle="Charge indisponible" minHeightClassName="min-h-[140px] sm:min-h-[200px]">
                <VerticalBarsChart
                  data={safeWorkIntensityData.map((item) => ({ label: item.name, value: Number(item.value || 0) }))}
                  colors={[chartToneByIntent.danger, chartToneByIntent.info, chartToneByIntent.warning, chartToneByIntent.primary]}
                />
              </ChartErrorBoundary>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div onClick={() => setActiveMenu('mastery')} className={cx(uiRecipes.cardElevated, 'group flex cursor-pointer flex-col p-6 lg:col-span-7')}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={tones.mastery.icon} size={16} />
              <h3 className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--heading)]">
                Progression globale
              </h3>
            </div>
            <ArrowUpRight className="text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text)]" size={14} />
          </div>
          <div className="h-40 w-full flex-1 rounded-[1.2rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] p-4 sm:h-[220px]">
            <ChartErrorBoundary fallbackTitle="Progression indisponible" minHeightClassName="min-h-[200px]">
              <SparklineChart
                data={safeMasteryTrendData.map((item) => ({ label: item.date, value: Number(item.xp || 0) }))}
                stroke={chartToneByIntent.warning}
                fill={chartToneByIntent.warning}
                showArea
                height={200}
              />
            </ChartErrorBoundary>
          </div>
        </div>

        <div className={cx(uiRecipes.cardElevated, 'flex h-[300px] flex-col p-4 lg:col-span-5')}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className={tones.mastery.icon} size={16} />
              <h3 className="font-outfit text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--heading)]">
                Objectifs prioritaires
              </h3>
            </div>
            <span className="text-xs font-semibold text-[color:var(--text-muted)]">{completionRate}% accomplis</span>
          </div>

          <div className="mb-4 h-2 w-full rounded-full bg-[color:var(--surface-muted)]">
            <div className="h-2 rounded-full bg-[color:var(--warning)]" style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }} />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {pendingMissions.slice(0, 4).map((mission, idx) => (
              <div key={mission.id || idx} className={cx(uiRecipes.card, 'flex items-center justify-between p-4')}>
                <p className="max-w-[150px] truncate text-xs font-bold text-[color:var(--heading)]">{mission.title}</p>
                <button
                  type="button"
                  onClick={() => onNavigate('DISCIPLINE')}
                  className={cx(uiRecipes.ghostButton, 'h-8 w-8 rounded-lg px-0 py-0')}
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}

            {pendingMissions.length === 0 ? (
              <div className="flex h-full min-h-[190px] items-center">
                <div className={cx(uiRecipes.emptyState, 'w-full p-6')}>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)]">
                    <Target size={18} className="text-[color:var(--tone-success-text)]" />
                  </div>
                  <p className="text-sm font-medium text-[color:var(--tone-success-text)]">Tout est a jour</p>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Aucun objectif prioritaire en attente pour le moment.</p>
                  <button type="button" onClick={() => onNavigate('DISCIPLINE')} className={cx(uiRecipes.secondaryButton, 'mt-5 inline-flex gap-2')}>
                    Ajouter un objectif
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {renderMenu()}
    </div>
  );
};

export default ActivityCharts;
