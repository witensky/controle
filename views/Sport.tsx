
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, Flame, TrendingUp, Calendar, Clock, Zap, ChevronRight, Activity, 
  History, X, Plus, Trash2, Edit3, ShieldCheck, PlayCircle, Timer, Save, 
  ArrowUpRight, BarChart3, Target, Info, Loader2, List, CheckCircle2, 
  Scale as ScaleIcon, Trophy, Heart, ArrowDown, ArrowUp, RefreshCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { WorkoutRoutine, Exercise, WorkoutLog, BodyMetric, FitnessGoal } from '../types';

const Sport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'routines' | 'session' | 'metrics' | 'analysis'>('overview');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
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
    fetchSportData();
  }, []);

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

  const fetchSportData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [routinesRes, logsRes, metricsRes, goalsRes] = await Promise.all([
        supabase.from('workout_routines').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('body_metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('fitness_goals').select('*').eq('user_id', user.id)
      ]);

      setRoutines(routinesRes.data || []);
      setLogs(logsRes.data || []);
      setBodyMetrics(metricsRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        name: newRoutineName,
        exercises: newRoutineEx
      };

      let error;
      if (editingRoutine) {
        const res = await supabase.from('workout_routines').update(payload).eq('id', editingRoutine.id);
        error = res.error;
      } else {
        const res = await supabase.from('workout_routines').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      fetchSportData();
      setIsModalOpen(false);
      resetRoutineForm();
    } catch (err) {
      alert("Erreur de déploiement routine.");
    }
  };

  const resetRoutineForm = () => {
    setNewRoutineName('');
    setNewRoutineEx([]);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('workout_logs').insert([{
        user_id: user.id,
        routine_id: activeRoutine.id,
        routine_name: activeRoutine.name,
        total_volume: totalVolume,
        duration: Math.floor(elapsedTime / 60),
        date: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;
      
      const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', user.id).single();
      await supabase.from('profiles').update({ total_xp: (profile?.total_xp || 0) + 150 }).eq('id', user.id);

      setActiveRoutine(null);
      setSessionStartTime(null);
      setActiveTab('overview');
      fetchSportData();
    } catch (err) {
      alert("Erreur scellage séance.");
    }
  };

  const addMetric = async (weight: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('body_metrics').insert([{
        user_id: user.id,
        weight,
        date: new Date().toISOString().split('T')[0]
      }]);
      fetchSportData();
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
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-rose-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-rose-500/20">
              <Dumbbell size={32} strokeWidth={2.5} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">ATHLETIC <span className="text-rose-500 font-outfit">CORE</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">Optimisation de la Force & Performance</p>
           </div>
        </div>

        <div className="flex p-1.5 bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-x-auto max-w-full no-scrollbar">
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
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-rose-500 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-white'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
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
                     <circle cx="50%" cy="50%" r="80" className="stroke-slate-900 fill-none" strokeWidth="12" />
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
                     <span className="text-3xl font-black text-white italic">85%</span>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Score Athlétique</span>
                  </div>
               </div>

               <div className="flex-1 space-y-6 relative z-10">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">ÉCONOMIE DE <span className="text-rose-500">PERFORMANCE</span></h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Volume 7J</p>
                        <p className="text-xl font-black text-white italic">{logs.slice(0,3).reduce((a,b) => a+b.total_volume, 0).toLocaleString()} <span className="text-xs text-rose-500">KG</span></p>
                     </div>
                     <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner border-l-rose-500/30">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Poids Actuel</p>
                        <p className="text-xl font-black text-white italic">{currentWeight} <span className="text-xs text-emerald-500">KG</span></p>
                     </div>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                     <Flame size={14} className="text-orange-500" /> STATUT MÉTALIQUE : CHARGE MAXIMALE ADMISE
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-6">
               <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-[#0f172a]/40 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">TENDANCE MASSE</p>
                    {weightDiff < 0 ? <ArrowDown className="text-emerald-500" size={16} /> : <ArrowUp className="text-rose-500" size={16} />}
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{currentWeight} <span className="text-lg text-emerald-500 italic">KG</span></h2>
                  <p className="text-[8px] font-bold text-slate-600 uppercase mt-2">Deltas: {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg vs J-7</p>
               </div>
               
               <button onClick={() => setActiveTab('routines')} className="flex-1 py-8 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-3xl hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-3 group">
                  <Zap size={24} className="group-hover:animate-bounce" />
                  INITIER ENGAGEMENT SÉANCE
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {goals.map(goal => (
               <div key={goal.id} className="glass rounded-[2rem] p-8 border border-white/5 bg-slate-950/40 relative group overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                     <Trophy size={20} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{goal.category}</span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tight mb-4">{goal.title}</h4>
                  <div className="flex justify-between text-[10px] font-black mb-2">
                     <span className="text-slate-500">PROGRÈS</span>
                     <span className="text-amber-500">{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500" style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }} />
                  </div>
                  <div className="mt-4 flex justify-between items-baseline">
                     <span className="text-xl font-black text-white">{goal.current_value} / {goal.target_value}</span>
                     <span className="text-[9px] font-bold text-slate-600 uppercase">{goal.unit}</span>
                  </div>
               </div>
             ))}
             <div className="glass rounded-[2rem] border border-dashed border-white/10 flex items-center justify-center p-12 opacity-30 hover:opacity-100 transition-all cursor-pointer group">
                <Plus size={32} className="group-hover:scale-125 transition-transform" />
             </div>
          </div>
        </div>
      )}

      {/* --- ROUTINES TAB --- */}
      {activeTab === 'routines' && (
        <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
           <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">VECTEURS D'ENTRAÎNEMENT (PROTOCOLES)</h3>
              <button onClick={() => { resetRoutineForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                <Plus size={14} strokeWidth={3} /> CRÉER PROGRAMME
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routines.map(routine => (
                <div key={routine.id} className="glass rounded-[3rem] p-8 border border-white/5 bg-[#0b1121]/60 group relative overflow-hidden transition-all hover:border-rose-500/20 shadow-xl flex flex-col min-h-[340px]">
                   <div className="flex justify-between items-start mb-6">
                      <span className="px-5 py-2 bg-slate-950 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{routine.exercises.length} EXERCICES</span>
                      <div className="flex gap-2">
                        <button onClick={() => openEditRoutine(routine)} className="text-slate-800 hover:text-white transition-all"><Edit3 size={16}/></button>
                        <button onClick={async () => { if(confirm('Supprimer cette routine ?')) await supabase.from('workout_routines').delete().eq('id', routine.id); fetchSportData(); }} className="text-slate-800 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                   </div>
                   <h4 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-rose-500 transition-colors mb-6">{routine.name}</h4>
                   <div className="space-y-3 mb-8 flex-1">
                      {routine.exercises.slice(0, 5).map((ex, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <span>{ex.name}</span>
                           <span className="text-slate-600">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                      {routine.exercises.length > 5 && <p className="text-[8px] text-slate-700 font-black italic">+{routine.exercises.length - 5} AUTRES UNITÉS</p>}
                   </div>
                   <button 
                     onClick={() => startSession(routine)}
                     className="w-full py-5 bg-rose-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <PlayCircle size={14} /> DÉPLOYER UNITÉ
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- ACTIVE SESSION TAB --- */}
      {activeTab === 'session' && activeRoutine && (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
           <div className="glass rounded-[3.5rem] p-12 border-white/5 bg-[#0b1121] shadow-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-rose-500">
                 <Timer size={200} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] italic mb-4 flex items-center gap-3"><Activity size={14}/> SÉANCE TACTIQUE EN COURS</h3>
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{activeRoutine.name}</h2>
              </div>

              {isResting && (
                <div className="relative z-10 bg-rose-500/10 border border-rose-500/20 px-10 py-6 rounded-[2rem] flex flex-col items-center animate-pulse shadow-xl">
                   <p className="text-[8px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2">Repos Tactique</p>
                   <span className="text-3xl font-black text-white font-outfit">{Math.floor(restTime / 60)}:{String(restTime % 60).padStart(2, '0')}</span>
                </div>
              )}

              <div className="text-center relative z-10 bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 min-w-[200px] shadow-2xl">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Durée Engagement</p>
                 <span className="text-5xl font-black text-white font-outfit italic tracking-tighter">
                   {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                 </span>
              </div>
              
              <button onClick={finishSession} className="px-12 py-7 bg-emerald-500 text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative z-10">
                 <ShieldCheck size={20} strokeWidth={3} /> SCELLER RAPPORTS
              </button>
           </div>

           <div className="grid grid-cols-1 gap-10 max-w-4xl mx-auto">
              {activeRoutine.exercises.map((ex, exIdx) => (
                <div key={ex.id} className="glass rounded-[3rem] p-10 border border-white/5 bg-slate-950/40 relative group">
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-rose-500 font-black italic">{exIdx + 1}</div>
                         <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">{ex.name}</h4>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">CIBLE : {ex.sets} SÉRIES • {ex.reps} REPS</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array(ex.sets).fill(0).map((_, setIdx) => (
                        <div key={setIdx} className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4 shadow-inner group/set transition-all hover:bg-slate-900">
                           <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                              <span>SÉRIE {setIdx + 1}</span>
                              <CheckCircle2 size={12} className={sessionLogs[ex.id]?.[setIdx]?.weight > 0 ? "text-emerald-500" : "text-slate-800"} />
                           </div>
                           <div className="flex gap-3">
                              <div className="flex-1 space-y-1">
                                 <label className="text-[7px] font-black text-slate-700 uppercase ml-2 tracking-widest">KG</label>
                                 <input 
                                   type="number" 
                                   value={sessionLogs[ex.id]?.[setIdx]?.weight || ''}
                                   onChange={(e) => updateSetLog(ex.id, setIdx, 'weight', Number(e.target.value))}
                                   className="w-full bg-[#020617] border border-white/5 rounded-xl p-3 text-sm font-black text-white text-center outline-none focus:border-rose-500/50" 
                                   placeholder="0"
                                 />
                              </div>
                              <div className="flex-1 space-y-1">
                                 <label className="text-[7px] font-black text-slate-700 uppercase ml-2 tracking-widest">REPS</label>
                                 <input 
                                   type="number" 
                                   value={sessionLogs[ex.id]?.[setIdx]?.reps || ''}
                                   onChange={(e) => updateSetLog(ex.id, setIdx, 'reps', Number(e.target.value))}
                                   className="w-full bg-[#020617] border border-white/5 rounded-xl p-3 text-sm font-black text-white text-center outline-none focus:border-rose-500/50" 
                                   placeholder="0"
                                 />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- METRICS TAB --- */}
      {activeTab === 'metrics' && (
        <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-500" /> TENDANCE DE MASSE (KG)
                 </h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={weightTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 8}} />
                          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{fill: '#475569', fontSize: 8}} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px'}} />
                          <Line type="monotone" dataKey="kg" stroke="#10b981" strokeWidth={3} dot={{fill: '#10b981', r: 4}} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl flex flex-col">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <Plus size={18} className="text-blue-500" /> NOUVELLE MESURE CORE
                 </h3>
                 <div className="flex-1 flex flex-col justify-center items-center gap-8">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Volume de Masse (kg)</p>
                       <input 
                         type="number" step="0.1" placeholder="00.0"
                         className="bg-transparent text-7xl font-black text-white text-center outline-none italic placeholder:text-slate-900"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             addMetric(Number((e.target as HTMLInputElement).value));
                             (e.target as HTMLInputElement).value = '';
                           }
                         }}
                       />
                    </div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black text-center max-w-[250px] leading-relaxed">
                       APPUYEZ SUR ENTRÉE POUR SCELLER LA MESURE DANS LE REGISTRE
                    </p>
                 </div>
              </div>
           </div>

           <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0b1121]/40 overflow-hidden">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 italic">ARCHIVES DES MESURES</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {bodyMetrics.map(m => (
                   <div key={m.id} className="p-6 bg-slate-950/60 rounded-2xl border border-white/5 flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-700 uppercase mb-2">{m.date}</span>
                      <span className="text-xl font-black text-white italic">{m.weight}</span>
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
              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <TrendingUp size={18} className="text-rose-500" /> COURBE DE VOLUMÉTRIE TACTIQUE
                 </h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={analysisData}>
                          <defs>
                             <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 8}} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px'}} />
                          <Area type="monotone" dataKey="volume" stroke="#f43f5e" strokeWidth={4} fill="url(#colorVol)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <History size={18} className="text-blue-500" /> HISTORIQUE DES ENGAGEMENTS
                 </h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                    {logs.map((log, i) => (
                      <div key={log.id} className="p-5 bg-slate-950/60 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500">
                               <Calendar size={16} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-white uppercase italic">{log.routine_name}</p>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{log.date} • {log.duration} min</p>
                            </div>
                         </div>
                         <span className="text-sm font-black text-white">{log.total_volume.toLocaleString()} KG</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL ROUTINE CREATOR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-3xl flex flex-col h-[85vh]">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">PROTOCOLE DE <span className="text-rose-500">PROGRAMMATION</span></h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 space-y-12 custom-scrollbar">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">INTITULÉ DU PROGRAMME</label>
                    <input type="text" value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} placeholder="PUSH ALPHA, PULL BRAVO..." className="w-full bg-[#020617] border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-rose-500/50 transition-all uppercase tracking-widest shadow-inner" />
                 </div>

                 <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-slate-950/40">
                    <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] mb-8 italic">AJOUT D'UNITÉ (EXERCICE)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-1">NOM EXERCICE</label>
                          <input type="text" value={exName} onChange={e => setExName(e.target.value)} className="w-full bg-[#020617] border border-white/5 rounded-xl p-4 text-xs font-bold text-white uppercase" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-1">GROUPE MUSC.</label>
                          <select value={exMuscle} onChange={e => setExMuscle(e.target.value)} className="w-full bg-[#020617] border border-white/5 rounded-xl p-4 text-[10px] font-black text-white uppercase">
                             {['Pectoraux', 'Dos', 'Épaules', 'Jambes', 'Bras', 'Abdos', 'Cardio'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-1">SÉRIES</label>
                          <input type="number" value={exSets} onChange={e => setExSets(Number(e.target.value))} className="w-full bg-[#020617] border border-white/5 rounded-xl p-4 text-xs font-bold text-white" />
                       </div>
                       <button onClick={addExerciseToRoutine} className="py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all">INTÉGRER</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic ml-3">INVENTAIRE ACTUEL</h4>
                    {newRoutineEx.map((ex, i) => (
                      <div key={ex.id} className="flex items-center justify-between p-6 bg-[#020617]/60 rounded-3xl border border-white/5 group">
                         <div className="flex items-center gap-6">
                            <span className="text-slate-700 font-black text-xs italic">{i+1}</span>
                            <div>
                               <h5 className="font-bold text-white uppercase tracking-wider leading-none">{ex.name}</h5>
                               <p className="text-[8px] text-slate-600 uppercase mt-1 tracking-widest">{ex.muscle_group}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <span className="text-[10px] font-black text-rose-500/60 uppercase">{ex.sets} SÉRIES</span>
                            <button onClick={() => setNewRoutineEx(newRoutineEx.filter(e => e.id !== ex.id))} className="text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="mt-10 flex gap-6">
                 <button onClick={handleSaveRoutine} disabled={!newRoutineName || newRoutineEx.length === 0} className="flex-1 py-7 bg-rose-500 text-slate-950 font-black uppercase rounded-3xl shadow-3xl hover:scale-105 active:scale-95 transition-all text-xs tracking-[0.4em] flex items-center justify-center gap-4">
                    <ShieldCheck size={22} strokeWidth={3} /> SCELLER PROGRAMME
                 </button>
                 <button onClick={() => setIsModalOpen(false)} className="px-12 py-7 border border-white/5 bg-slate-950 rounded-3xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">ANNULER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sport;
