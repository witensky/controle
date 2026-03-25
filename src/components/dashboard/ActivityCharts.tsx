import React, { useState } from 'react';
import { Target, Zap, Activity, TrendingUp, LayoutGrid, Plus, ChevronRight, ArrowUpRight } from 'lucide-react';
import { AppView } from '../../types';
import ModalShell from '../common/ModalShell';
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import { SparklineChart, VerticalBarsChart } from '../common/InlineCharts';
import { RadarChartComponent } from '../charts';

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
    onNavigate
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const safeFocusAreaData = Array.isArray(focusAreaData) ? focusAreaData : [];
    const safeEnergyData = Array.isArray(energyData) ? energyData : [];
    const safeWorkIntensityData = Array.isArray(workIntensityData) ? workIntensityData : [];
    const safeMasteryTrendData = Array.isArray(masteryTrendData) ? masteryTrendData : [];
    const safeMissions = Array.isArray(missions) ? missions : [];
    const pendingMissions = safeMissions.filter((mission) => !String(mission.status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('termine'));
    const completedMissionCount = safeMissions.filter((mission) => String(mission.status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('termine')).length;
    const completionRate = Math.round((completedMissionCount / (safeMissions.length || 1)) * 100);

    const menuDetails: Record<string, any> = {
        focus: {
            title: "Equilibre de vie",
            icon: Target,
            color: "text-blue-500",
            description: "Repartition de l'energie et des accomplissements par domaine.",
            stats: safeFocusAreaData.map((item) => ({ label: item.subject, value: `${item.A}%`, progress: item.A })),
            action: { label: "Voir parametres", view: "SETTINGS" }
        },
        energy: {
            title: "Courbe d'energie",
            icon: Zap,
            color: "text-emerald-500",
            description: "Analyse des pics d'energie sur la journee.",
            stats: [
                { label: "Matin (09h)", value: "Haut", progress: 85 },
                { label: "Apres-midi (15h)", value: "Bas", progress: 55 },
                { label: "Soir (18h)", value: "Recuperation", progress: 80 }
            ],
            action: { label: "Gerer routines", view: "DISCIPLINE" }
        },
        work: {
            title: "Intensite de travail",
            icon: Activity,
            color: "text-rose-500",
            description: "Charge de travail actuelle sur les modules d'etudes.",
            stats: safeWorkIntensityData.map((item) => ({
                label: item.name,
                value: `${item.value}/${item.total || 0} Ch.`,
                progress: item.total ? (item.value / item.total) * 100 : 0
            })),
            action: { label: "Ouvrir etudes", view: "STUDIES" }
        },
        mastery: {
            title: "Progression globale",
            icon: TrendingUp,
            color: "text-amber-500",
            description: "Évolution de l'XP globale et progression du niveau.",
            stats: [
                { label: "XP totale", value: safeMasteryTrendData[safeMasteryTrendData.length - 1]?.xp || 0, progress: 65 },
                { label: "Niveau actuel", value: "Confirme", progress: 100 }
            ],
            action: { label: "Voir profil", view: "PROFILE" }
        }
    };

    const renderMenu = () => {
        if (!activeMenu) return null;
        const menu = menuDetails[activeMenu];
        if (!menu) return null;

        const Icon = menu.icon;
        const isEmpty = menu.stats.length === 0;
        const emptyMessage = activeMenu === 'work'
            ? "Aucun cours n'est encore enregistre dans la section Etudes, donc l'intensite de travail reste vide."
            : "Aucune donnee n'est encore disponible pour ce panneau.";

        return (
            <ModalShell
                isOpen
                onClose={() => setActiveMenu(null)}
                title={menu.title}
                subtitle="Details"
                icon={<Icon size={20} className={menu.color} />}
                centered
                maxWidthClassName="max-w-xl"
                bodyClassName="space-y-5 pb-6 sm:pb-8"
                panelClassName="animate-in zoom-in-95 duration-200"
                footer={(
                    <button
                        type="button"
                        onClick={() => {
                            onNavigate(menu.action.view as AppView);
                            setActiveMenu(null);
                        }}
                        className="w-full rounded-2xl bg-white px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all hover:bg-slate-200 active:scale-[0.99] sm:py-5"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {menu.action.label} <ChevronRight size={14} />
                        </span>
                    </button>
                )}
            >
                <p className="max-w-md text-sm font-medium leading-7 text-slate-400">
                    {menu.description}
                </p>

                {isEmpty ? (
                    <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/35 px-5 py-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Aucune donnee</p>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {menu.stats.map((stat: any, idx: number) => (
                            <div key={idx} className="rounded-[1.5rem] border border-white/5 bg-slate-950/50 px-4 py-4 sm:px-5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{stat.label}</span>
                                    <span className={`text-sm font-black italic ${menu.color}`}>{stat.value}</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                                    <div
                                        className={`h-full opacity-70 transition-all duration-1000 ${menu.color.replace('text-', 'bg-')}`}
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                <div
                    onClick={() => setActiveMenu('focus')}
                    className="col-span-2 glass rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border-white/5 bg-[#0b1121]/60 flex flex-col cursor-pointer hover:border-blue-500/20 transition-all group lg:col-span-1"
                >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2">
                            <Target className="text-blue-500" size={16} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic font-outfit">Matrice d'activite</h3>
                        </div>
                        <ArrowUpRight className="text-slate-700 group-hover:text-blue-500 transition-colors" size={14} />
                    </div>
                    <div className="h-[170px] sm:h-[200px] w-full flex-1">
                        <ChartErrorBoundary fallbackTitle="Matrice indisponible" minHeightClassName="min-h-[170px] sm:min-h-[200px]">
                            <RadarChartComponent
                                data={safeFocusAreaData}
                                angleKey="subject"
                                valueKey="A"
                                color="#3b82f6"
                                emptyMessage="Aucune donnee de focus disponible."
                                fallbackTitle="Matrice indisponible"
                                heightClassName="h-[170px] sm:h-[200px]"
                                minHeightClassName="min-h-[170px] sm:min-h-[200px]"
                            />
                        </ChartErrorBoundary>
                    </div>
                </div>

                <div
                    onClick={() => setActiveMenu('energy')}
                    className="glass rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border-white/5 bg-[#0b1121]/60 flex flex-col cursor-pointer hover:border-emerald-500/20 transition-all group"
                >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2">
                            <Zap className="text-emerald-500" size={16} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic font-outfit">Courbe d'energie</h3>
                        </div>
                        <ArrowUpRight className="text-slate-700 group-hover:text-emerald-500 transition-colors" size={14} />
                    </div>
                    <div className="h-[140px] sm:h-[200px] w-full flex-1">
                        <ChartErrorBoundary fallbackTitle="Courbe indisponible" minHeightClassName="min-h-[140px] sm:min-h-[200px]">
                            <SparklineChart
                                data={safeEnergyData.map((item) => ({ label: item.time, value: Number(item.level || 0) }))}
                                stroke="#10b981"
                                showDots
                                height={180}
                            />
                        </ChartErrorBoundary>
                    </div>
                </div>

                <div
                    onClick={() => setActiveMenu('work')}
                    className="glass rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border-white/5 bg-[#0b1121]/60 flex flex-col cursor-pointer hover:border-rose-500/20 transition-all group"
                >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="text-rose-500" size={16} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic font-outfit">Intensite de travail</h3>
                        </div>
                        <ArrowUpRight className="text-slate-700 group-hover:text-rose-500 transition-colors" size={14} />
                    </div>
                    <div className="h-[140px] sm:h-[200px] w-full flex-1">
                        {safeWorkIntensityData.length === 0 ? (
                            <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-950/30 px-4 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                                    Aucun cours enregistre
                                </p>
                            </div>
                        ) : (
                            <ChartErrorBoundary fallbackTitle="Charge indisponible" minHeightClassName="min-h-[140px] sm:min-h-[200px]">
                                <VerticalBarsChart
                                    data={safeWorkIntensityData.map((item) => ({ label: item.name, value: Number(item.value || 0) }))}
                                    colors={['#f43f5e', '#334155']}
                                />
                            </ChartErrorBoundary>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div
                    onClick={() => setActiveMenu('mastery')}
                    className="lg:col-span-7 glass rounded-[2rem] p-6 border-white/5 bg-[#0b1121]/60 flex flex-col h-[300px] cursor-pointer hover:border-amber-500/20 transition-all group"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-amber-500" size={16} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic font-outfit">Progression globale</h3>
                        </div>
                        <ArrowUpRight className="text-slate-700 group-hover:text-amber-500 transition-colors" size={14} />
                    </div>
                    <div className="w-full flex-1">
                        <ChartErrorBoundary fallbackTitle="Progression indisponible" minHeightClassName="min-h-[200px]">
                            <SparklineChart
                                data={safeMasteryTrendData.map((item) => ({ label: item.date, value: Number(item.xp || 0) }))}
                                stroke="#f59e0b"
                                fill="#f59e0b"
                                showArea
                                height={220}
                            />
                        </ChartErrorBoundary>
                    </div>
                </div>

                <div className="lg:col-span-5 glass rounded-[2rem] p-6 border border-[color:var(--border)] bg-[color:var(--card)] flex flex-col h-[300px] shadow-card dark:border-white/5 dark:bg-[#0b1121]/60">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="text-amber-500" size={16} />
                            <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.2em] italic font-outfit dark:text-white">Objectifs prioritaires</h3>
                        </div>
                        <span className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">
                            {completionRate}% Accomplis
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {pendingMissions.slice(0, 4).map((mission, idx) => (
                            <div key={mission.id || idx} className="flex items-center justify-between p-4 rounded-2xl group transition-all border border-[color:var(--border)] bg-[color:var(--surface-2)] hover:border-amber-500/20 dark:border-white/5 dark:bg-slate-950/40">
                                <p className="text-xs font-bold text-[color:var(--text-primary)] transition-colors truncate max-w-[150px] dark:text-slate-300 dark:group-hover:text-white">
                                    {mission.title}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => onNavigate('DISCIPLINE')}
                                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] dark:border-white/10 dark:text-slate-600 dark:hover:border-white/20 dark:hover:text-white"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        ))}

                        {pendingMissions.length === 0 ? (
                            <div className="flex h-full min-h-[190px] items-center">
                                <div className="w-full rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-6 text-center shadow-card dark:border-white/10 dark:bg-slate-950/35">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Target size={18} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600 dark:text-emerald-300">
                                        Tout est à jour
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)] dark:text-slate-500">
                                        Aucun objectif prioritaire en attente pour le moment.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate('DISCIPLINE')}
                                        className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-primary)] transition-all hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-amber-200"
                                    >
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
