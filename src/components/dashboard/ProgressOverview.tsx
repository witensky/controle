import React, { useMemo, useState } from 'react';
import { Target, Plus, CheckCircle2, Loader2, X, Minus } from 'lucide-react';
import { useAppDialog } from '../common/AppDialogProvider';
import { useCreateGoal, useUpdateGoalProgress, useWeeklyGoals } from '../../features/planning/hooks/usePlanning';

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
                <Loader2 className="animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <>
            <div className="glass rounded-[2rem] border-white/5 bg-[#0f172a]/40 p-6 md:p-7 flex flex-col h-full shadow-xl">
                <div className="flex justify-between items-start gap-4 mb-5">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-3 font-outfit">
                            <Target size={20} className="text-amber-500" /> Objectifs Hebdo
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Suivi de progression</p>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-2">{weekLabel}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Ajouter un objectif hebdomadaire"
                        onClick={() => setIsCreateOpen(true)}
                        className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-lg"
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
                                <div key={goal.id} className="rounded-[1.5rem] border border-white/5 bg-slate-950/60 p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {goal.category}
                                                </span>
                                                {isCompleted ? <CheckCircle2 size={12} className="text-emerald-500" /> : null}
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-white italic shrink-0">
                                            {goal.current_count} / {goal.target_count}
                                        </span>
                                    </div>

                                    <div className="h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 rounded-full ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}
                                            style={{ width: `${Math.min(100, progress)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            {Math.round(progress)}% complete
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateGoal.mutate({ id: goal.id, count: Math.max(0, goal.current_count - 1) })}
                                                disabled={updateGoal.isPending}
                                                className="h-9 w-9 rounded-xl border border-white/5 bg-slate-900 text-slate-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <button
                                                onClick={() => updateGoal.mutate({ id: goal.id, count: Math.min(goal.target_count, goal.current_count + 1) })}
                                                disabled={updateGoal.isPending}
                                                className="h-9 w-9 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center justify-center disabled:opacity-50"
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
                            className="flex flex-col items-center justify-center h-full min-h-[220px] rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/30 px-6 text-center hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-slate-700">
                                <Target size={28} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                                Aucun objectif defini pour cette semaine.
                            </p>
                            <span className="mt-4 text-[9px] font-black uppercase tracking-widest text-amber-500">
                                Appuyer pour ajouter
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {isCreateOpen ? (
                <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-xl">
                    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b1121] p-6 shadow-2xl">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Objectif hebdo</p>
                                <h4 className="mt-2 text-2xl font-black uppercase italic text-white">Nouveau suivi</h4>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Libelle</label>
                                <input
                                    type="text"
                                    value={goalLabel}
                                    onChange={(event) => setGoalLabel(event.target.value)}
                                    placeholder="Ex: Revisions du module principal"
                                    className="w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none transition-colors focus:border-amber-500/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cible hebdomadaire</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={goalTarget}
                                    onChange={(event) => setGoalTarget(Math.max(1, Number(event.target.value) || 1))}
                                    className="w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none transition-colors focus:border-amber-500/40"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-2xl border border-white/5 bg-slate-950 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateGoal}
                                disabled={createGoal.isPending || !goalLabel.trim()}
                                className="flex-1 rounded-2xl bg-amber-500 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
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
