import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
   Dumbbell, Flame, TrendingUp, Calendar, Zap, Activity,
   History, Plus, Trash2, Edit3, ShieldCheck, PlayCircle, Timer,
   BarChart3, Target, Loader2, List, CheckCircle2,
   Scale as ScaleIcon, Trophy, ArrowDown, ArrowUp
} from 'lucide-react';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { useSportData, useSaveRoutine, useSaveLog, useAddMetric, useDeleteRoutine } from '../features/sport/hooks/useSport';
import { WorkoutRoutine, Exercise, FitnessGoal } from '../features/sport/types';
import { consumeQueuedQuickAction, QUICK_ACTION_EVENT, QuickActionType } from '../lib/quickActions';
import { AreaChartComponent, LineChartComponent } from '../components/charts';
import { getChartDomain } from '../utils/chartHelpers';
import ModalShell from '../components/common/ModalShell';

const Sport: React.FC = () => {
   const { data: sportData, isLoading } = useSportData();
   const saveRoutineMutation = useSaveRoutine();
   const saveLogMutation = useSaveLog();
   const addMetricMutation = useAddMetric();
   const deleteRoutineMutation = useDeleteRoutine();
   const { showAlert, showConfirm } = useAppDialog();

   const routines = sportData?.routines || [];
   const logs = sportData?.logs || [];
   const bodyMetrics = sportData?.metrics || [];
   const goals = sportData?.goals || [];
   const loading = isLoading;

   const [activeTab, setActiveTab] = useState<'overview' | 'routines' | 'session' | 'metrics' | 'analysis'>('overview');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

   // Routine Creator State
   const [newRoutineName, setNewRoutineName] = useState('');
   const [newRoutineEx, setNewRoutineEx] = useState<Exercise[]>([]);
   const [exName, setExName] = useState('');
   const [exMuscle, setExMuscle] = useState('Pectoraux');
   const [exSets, setExSets] = useState(3);
   const [exReps, setExReps] = useState('10-12');

   // Active Session State
   const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
   const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
   const [elapsedTime, setElapsedTime] = useState(0);
   const [sessionLogs, setSessionLogs] = useState<Record<string, { weight: number, reps: number }[]>>({});

   // Rest Timer State
   const [restTime, setRestTime] = useState(0);
   const [isResting, setIsResting] = useState(false);
   const restTimerRef = useRef<number | null>(null);



   useEffect(() => {
      let interval: number;
      if (sessionStartTime) {
         interval = window.setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
         }, 1000);
      }
      return () => clearInterval(interval);
   }, [sessionStartTime]);

   useEffect(() => {
      if (isResting && restTime > 0) {
         restTimerRef.current = window.setInterval(() => {
            setRestTime(prev => prev - 1);
         }, 1000);
      } else if (restTime === 0) {
         setIsResting(false);
         if (restTimerRef.current) clearInterval(restTimerRef.current);
      }
      return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
   }, [isResting, restTime]);

   useEffect(() => {
      const openQuickSportSession = () => {
         if (routines.length === 0) {
            resetRoutineForm();
            setActiveTab('routines');
            setIsModalOpen(true);

            window.setTimeout(() => {
               const routineInput = document.getElementById('sport-routine-name') as HTMLInputElement | null;
               routineInput?.focus();
            }, 120);

            return;
         }

         if (routines.length === 1) {
            startSession(routines[0]);
            return;
         }

         setActiveTab('session');
      };

      const handleQuickAction = (event: Event) => {
         const action = (event as CustomEvent<{ action: QuickActionType }>).detail?.action;

         if (action !== 'start-sport-session') return;

         consumeQueuedQuickAction('start-sport-session');
         openQuickSportSession();
      };

      if (consumeQueuedQuickAction('start-sport-session')) {
         openQuickSportSession();
      }

      window.addEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
      return () => window.removeEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
   }, [routines]);



   const startRestTimer = (seconds: number = 60) => {
      setRestTime(seconds);
      setIsResting(true);
   };

   const addExerciseToRoutine = () => {
      if (!exName) return;
      const newEx: Exercise = {
         id: Math.random().toString(36).substr(2, 9),
         name: exName,
         muscle_group: exMuscle,
         sets: exSets,
         reps: exReps
      };
      setNewRoutineEx([...newRoutineEx, newEx]);
      setExName('');
   };

   const handleSaveRoutine = async () => {
      if (!newRoutineName || newRoutineEx.length === 0) return;
      try {
         const payload = {
            name: newRoutineName,
            exercises: newRoutineEx
         };

         await saveRoutineMutation.mutateAsync({
            routine: payload,
            id: editingRoutine?.id
         });

         setIsModalOpen(false);
         resetRoutineForm();
      } catch (err) {
         await showAlert({
            title: 'Routine non enregistrée',
            message: 'Erreur de déploiement routine.',
            tone: 'danger',
         });
      }
   };

   const resetRoutineForm = () => {
      setNewRoutineName('');
      setNewRoutineEx([]);
      setExName('');
      setExMuscle('Pectoraux');
      setExSets(3);
      setExReps('10-12');
      setEditingRoutine(null);
   };

   const openEditRoutine = (routine: WorkoutRoutine) => {
      setEditingRoutine(routine);
      setNewRoutineName(routine.name);
      setNewRoutineEx(routine.exercises);
      setIsModalOpen(true);
   };

   const startSession = (routine: WorkoutRoutine) => {
      setActiveRoutine(routine);
      setSessionStartTime(Date.now());
      setElapsedTime(0);
      setActiveTab('session');

      const initialLogs: Record<string, { weight: number, reps: number }[]> = {};
      routine.exercises.forEach(ex => {
         initialLogs[ex.id] = Array(ex.sets).fill({ weight: 0, reps: 0 });
      });
      setSessionLogs(initialLogs);
   };

   const updateSetLog = (exId: string, setIdx: number, field: 'weight' | 'reps', value: number) => {
      setSessionLogs(prev => {
         const newLogs = { ...prev };
         const exSets = [...newLogs[exId]];
         exSets[setIdx] = { ...exSets[setIdx], [field]: value };
         newLogs[exId] = exSets;
         return newLogs;
      });
      // Si on vient de finir un set (reps > 0), on suggère un repos
      if (field === 'reps' && value > 0) {
         startRestTimer(90);
      }
   };

   const finishSession = async () => {
      if (!activeRoutine) return;

      let totalVolume = 0;
      Object.values(sessionLogs).forEach((sets: any) => {
         sets.forEach((s: any) => totalVolume += (Number(s.weight) * Number(s.reps)));
      });

      try {
         await saveLogMutation.mutateAsync({
            routine_id: activeRoutine.id,
            routine_name: activeRoutine.name,
            total_volume: totalVolume,
            duration: Math.floor(elapsedTime / 60),
            date: new Date().toISOString().split('T')[0]
         });

         setActiveRoutine(null);
         setSessionStartTime(null);
         setActiveTab('overview');
      } catch (err) {
         await showAlert({
            title: 'Séance non finalisée',
            message: 'Erreur scellage séance.',
            tone: 'danger',
         });
      }
   };

   const addMetric = async (weight: number) => {
      try {
         await addMetricMutation.mutateAsync({
            weight,
            date: new Date().toISOString().split('T')[0]
         });
      } catch (err) { console.error(err); }
   };

   // Computations
   const analysisData = useMemo(() => {
      return logs.slice(0, 15).reverse().map(l => ({
         name: l.date.split('-').slice(1).join('/'),
         volume: l.total_volume,
         duration: l.duration
      }));
   }, [logs]);

   const weightTrend = useMemo(() => {
      return bodyMetrics.slice(0, 15).reverse().map(m => ({
         name: m.date.split('-').slice(1).join('/'),
         kg: m.weight
      }));
   }, [bodyMetrics]);

   const currentWeight = bodyMetrics[0]?.weight || 0;
   const prevWeight = bodyMetrics[1]?.weight || currentWeight;
   const weightDiff = currentWeight - prevWeight;

   if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

   return (
      <div className="space-y-10 pb-32 animate-in fade-in duration-700">

         {/* HEADER HUD */}
         <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-[color:var(--border)] pb-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[2rem] bg-rose-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-rose-500/20">
                  <Dumbbell size={32} strokeWidth={2.5} />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-[color:var(--text-primary)] tracking-tighter uppercase italic leading-none font-outfit">SESSION <span className="text-rose-500 font-outfit">SPORT</span></h2>
                  <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mt-3 italic">Suivi de tes entraînements & performances</p>
               </div>
            </div>

            <div className="flex p-1.5 bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-[2.5rem] shadow-2xl overflow-x-auto no-scrollbar w-full lg:w-auto">
               {[
                  { id: 'overview', label: 'VUE GLOBALE', icon: Activity },
                  { id: 'routines', label: 'PROGRAMMES', icon: List },
                  { id: 'session', label: 'SÉANCE', icon: PlayCircle },
                  { id: 'metrics', label: 'MÉTRIQUES', icon: ScaleIcon },
                  { id: 'analysis', label: 'ANALYSE', icon: BarChart3 }
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 rounded-[1.8rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab.id
                           ? 'bg-rose-500 text-white shadow-lg scale-105'
                           : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'
                     }`}
                  >
                     <tab.icon size={14} />
                     <span className="hidden sm:inline">{tab.label}</span>
                     <span className="sm:hidden">{tab.icon === Activity ? 'VUE' : tab.id === 'routines' ? 'PROG.' : tab.id === 'session' ? 'SÉANCE' : tab.id === 'metrics' ? 'MÉTRICS' : 'ANALYSE'}</span>
                  </button>
               ))}
            </div>
         </div>

         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'overview' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-rose-500/10 bg-rose-500/[0.02] relative overflow-hidden group shadow-2xl flex flex-col md:flex-row items-center gap-10">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-rose-500 group-hover:scale-110 transition-transform duration-1000">
                        <Target size={200} />
                     </div>

                     <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="50%" cy="50%" r="80" className="stroke-[color:var(--border-strong)] fill-none" strokeWidth="12" />
                           <circle
                              cx="50%" cy="50%" r="80"
                              className="fill-none stroke-rose-500 transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                              strokeWidth="12"
                              strokeDasharray={`${2 * Math.PI * 80}`}
                              strokeDashoffset={`${2 * Math.PI * 80 * (1 - 0.85)}`}
                              strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-black text-[color:var(--text-primary)] italic">85%</span>
                           <span className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">Score Athlétique</span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-6 relative z-10">
                        <h3 className="text-2xl font-black text-[color:var(--text-primary)] uppercase italic tracking-tighter">RÉSUMÉ DE <span className="text-rose-500">PERFORMANCE</span></h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-[color:var(--surface)] p-5 rounded-3xl border border-[color:var(--border)] shadow-inner">
                              <p className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-1">Volume 7J</p>
                              <p className="text-xl font-black text-[color:var(--text-primary)] italic">{logs.slice(0, 3).reduce((a, b) => a + b.total_volume, 0).toLocaleString()} <span className="text-xs text-rose-500">KG</span></p>
                           </div>
                           <div className="bg-[color:var(--surface)] p-5 rounded-3xl border border-[color:var(--border)] shadow-inner border-l-rose-500/30">
                              <p className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-1">Poids actuel</p>
                              <p className="text-xl font-black text-[color:var(--text-primary)] italic">{currentWeight} <span className="text-xs text-emerald-500">KG</span></p>
                           </div>
                        </div>
                        <p className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3">
                           <Flame size={14} className="text-orange-500" /> STATUT PHYSIQUE : OPTIMAL
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col gap-6">
                     <div className="glass rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                           <p className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic">Tendance masse</p>
                           {weightDiff < 0 ? <ArrowDown className="text-emerald-500" size={16} /> : <ArrowUp className="text-rose-500" size={16} />}
                        </div>
                        <h2 className="text-4xl font-black text-[color:var(--text-primary)] tracking-tighter">{currentWeight} <span className="text-lg text-emerald-500 italic">KG</span></h2>
                        <p className="text-[8px] font-bold text-[color:var(--text-muted)] uppercase mt-2">Delta : {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg vs J-7</p>
                     </div>

                     <button onClick={() => setActiveTab('routines')} className="flex-1 py-8 bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--text-primary)] rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-3xl hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-3 group dark:bg-white dark:text-slate-950 dark:border-white/10">
                        <Zap size={24} className="group-hover:animate-bounce" />
                        DÉMARRER UNE SÉANCE
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map(goal => (
                     <div key={goal.id} className="glass rounded-[2rem] p-8 relative group overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                           <Trophy size={20} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                           <span className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic">{goal.category}</span>
                        </div>
                        <h4 className="text-lg font-black text-[color:var(--text-primary)] uppercase italic tracking-tight mb-4">{goal.title}</h4>
                        <div className="flex justify-between text-[10px] font-black mb-2">
                           <span className="text-[color:var(--text-muted)]">PROGRÈS</span>
                           <span className="text-amber-500">{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-[color:var(--muted)] rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500" style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }} />
                        </div>
                        <div className="mt-4 flex justify-between items-baseline">
                           <span className="text-xl font-black text-[color:var(--text-primary)]">{goal.current_value} / {goal.target_value}</span>
                           <span className="text-[9px] font-bold text-[color:var(--text-muted)] uppercase">{goal.unit}</span>
                        </div>
                     </div>
                  ))}
                  <div className="glass rounded-[2rem] border border-dashed border-[color:var(--border)] flex items-center justify-center p-12 opacity-30 hover:opacity-100 transition-all cursor-pointer group">
                     <Plus size={32} className="group-hover:scale-125 transition-transform" />
                  </div>
               </div>
            </div>
         )}

         {/* --- ROUTINES TAB --- */}
         {activeTab === 'routines' && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-widest italic">MES PROGRAMMES D'ENTRAÎNEMENT</h3>
                  <button onClick={() => { resetRoutineForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                     <Plus size={14} strokeWidth={3} /> NOUVEAU PROGRAMME
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {routines.map(routine => (
                     <div key={routine.id} className="glass rounded-[3rem] p-8 group relative overflow-hidden transition-all hover:border-rose-500/20 shadow-xl flex flex-col min-h-[340px]">
                        <div className="flex justify-between items-start mb-6">
                           <span className="px-5 py-2 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic">{routine.exercises.length} EXERCICES</span>
                           <div className="flex gap-2">
                              <button onClick={() => openEditRoutine(routine)} className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-all"><Edit3 size={16} /></button>
                              <button onClick={async () => {
                                 const confirmed = await showConfirm({
                                    title: 'Supprimer la routine',
                                    message: `La routine "${routine.name}" sera retiree de vos programmes.`,
                                    confirmLabel: 'Supprimer',
                                    tone: 'danger',
                                 });
                                 if (confirmed) await deleteRoutineMutation.mutateAsync(routine.id);
                              }} className="text-[color:var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <h4 className="text-2xl font-black text-[color:var(--text-primary)] italic tracking-tight uppercase group-hover:text-rose-500 transition-colors mb-6">{routine.name}</h4>
                        <div className="space-y-3 mb-8 flex-1">
                           {routine.exercises.slice(0, 5).map((ex, i) => (
                              <div key={i} className="flex justify-between text-[10px] font-bold text-[color:var(--text-secondary)] uppercase tracking-widest">
                                 <span>{ex.name}</span>
                                 <span className="text-[color:var(--text-muted)]">{ex.sets}x{ex.reps}</span>
                              </div>
                           ))}
                           {routine.exercises.length > 5 && <p className="text-[8px] text-[color:var(--text-muted)] font-black italic">+{routine.exercises.length - 5} AUTRES EXERCICES</p>}
                        </div>
                        <button
                           onClick={() => startSession(routine)}
                           className="w-full py-5 bg-rose-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                           <PlayCircle size={14} /> LANCER SÉANCE
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* --- ACTIVE SESSION TAB --- */}
         {activeTab === 'session' && !activeRoutine && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="glass rounded-[3rem] p-10 border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] flex flex-col items-center justify-center text-center gap-6 py-16">
                  <div className="w-20 h-20 rounded-[2rem] bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-muted)]">
                     <PlayCircle size={36} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-[color:var(--text-primary)] uppercase italic tracking-tighter mb-2">AUCUNE SÉANCE ACTIVE</h3>
                     <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">Sélectionnez un programme ci-dessous pour démarrer</p>
                  </div>
               </div>
               {routines.length === 0 ? (
                  <div className="text-center py-10 text-[color:var(--text-muted)]">
                     <p className="text-[10px] font-black uppercase tracking-widest">Aucun programme — créez-en un d'abord dans l'onglet PROGRAMMES</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {routines.map(routine => (
                        <div key={routine.id} className="glass rounded-[2.5rem] p-8 group hover:border-rose-500/20 transition-all shadow-xl flex flex-col gap-6">
                           <div>
                              <p className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-2">{routine.exercises.length} EXERCICES</p>
                              <h4 className="text-xl font-black text-[color:var(--text-primary)] uppercase italic tracking-tight group-hover:text-rose-500 transition-colors">{routine.name}</h4>
                           </div>
                           <div className="space-y-2 flex-1">
                              {routine.exercises.slice(0, 4).map((ex, i) => (
                                 <div key={i} className="flex justify-between text-[10px] font-bold text-[color:var(--text-secondary)] uppercase">
                                    <span>{ex.name}</span>
                                    <span className="text-[color:var(--text-muted)]">{ex.sets}×{ex.reps}</span>
                                 </div>
                              ))}
                              {routine.exercises.length > 4 && <p className="text-[8px] text-[color:var(--text-muted)] font-black italic">+{routine.exercises.length - 4} autres</p>}
                           </div>
                           <button
                              onClick={() => startSession(routine)}
                              className="w-full py-4 bg-rose-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                              <PlayCircle size={14} /> DÉMARRER
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {activeTab === 'session' && activeRoutine && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
               <div className="glass rounded-[3.5rem] p-12 shadow-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-rose-500">
                     <Timer size={200} />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic mb-4 flex items-center gap-3"><Activity size={14} /> SÉANCE EN COURS</h3>
                     <h2 className="text-4xl font-black text-[color:var(--text-primary)] italic uppercase tracking-tighter">{activeRoutine.name}</h2>
                  </div>

                  {isResting && (
                     <div className="relative z-10 bg-rose-500/10 border border-rose-500/20 px-10 py-6 rounded-[2rem] flex flex-col items-center animate-pulse shadow-xl">
                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-2">Temps de repos</p>
                        <span className="text-3xl font-black text-[color:var(--text-primary)] font-outfit">{Math.floor(restTime / 60)}:{String(restTime % 60).padStart(2, '0')}</span>
                     </div>
                  )}

                  <div className="text-center relative z-10 bg-[color:var(--surface)] p-8 rounded-[2.5rem] border border-[color:var(--border)] min-w-[200px] shadow-2xl">
                     <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-2">Durée séance</p>
                     <span className="text-5xl font-black text-[color:var(--text-primary)] font-outfit italic tracking-tighter">
                        {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                     </span>
                  </div>

                  <button onClick={finishSession} className="px-12 py-7 bg-emerald-500 text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative z-10">
                     <ShieldCheck size={20} strokeWidth={3} /> TERMINER LA SÉANCE
                  </button>
               </div>

               {/* EXERCISE CARDS WITH PREVIOUS PERFORMANCE */}
               <div className="grid grid-cols-1 gap-10 max-w-4xl mx-auto">
                  {activeRoutine.exercises.map((ex, exIdx) => {
                     // Find previous log for this exercise
                     const prevLog = logs.find(l => l.routine_id === activeRoutine.id) as any;
                     const prevLogDetails: any = prevLog?.exercises_data?.[ex.id];

                     return (
                        <div key={ex.id} className="glass rounded-[3rem] p-10 relative group">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-rose-500 font-black italic">{exIdx + 1}</div>
                                 <div>
                                    <h4 className="text-2xl font-black text-[color:var(--text-primary)] uppercase italic tracking-tight">{ex.name}</h4>
                                    <p className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mt-1">{ex.muscle_group}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 {prevLogDetails && (
                                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                                       <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-0.5">DERNIÈRE SÉANCE</p>
                                       <p className="text-[11px] font-black text-blue-300">{prevLogDetails.weight}kg × {prevLogDetails.reps}</p>
                                    </div>
                                 )}
                                 <span className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic">{ex.sets} SÉR. • {ex.reps} REPS</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {Array(ex.sets).fill(0).map((_, setIdx) => (
                                 <div key={setIdx} className="bg-[color:var(--surface)] p-6 rounded-[2rem] border border-[color:var(--border)] flex flex-col gap-4 shadow-inner group/set transition-all hover:bg-[color:var(--surface-2)]">
                                    <div className="flex justify-between text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">
                                       <span>SÉRIE {setIdx + 1}</span>
                                       <CheckCircle2 size={12} className={sessionLogs[ex.id]?.[setIdx]?.weight > 0 ? "text-emerald-500" : "text-slate-800"} />
                                    </div>
                                    <div className="flex gap-3">
                                       <div className="flex-1 space-y-1">
                                          <label className="text-[7px] font-black text-[color:var(--text-muted)] uppercase ml-2 tracking-widest">KG</label>
                                          <input
                                             type="number"
                                             value={sessionLogs[ex.id]?.[setIdx]?.weight || ''}
                                             onChange={(e) => updateSetLog(ex.id, setIdx, 'weight', Number(e.target.value))}
                                             className="ui-field w-full border rounded-xl p-3 text-sm font-black text-center outline-none focus:border-rose-500/50"
                                             placeholder={prevLogDetails?.weight ? String(prevLogDetails.weight) : "0"}
                                          />
                                       </div>
                                       <div className="flex-1 space-y-1">
                                          <label className="text-[7px] font-black text-[color:var(--text-muted)] uppercase ml-2 tracking-widest">REPS</label>
                                          <input
                                             type="number"
                                             value={sessionLogs[ex.id]?.[setIdx]?.reps || ''}
                                             onChange={(e) => updateSetLog(ex.id, setIdx, 'reps', Number(e.target.value))}
                                             className="ui-field w-full border rounded-xl p-3 text-sm font-black text-center outline-none focus:border-rose-500/50"
                                             placeholder={prevLogDetails?.reps ? String(prevLogDetails.reps) : "0"}
                                          />
                                       </div>
                                    </div>
                                    {/* Quick rest timer */}
                                    {sessionLogs[ex.id]?.[setIdx]?.reps > 0 && (
                                       <div className="flex gap-2 mt-1">
                                          {[60, 90, 120].map(s => (
                                             <button key={s} onClick={() => startRestTimer(s)} className="flex-1 py-1.5 bg-[color:var(--surface-2)] border border-[color:var(--border)] rounded-lg text-[8px] font-black text-[color:var(--text-muted)] hover:text-rose-400 hover:border-rose-500/20 transition-all uppercase tracking-wider">
                                                {s}s
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}



         {/* --- METRICS TAB --- */}
         {activeTab === 'metrics' && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                        <TrendingUp size={18} className="text-emerald-500" /> TENDANCE DE MASSE (KG)
                     </h3>
                     <LineChartComponent
                        data={weightTrend}
                        xKey="name"
                        emptyMessage="Aucune mesure de masse disponible."
                        fallbackTitle="Tendance indisponible"
                        heightClassName="h-[300px]"
                        minHeightClassName="min-h-[300px]"
                        yDomain={[...getChartDomain(weightTrend, ['kg'], 2)] as [number, number]}
                        series={[{ key: 'kg', label: 'Poids', color: '#10b981', showDots: true, strokeWidth: 3 }]}
                     />
                  </div>

                  <div className="glass rounded-[3rem] p-10 shadow-2xl flex flex-col">
                     <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                        <Plus size={18} className="text-blue-500" /> NOUVELLE MESURE CORE
                     </h3>
                     <div className="flex-1 flex flex-col justify-center items-center gap-8">
                        <div className="text-center">
                           <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-4">Volume de masse (kg)</p>
                           <input
                              type="number" step="0.1" placeholder="00.0"
                              className="bg-transparent text-7xl font-black text-[color:var(--text-primary)] text-center outline-none italic placeholder:text-[color:var(--text-muted)]"
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    addMetric(Number((e.target as HTMLInputElement).value));
                                    (e.target as HTMLInputElement).value = '';
                                 }
                              }}
                           />
                        </div>
                        <p className="text-[9px] text-[color:var(--text-muted)] uppercase tracking-widest font-black text-center max-w-[250px] leading-relaxed">
                           APPUYEZ SUR ENTRÉE POUR ENREGISTRER LA MESURE
                        </p>
                     </div>
                  </div>
               </div>

               <div className="glass rounded-[2.5rem] p-10 overflow-hidden">
                  <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.4em] mb-8 italic">ARCHIVES DES MESURES</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                     {bodyMetrics.map(m => (
                        <div key={m.id} className="p-6 bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border)] flex flex-col items-center">
                           <span className="text-[9px] font-black text-[color:var(--text-muted)] uppercase mb-2">{m.date}</span>
                           <span className="text-xl font-black text-[color:var(--text-primary)] italic">{m.weight}</span>
                           <span className="text-[8px] font-black text-emerald-500 mt-1 uppercase">KG</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* --- ANALYSIS TAB --- */}
         {activeTab === 'analysis' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-widest mb-10 italic flex items-center gap-3">
                        <TrendingUp size={18} className="text-rose-500" /> COURBE DE VOLUMÉTRIE PHYSIQUE
                     </h3>
                     <AreaChartComponent
                        data={analysisData}
                        xKey="name"
                        emptyMessage="Aucune volumetrie de seance disponible."
                        fallbackTitle="Volumetrie indisponible"
                        heightClassName="h-[300px]"
                        minHeightClassName="min-h-[300px]"
                        hideYAxis
                        series={[{ key: 'volume', label: 'Volume', color: '#f43f5e', opacity: 0.32, strokeWidth: 4 }]}
                     />
                  </div>

                  <div className="glass rounded-[3rem] p-10 shadow-2xl">
                     <h3 className="text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                        <History size={18} className="text-blue-500" /> HISTORIQUE DES SÉANCES
                     </h3>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                        {logs.map((log, i) => (
                           <div key={log.id} className="p-5 bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border)] flex items-center justify-between group hover:border-blue-500/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--border)] flex items-center justify-center text-blue-500">
                                    <Calendar size={16} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-[color:var(--text-primary)] uppercase italic">{log.routine_name}</p>
                                    <p className="text-[9px] text-[color:var(--text-muted)] font-bold uppercase tracking-widest">{log.date} • {log.duration} min</p>
                                 </div>
                              </div>
                              <span className="text-sm font-black text-[color:var(--text-primary)]">{log.total_volume.toLocaleString()} KG</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* --- MODAL ROUTINE CREATOR (via ModalShell) --- */}
         <ModalShell
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={<>CRÉATION DE <span className="text-rose-500">PROGRAMME</span></>}
            subtitle="Définissez le nom et les exercices de votre routine"
            icon={<Dumbbell size={20} />}
            maxWidthClassName="max-w-3xl"
            centered
            footer={
               <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="sm:min-w-[160px] px-8 py-4 border border-[color:var(--border)] bg-[color:var(--surface-2)] rounded-2xl text-[9px] font-black text-[color:var(--text-secondary)] uppercase tracking-widest hover:text-[color:var(--text-primary)] transition-all"
                  >
                     ANNULER
                  </button>
                  <button
                     onClick={handleSaveRoutine}
                     disabled={!newRoutineName || newRoutineEx.length === 0}
                     className="flex-1 sm:max-w-[320px] py-4 bg-rose-500 text-slate-950 font-black uppercase rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                  >
                     <ShieldCheck size={18} strokeWidth={3} /> ENREGISTRER LE PROGRAMME
                  </button>
               </div>
            }
         >
            <div className="space-y-5">
               {/* Nom de la routine */}
               <div className="space-y-2 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 md:p-5">
                  <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest ml-1 italic">INTITULÉ DU PROGRAMME</label>
                  <input
                     id="sport-routine-name"
                     type="text"
                     value={newRoutineName}
                     onChange={e => setNewRoutineName(e.target.value)}
                     placeholder="ENTRAÎNEMENT A, ENTRAÎNEMENT B..."
                     className="ui-field w-full border rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-rose-500/50 transition-all uppercase tracking-widest shadow-inner"
                  />
               </div>

               {/* Ajouter un exercice */}
               <div className="glass rounded-[2.25rem] p-5">
                  <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-5 italic">AJOUTER UN EXERCICE</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                     <div className="space-y-2 sm:col-span-2">
                        <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest ml-1">NOM EXERCICE</label>
                        <input
                           type="text"
                           value={exName}
                           onChange={e => setExName(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && addExerciseToRoutine()}
                           className="ui-field w-full border rounded-xl p-4 text-xs font-bold uppercase"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest ml-1">GROUPE MUSC.</label>
                        <select value={exMuscle} onChange={e => setExMuscle(e.target.value)} className="ui-field w-full border rounded-xl p-4 text-[10px] font-black uppercase">
                           {['Pectoraux', 'Dos', 'Épaules', 'Jambes', 'Bras', 'Abdos', 'Cardio'].map(m => (
                              <option key={m} value={m}>{m.toUpperCase()}</option>
                           ))}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                           <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest ml-1">SÉRIES</label>
                           <input type="number" value={exSets} onChange={e => setExSets(Number(e.target.value))} className="ui-field w-full border rounded-xl p-4 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest ml-1">RÉPÉTITIONS</label>
                           <input type="text" value={exReps} onChange={e => setExReps(e.target.value)} className="ui-field w-full border rounded-xl p-4 text-xs font-bold uppercase" />
                        </div>
                     </div>
                     <button
                        onClick={addExerciseToRoutine}
                        disabled={!exName.trim()}
                        className="sm:col-span-2 py-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] font-black text-rose-400 uppercase tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                        <Plus size={14} strokeWidth={3} /> INTÉGRER L'EXERCICE
                     </button>
                  </div>
               </div>

               {/* Liste des exercices */}
               <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-[0.32em] italic ml-1">
                     EXERCICES DU PROGRAMME ({newRoutineEx.length})
                  </h4>
                  {newRoutineEx.length === 0 ? (
                     <div className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] px-6 py-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Aucun exercice ajouté pour le moment.</p>
                     </div>
                  ) : newRoutineEx.map((ex, i) => (
                     <div key={ex.id} className="flex items-center justify-between gap-4 p-4 bg-[color:var(--surface)] rounded-[2rem] border border-[color:var(--border)] group hover:border-rose-500/20 transition-all">
                        <div className="flex items-center gap-4">
                           <span className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xs italic">{i + 1}</span>
                           <div>
                              <h5 className="font-bold text-[color:var(--text-primary)] uppercase tracking-wider leading-none text-sm">{ex.name}</h5>
                              <p className="text-[8px] text-[color:var(--text-muted)] uppercase mt-1 tracking-widest">{ex.muscle_group} • {ex.sets} séries • {ex.reps} reps</p>
                           </div>
                        </div>
                        <button
                           onClick={() => setNewRoutineEx(newRoutineEx.filter(e => e.id !== ex.id))}
                           className="p-2 text-[color:var(--text-muted)] hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-500/10"
                        >
                           <Trash2 size={15} />
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </ModalShell>
      </div>
   );
};

export default Sport;
