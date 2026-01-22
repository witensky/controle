
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Zap, ShieldAlert, Dumbbell, Brain, CheckCircle2, Plus, Trash2, ListTodo, History, Target, Clock, ArrowUpRight, Loader2, Moon, Sun, Filter, Star, AlertCircle, PlayCircle, PauseCircle, Timer, RotateCcw, MessageSquare, ShieldCheck, ChevronRight, BarChart3, TrendingUp, MoreVertical, X, Power, Layers, Activity, Calendar as CalendarIcon, FilterX, Database, Award, ClipboardCheck, BookOpen, Heart, Wallet, FileDown, Eye
} from 'lucide-react';
import { supabase, handleSupabaseError, subscribeToTable } from '../lib/supabase';
import { Mission, MissionStatus, MissionPriority, MissionCategory } from '../types';

const Discipline: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rituals' | 'timer' | 'planner' | 'history'>('planner');
  const [ritualPhase, setRitualPhase] = useState<'morning' | 'evening'>('morning');
  const [missions, setMissions] = useState<Mission[]>([]);
  
  // Mission Creation State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MissionCategory>('Admin');
  const [priority, setPriority] = useState<MissionPriority>('medium');
  const [isSaving, setIsSaving] = useState(false);

  // History Filters
  const [historyFilter, setHistoryFilter] = useState<MissionCategory | 'All'>('All');

  // Timer Focus Mode
  const [focusMission, setFocusMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState<Mission | null>(null);
  const [feedbackDiff, setFeedbackDiff] = useState<'facile' | 'normal' | 'difficile'>('normal');
  const [energyAfter, setEnergyAfter] = useState(5);

  useEffect(() => {
    fetchMissions();
    const sub = subscribeToTable('missions', () => fetchMissions());
    return () => {
      sub.unsubscribe();
      if(timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (focusMission) setShowFeedback(focusMission);
    }
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeLeft, focusMission]);

  const fetchMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMissions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const impact = priority === 'critical' ? 100 : priority === 'high' ? 50 : 20;
      
      const newMission = {
        user_id: user.id,
        title: title.toUpperCase(),
        category,
        priority,
        status: 'Planifiée',
        impact_score: impact,
        planned_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('missions').insert([newMission]);
      if (error) throw error;
      
      setTitle('');
      await fetchMissions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMissionStatus = async (id: string, status: MissionStatus, feedback?: any) => {
    try {
      const payload: any = { status };
      if (status === 'Terminé') {
        payload.completed_at = new Date().toISOString();
        if (feedback) {
          payload.feedback_difficulty = feedback.difficulty;
          payload.feedback_energy_after = feedback.energy;
        }
      }
      
      const { error } = await supabase.from('missions').update(payload).eq('id', id);
      if (error) throw error;
      
      if (status === 'Terminé') {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('total_xp, total_missions_completed').eq('id', user?.id).single();
        
        await supabase.from('profiles').update({ 
          total_xp: (profile?.total_xp || 0) + 50,
          total_missions_completed: (profile?.total_missions_completed || 0) + 1
        }).eq('id', user?.id);
      }
      
      await fetchMissions();
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Titre', 'Catégorie', 'Priorité', 'Statut', 'Date Création', 'Date Complétion', 'Difficulté'];
    const rows = missions.map(m => [
      m.title,
      m.category,
      m.priority,
      m.status,
      m.created_at,
      m.completed_at || 'N/A',
      m.feedback_difficulty || 'N/A'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JB_DISCIPLINE_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const stats = useMemo(() => {
    const total = missions.length || 1;
    const completed = missions.filter(m => m.status === 'Terminé').length;
    const pending = missions.filter(m => m.status !== 'Terminé').length;
    return {
      score: Math.round((completed / total) * 100),
      pending: pending,
      completed: completed
    };
  }, [missions]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/20">
              <ShieldCheck size={32} strokeWidth={2.5} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">DISCIPLINE <span className="text-amber-500 font-outfit">CORE</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">Commandement & Rigueur Tactique</p>
           </div>
        </div>

        <div className="flex p-1.5 bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-x-auto max-w-full">
          {[
            { id: 'rituals', label: 'RITUELS', icon: Zap },
            { id: 'timer', label: 'TACTICAL TIMER', icon: Timer },
            { id: 'planner', label: 'PLANNER', icon: ListTodo },
            { id: 'history', label: 'REGISTRE', icon: History }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-white'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BLUE CONTENT WRAPPER FROM SCREENSHOT */}
      <div className="border border-blue-500/30 rounded-[4rem] p-1 md:p-4 bg-blue-500/[0.01]">
        
        {activeTab === 'planner' && (
          <div className="space-y-12 animate-in zoom-in-95 duration-500">
            
            {/* CAPTURE MODULE (ACCURATE TO SCREENSHOT) */}
            <div className="glass rounded-[3.5rem] p-12 border-white/5 bg-[#0b1121] shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
                  <Layers size={280} />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <ArrowUpRight size={24} className="text-amber-500" />
                     <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] italic">CAPTURE DE MISSION TACTIQUE</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="md:col-span-1">
                        <input 
                          type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
                          placeholder="Action spécifique..." 
                          className="w-full bg-[#020617] border border-white/5 rounded-2xl py-6 px-8 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-all shadow-inner uppercase tracking-wider placeholder:text-slate-800" 
                        />
                     </div>
                     <div>
                        <select 
                          value={category} onChange={(e) => setCategory(e.target.value as MissionCategory)} 
                          className="w-full h-full bg-[#020617] border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white outline-none focus:border-amber-500/40 uppercase tracking-widest"
                        >
                           {['Admin', 'Droit', 'Sport', 'Personnel', 'Spirituel', 'Langues'].map(cat => (
                             <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <select 
                          value={priority} onChange={(e) => setPriority(e.target.value as MissionPriority)} 
                          className="w-full h-full bg-[#020617] border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white outline-none focus:border-amber-500/40 uppercase tracking-widest"
                        >
                           <option value="low">PRIO ÉCO</option>
                           <option value="medium">STANDARD</option>
                           <option value="high">ALERTE</option>
                           <option value="critical">CRITIQUE</option>
                        </select>
                     </div>
                  </div>

                  <button 
                    onClick={handleCreateMission} disabled={isSaving || !title.trim()}
                    className="w-full py-8 bg-amber-500 text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-3xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-30"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Power size={20} className="group-hover:rotate-180 transition-transform duration-500" />}
                    LANCER LA MISSION
                  </button>
               </div>
            </div>

            {/* PENDING MISSIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
              {missions.filter(m => m.status !== 'Terminé').map(mission => (
                <div key={mission.id} className="glass rounded-[3rem] p-10 border border-white/5 bg-[#0b1121]/60 group relative overflow-hidden transition-all hover:border-amber-500/20 shadow-xl flex flex-col justify-between min-h-[220px]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                          <span className="px-5 py-2 bg-slate-950 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{mission.category}</span>
                          {mission.priority === 'critical' && <span className="px-3 py-1.5 bg-rose-500 text-slate-950 rounded-xl text-[8px] font-black uppercase animate-pulse">ALERTE ROUGE</span>}
                        </div>
                        <button 
                          onClick={() => updateMissionStatus(mission.id, 'Terminé')}
                          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-slate-500 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all flex items-center justify-center shadow-inner"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                     </div>
                     <h4 className="text-xl font-black text-white italic tracking-tight uppercase group-hover:text-amber-500 transition-colors">{mission.title}</h4>
                     <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <button 
                          onClick={() => { setFocusMission(mission); setTimeLeft(25 * 60); setIsTimerRunning(true); setActiveTab('timer'); }}
                          className="flex items-center gap-3 text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-all"
                        >
                          <PlayCircle size={14} /> ENGAGER
                        </button>
                        <button onClick={async () => { if(confirm('Neutraliser la mission ?')) await supabase.from('missions').delete().eq('id', mission.id); }} className="text-slate-800 hover:text-rose-500 transition-all">
                           <Trash2 size={16} />
                        </button>
                     </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="py-20 animate-in zoom-in-95 duration-500 flex flex-col items-center">
             <div className={`glass rounded-[4rem] p-24 border-2 transition-all duration-1000 relative overflow-hidden flex flex-col items-center ${isTimerRunning ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5'}`}>
                <div className="absolute top-12 left-12 flex items-center gap-4">
                   <div className={`w-3 h-3 rounded-full ${isTimerRunning ? 'bg-rose-500 animate-pulse' : 'bg-slate-800'}`} />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">NEURAL STREAM : {focusMission ? focusMission.title : 'VEILLE TACTIQUE'}</span>
                </div>
                <h2 className="text-[180px] font-black text-white tracking-tighter leading-none tabular-nums font-outfit italic drop-shadow-2xl">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h2>
                <div className="flex gap-10 mt-12">
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all shadow-3xl ${isTimerRunning ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-amber-500 text-slate-950 shadow-amber-500/30 hover:scale-110'}`}>
                      {isTimerRunning ? <PauseCircle size={56} strokeWidth={2.5} /> : <PlayCircle size={56} strokeWidth={2.5} />}
                   </button>
                   <button onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }} className="w-28 h-28 rounded-[2.5rem] bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center hover:text-white transition-all shadow-xl">
                      <RotateCcw size={40} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8 animate-in slide-in-from-right-8 duration-500 space-y-10">
             <div className="flex justify-between items-center mb-10">
                <div className="flex gap-4">
                  <div className="p-1 bg-slate-950 rounded-2xl border border-white/5 flex">
                    {['All', 'Admin', 'Droit', 'Sport'].map(cat => (
                      <button key={cat} onClick={() => setHistoryFilter(cat as any)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === cat ? 'bg-white text-slate-950' : 'text-slate-600 hover:text-slate-400'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white hover:border-amber-500/30 transition-all uppercase tracking-widest">
                  <FileDown size={18} /> EXPORTER CSV
                </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                      <th className="px-10 pb-4">Statut</th>
                      <th className="px-10 pb-4">Mission</th>
                      <th className="px-10 pb-4">Catégorie</th>
                      <th className="px-10 pb-4">Difficulté</th>
                      <th className="px-10 pb-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.filter(m => historyFilter === 'All' || m.category === historyFilter).map(m => (
                      <tr key={m.id} className="bg-[#020617]/60 hover:bg-white/[0.04] transition-all rounded-3xl group">
                         <td className="px-10 py-6 rounded-l-[1.5rem]">
                            {m.status === 'Terminé' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Clock className="text-slate-800" size={20} />}
                         </td>
                         <td className="px-10 py-6">
                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{m.title}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Impact: +{m.impact_score} XP</p>
                         </td>
                         <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{m.category}</td>
                         <td className="px-10 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${m.feedback_difficulty === 'facile' ? 'bg-emerald-500/10 text-emerald-500' : m.feedback_difficulty === 'difficile' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                               {m.feedback_difficulty || 'N/A'}
                            </span>
                         </td>
                         <td className="px-10 py-6 rounded-r-[1.5rem] text-right text-[10px] font-black text-slate-600 italic">
                            {new Date(m.completed_at || m.created_at).toLocaleDateString()}
                         </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'rituals' && (
          <div className="p-12 animate-in fade-in duration-500 space-y-12">
             <div className="flex justify-center mb-10">
                <div className="flex p-2 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                  <button onClick={() => setRitualPhase('morning')} className={`flex items-center gap-4 px-12 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${ritualPhase === 'morning' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-600'}`}>
                    <Sun size={18} /> MORNING SEQUENCE
                  </button>
                  <button onClick={() => setRitualPhase('evening')} className={`flex items-center gap-4 px-12 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${ritualPhase === 'evening' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>
                    <Moon size={18} /> EVENING PROTOCOL
                  </button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {(ritualPhase === 'morning' ? [
                  { id: 'm1', text: 'Réveil tactique 05:30', icon: Zap },
                  { id: 'm2', text: 'Prière & Connexion Spirituelle', icon: Brain },
                  { id: 'm3', text: 'Lecture Biblique / Mental Focus', icon: BookOpen },
                  { id: 'm4', text: 'Planification Modules Droit', icon: ListTodo }
                ] : [
                  { id: 'e1', text: 'Archive Gratitude / Journal', icon: Heart },
                  { id: 'e2', text: 'Logistique Sport J+1', icon: Dumbbell },
                  { id: 'e3', text: 'Examen des Flux Financiers', icon: Wallet },
                  { id: 'e4', text: 'Coupe-circuit Neural (Écrans OFF)', icon: Moon }
                ]).map((ritual) => (
                  <div key={ritual.id} className="p-10 glass rounded-[3.5rem] border border-white/5 bg-[#0b1121]/40 flex items-center justify-between group hover:border-amber-500/20 transition-all cursor-pointer shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-slate-950 border border-white/5 flex items-center justify-center text-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
                        <ritual.icon size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{ritual.text}</h4>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-3 italic">VALIDATION NÉCESSAIRE</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-800 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all">
                      <CheckCircle2 size={28} strokeWidth={3} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>

      {/* FEEDBACK MODAL (SCEAU DE MISSION) */}
      {showFeedback && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[4rem] p-12 text-center shadow-3xl">
              <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] mx-auto flex items-center justify-center text-slate-950 shadow-2xl mb-10 shadow-amber-500/20">
                 <ClipboardCheck size={48} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">MISSION ACQUISE</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Scellez le rapport d'exécution pour : {showFeedback.title}</p>
              
              <div className="space-y-12 mb-12">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">DIFFICULTÉ :</p>
                    <div className="flex gap-4 justify-center">
                       {(['facile', 'normal', 'difficile'] as const).map(d => (
                         <button key={d} onClick={() => setFeedbackDiff(d)} className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${feedbackDiff === d ? 'bg-white text-slate-950 border-white shadow-xl' : 'bg-slate-950 text-slate-500 border-white/5'}`}>{d}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">ÉNERGIE RESTANTE : {energyAfter}/10</p>
                    <input type="range" min="1" max="10" value={energyAfter} onChange={e => setEnergyAfter(Number(e.target.value))} className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                 </div>
              </div>

              <button 
                onClick={() => { updateMissionStatus(showFeedback.id, 'Terminé', { difficulty: feedbackDiff, energy: energyAfter }); setShowFeedback(null); setFocusMission(null); }} 
                className="w-full py-8 bg-amber-500 text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-3xl hover:scale-105 transition-all"
              >
                 SCELLER DÉFINITIVEMENT
              </button>
           </div>
        </div>
      )}

      {/* TACTICAL SCORE BAR (MATCHING SCREENSHOT) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-3xl border border-white/10 px-16 py-8 rounded-full shadow-3xl flex items-center gap-16 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 rounded-[1.2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                <Target size={22} strokeWidth={3} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">DISCIPLINE</p>
                <p className="text-sm font-black text-white uppercase italic">{stats.score}% RENDEMENT</p>
             </div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner">
                <Activity size={22} strokeWidth={3} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">MISSIONS</p>
                <p className="text-sm font-black text-white uppercase italic">{stats.pending} EN ATTENTE</p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Discipline;
