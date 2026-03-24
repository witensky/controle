import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Clock, Activity, Brain, Coffee, ArrowUpRight, BookOpen, Languages, X, type LucideIcon } from 'lucide-react';
import { AppView, LawSubject } from '../../types';
import { QuickActionType, dispatchQuickAction } from '../../lib/quickActions';
import { localStore, LOCAL_KEYS } from '../../lib/localStorage';

type PlannerSuggestion = {
    id: string;
    title: string;
    category: string;
    type: string;
    icon: LucideIcon;
    color: string;
    view: AppView;
    actionLabel: string;
    quickAction?: QuickActionType;
    requiresAttention?: boolean;
};

type DismissedTipState = {
    fingerprint: string;
    hiddenUntil: string;
};

interface DailyPlannerProps {
    onNavigate: (view: AppView) => void;
    transactionsCount: number;
    financeRemaining: number;
    totalBudget: number;
    pendingMissions: number;
    subjects: LawSubject[];
    learnedWordsCount: number;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({
    onNavigate,
    transactionsCount,
    financeRemaining,
    totalBudget,
    pendingMissions,
    subjects,
    learnedWordsCount,
}) => {
    const currentHour = new Date().getHours();
    const [dismissedTipState, setDismissedTipState] = useState<DismissedTipState | null>(() => {
        const stored = localStore.get<DismissedTipState | string>(LOCAL_KEYS.DASHBOARD_DISMISSED_TIP);

        if (!stored) return null;

        if (typeof stored === 'string') {
            return {
                fingerprint: stored,
                hiddenUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
        }

        return stored;
    });

    const plannerState = useMemo(() => {
        const remainingRatio = totalBudget > 0 ? financeRemaining / totalBudget : 1;
        const subjectNeedingAttention = subjects
            .slice()
            .sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0))[0];

        const studySuggestion: PlannerSuggestion = subjects.length === 0
            ? {
                id: 'studies-empty',
                title: 'Ajouter votre premier cours',
                category: 'Etudes',
                type: 'Configuration',
                icon: BookOpen,
                color: 'text-blue-500',
                view: 'STUDIES',
                actionLabel: 'Configurer',
                requiresAttention: true,
            }
            : {
                id: 'studies-progress',
                title: `Avancer sur ${subjectNeedingAttention?.name || 'vos cours'}`,
                category: 'Etudes',
                type: `${subjects.length} cours actifs`,
                icon: Brain,
                color: 'text-blue-500',
                view: 'STUDIES',
                actionLabel: 'Ouvrir',
                requiresAttention: false,
            };

        const disciplineSuggestion: PlannerSuggestion = pendingMissions === 0
            ? {
                id: 'missions-empty',
                title: 'Planifier un objectif prioritaire',
                category: 'Discipline',
                type: 'Organisation',
                icon: Clock,
                color: 'text-slate-300',
                view: 'DISCIPLINE',
                actionLabel: 'Creer',
                quickAction: 'add-mission',
                requiresAttention: true,
            }
            : {
                id: 'missions-pending',
                title: 'Traiter vos objectifs du jour',
                category: 'Discipline',
                type: `${pendingMissions} en attente`,
                icon: Clock,
                color: 'text-slate-300',
                view: 'DISCIPLINE',
                actionLabel: 'Voir',
                requiresAttention: true,
            };

        const financeSuggestion: PlannerSuggestion = transactionsCount === 0
            ? {
                id: 'finance-setup',
                title: 'Initialiser budget et finances',
                category: 'Finance',
                type: 'Aucune transaction',
                icon: Activity,
                color: 'text-amber-500',
                view: 'FINANCE',
                actionLabel: 'Ajouter',
                quickAction: 'add-transaction',
                requiresAttention: true,
            }
            : {
                id: 'finance-review',
                title: remainingRatio < 0.35 ? 'Ajuster budget et depenses' : 'Gestion budget et finances',
                category: 'Finance',
                type: `Reste ${Math.round(financeRemaining)} DH`,
                icon: Activity,
                color: 'text-amber-500',
                view: 'FINANCE',
                actionLabel: 'Ouvrir',
                requiresAttention: remainingRatio < 0.35,
            };

        const recoverySuggestion: PlannerSuggestion = {
            id: 'recovery',
            title: 'Pause recuperation',
            category: 'Sante',
            type: 'Repos',
            icon: Coffee,
            color: 'text-emerald-500',
            view: 'DISCIPLINE',
            actionLabel: 'Rituels',
            requiresAttention: false,
        };

        const languageSuggestion: PlannerSuggestion = learnedWordsCount < 10
            ? {
                id: 'languages-build',
                title: 'Lancer une session langues',
                category: 'Langues',
                type: `${learnedWordsCount} mots memorises`,
                icon: Languages,
                color: 'text-violet-500',
                view: 'LANGUAGES',
                actionLabel: 'Ouvrir',
                requiresAttention: true,
            }
            : {
                id: 'languages-review',
                title: 'Reviser votre vocabulaire',
                category: 'Langues',
                type: `${learnedWordsCount} mots acquis`,
                icon: Languages,
                color: 'text-violet-500',
                view: 'LANGUAGES',
                actionLabel: 'Reviser',
                requiresAttention: false,
            };

        const attentionSuggestions = [studySuggestion, disciplineSuggestion, financeSuggestion, languageSuggestion]
            .filter((slot) => slot.requiresAttention);

        const visibleSuggestions =
            currentHour < 10
                ? [studySuggestion, disciplineSuggestion]
                : currentHour < 14
                    ? [financeSuggestion, recoverySuggestion]
                    : currentHour < 18
                        ? [studySuggestion, languageSuggestion]
                        : [disciplineSuggestion, financeSuggestion];

        return {
            attentionSuggestions,
            visibleSuggestions,
        };
    }, [currentHour, financeRemaining, learnedWordsCount, pendingMissions, subjects, totalBudget, transactionsCount]);

