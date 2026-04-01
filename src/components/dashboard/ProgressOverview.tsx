import React, { useMemo, useState } from 'react';
import { Target, Plus, CheckCircle2, Loader2, X, Minus } from 'lucide-react';
import { useAppDialog } from '../common/AppDialogProvider';
import { useCreateGoal, useUpdateGoalProgress, useWeeklyGoals } from '../../features/planning/hooks/usePlanning';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';

function getWeekNumber(date: Date): number {
    const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
    return Math.ceil((((value.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const ProgressOverview: React.FC = () => {
    const { data: goals, isLoading } = useWeeklyGoals();
    const createGoal = useCreateGoal();
    const updateGoal = useUpdateGoalProgress();
    const { showAlert } = useAppDialog();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [goalLabel, setGoalLabel] = useState('');
    const [goalTarget, setGoalTarget] = useState(5);

    const weekLabel = useMemo(() => {
        const now = new Date();
        return `Semaine ${getWeekNumber(now)} • ${now.getFullYear()}`;
    }, []);

    const handleCreateGoal = async () => {
        const label = goalLabel.trim();

        if (!label || goalTarget < 1) {
            return;
        }

        if (goals?.some((goal) => goal.category.toLowerCase() === label.toLowerCase())) {
            await showAlert({
                title: 'Objectif deja existant',
                message: 'Un objectif avec ce nom existe deja pour cette semaine.',
                tone: 'warning',
            });
            return;
        }

        const now = new Date();
        await createGoal.mutateAsync({
            category: label,
            target_count: goalTarget,
            week_number: getWeekNumber(now),
            year: now.getFullYear(),
        });

        setGoalLabel('');
        setGoalTarget(5);
        setIsCreateOpen(false);
    };

    if (isLoading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="animate-spin text-[color:var(--primary)]" />
            </div>
        );
    }

    return (
        <>
            <div className={cx(uiRecipes.cardElevated, 'flex h-full flex-col rounded-[2rem] p-6 md:p-7')}>
                <div className="flex justify-between items-start gap-4 mb-5">
                    <div>
                        <h3 className="text-lg font-black text-[color:var(--heading)] uppercase italic flex items-center gap-3 font-outfit">
                            <Target size={20} className="text-[color:var(--tone-warning-text)]" /> Objectifs Hebdo
                        </h3>
                        <p className="text-[color:var(--text-secondary)] text-[10px] font-bold uppercase mt-1">Suivi de progression</p>
                        <p className="text-[color:var(--text-muted)] text-[9px] font-black uppercase tracking-widest mt-2">{weekLabel}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Ajouter un objectif hebdomadaire"
                        onClick={() => setIsCreateOpen(true)}
                        className={cx('p-3 rounded-2xl transition-all shadow-soft', toneClassNames.warning.shell, toneClassNames.warning.text)}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                    {goals && goals.length > 0 ? (
                        goals.map((goal) => {
                            const progress = goal.target_count > 0 ? (goal.current_count / goal.target_count) * 100 : 0;
                            const isCompleted = goal.current_count >= goal.target_count;

                            return (
                                <div key={goal.id} className={cx(uiRecipes.cardMuted, 'space-y-3 p-4')}>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-[color:var(--tone-success-text)]' : 'text-[color:var(--text-muted)]'}`}>
                                                    {goal.category}
                                                </span>
                                                {isCompleted ? <CheckCircle2 size={12} className="text-[color:var(--success)]" /> : null}
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-[color:var(--heading)] italic shrink-0">
                                            {goal.current_count} / {goal.target_count}
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[color:var(--success)] shadow-[0_0_10px_rgba(31,157,105,0.22)]' : 'bg-[color:var(--warning)] shadow-[0_0_10px_rgba(220,156,45,0.22)]'}`}
                                            style={{ width: `${Math.min(100, progress)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">
                                            {Math.round(progress)}% complete
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateGoal.mutate({ id: goal.id, count: Math.max(0, goal.current_count - 1) })}
                                                disabled={updateGoal.isPending}
                                                className={cx(uiRecipes.ghostButton, 'h-9 w-9 rounded-xl px-0 py-0')}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <button
                                                onClick={() => updateGoal.mutate({ id: goal.id, count: Math.min(goal.target_count, goal.current_count + 1) })}
                                                disabled={updateGoal.isPending}
                                                className={cx(uiRecipes.primaryButton, 'h-9 w-9 rounded-xl px-0 py-0')}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className={cx(uiRecipes.emptyState, 'flex h-full min-h-[220px] flex-col items-center justify-center px-6 hover:border-[color:var(--tone-warning-border)]')}
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] shadow-soft">
                                <Target size={28} />
                            </div>
                            <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest leading-relaxed">
                                Aucun objectif defini pour cette semaine.
                            </p>
                            <span className="mt-4 text-[9px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)]">
                                Appuyer pour ajouter
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {isCreateOpen ? (
                <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[color:var(--overlay)]/70 p-5 backdrop-blur-xl">
                    <div className={cx(uiRecipes.modalPanel, 'w-full max-w-md p-6')}>
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)]">Objectif hebdo</p>
                                <h4 className="mt-2 text-2xl font-black uppercase italic text-[color:var(--heading)]">Nouveau suivi</h4>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className={cx(uiRecipes.ghostButton, 'h-11 w-11 rounded-2xl px-0 py-0')}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Libelle</label>
                                <input
                                    type="text"
                                    value={goalLabel}
                                    onChange={(event) => setGoalLabel(event.target.value)}
                                    placeholder="Ex: Revisions du module principal"
                                    className={cx(uiRecipes.field, 'rounded-2xl px-4 py-4')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Cible hebdomadaire</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={goalTarget}
                                    onChange={(event) => setGoalTarget(Math.max(1, Number(event.target.value) || 1))}
                                    className={cx(uiRecipes.field, 'rounded-2xl px-4 py-4')}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setIsCreateOpen(false)} className={cx(uiRecipes.ghostButton, 'flex-1 rounded-2xl px-4 py-4')}>
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateGoal}
                                disabled={createGoal.isPending || !goalLabel.trim()}
                                className={cx(uiRecipes.primaryButton, 'flex-1 rounded-2xl px-4 py-4')}
                            >
                                {createGoal.isPending ? 'Enregistrement...' : 'Creer'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default ProgressOverview;