    const tipSlots = useMemo(
        () => plannerState.visibleSuggestions.filter((slot) => slot.requiresAttention),
        [plannerState],
    );

    const tipFingerprint = useMemo(
        () => plannerState.attentionSuggestions.map((slot) => `${slot.id}:${slot.type}`).join('|'),
        [plannerState],
    );

    useEffect(() => {
        if (!tipFingerprint) return;
        if (dismissedTipState?.fingerprint && dismissedTipState.fingerprint !== tipFingerprint) {
            setDismissedTipState(null);
            localStore.remove(LOCAL_KEYS.DASHBOARD_DISMISSED_TIP);
        }
    }, [dismissedTipState, tipFingerprint]);

    const isDismissedTemporarily = useMemo(() => {
        if (!dismissedTipState || dismissedTipState.fingerprint !== tipFingerprint) {
            return false;
        }

        return new Date(dismissedTipState.hiddenUntil).getTime() > Date.now();
    }, [dismissedTipState, tipFingerprint]);

    const handleSuggestionClick = (suggestion: PlannerSuggestion) => {
        onNavigate(suggestion.view);

        if (suggestion.quickAction) {
            window.setTimeout(() => {
                dispatchQuickAction(suggestion.quickAction);
            }, 160);
        }
    };

    const handleDismiss = () => {
        if (!tipFingerprint) return;
        const nextState = {
            fingerprint: tipFingerprint,
            hiddenUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        setDismissedTipState(nextState);
        localStore.set(LOCAL_KEYS.DASHBOARD_DISMISSED_TIP, nextState);
    };

    if (tipSlots.length === 0 || isDismissedTemporarily) {
        return null;
    }

    return (
        <div className="glass relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-blue-500/15 bg-blue-500/[0.03] p-5 sm:p-6">
            <div className="absolute right-0 top-0 p-5 opacity-[0.04] text-blue-500 sm:p-6">
                <Sparkles size={84} />
            </div>

            <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="mb-1 flex items-center gap-3 text-lg font-black uppercase italic text-white font-outfit">
                            <Sparkles size={18} className="text-blue-400" />
                            Suggestions du moment
                        </h3>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Base sur votre rythme habituel</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Fermer les suggestions"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-slate-950/60 text-slate-500 transition-all hover:border-white/15 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="space-y-3">
                    {tipSlots.map((slot) => (
                        <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleSuggestionClick(slot)}
                            className="group w-full rounded-[1.5rem] border border-white/5 bg-slate-950/78 p-4 text-left transition-all hover:border-blue-500/25 hover:bg-slate-950 active:scale-[0.99]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex items-center gap-3">
                                    <div className={`shrink-0 rounded-xl bg-slate-900 p-2.5 ${slot.color}`}>
                                        <slot.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-500">{slot.category}</p>
                                        <h4 className="mt-1 text-[13px] font-black uppercase leading-tight text-white transition-colors group-hover:text-blue-300">
                                            {slot.title}
                                        </h4>
                                        <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">{slot.type}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 rounded-xl bg-blue-500/10 px-3 py-2">
                                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-400">{slot.actionLabel}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onNavigate('DISCIPLINE')}
                    className="mt-4 w-full rounded-2xl bg-blue-500 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-blue-400 active:scale-95 shadow-[0_16px_35px_rgba(59,130,246,0.22)]"
                >
                    <span className="flex items-center justify-center gap-2">
                        Voir le planning
                        <ArrowUpRight size={14} />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default DailyPlanner;
