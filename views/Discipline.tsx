
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Zap, ShieldAlert, Dumbbell, Brain, CheckCircle2, Plus, Trash2, ListTodo, History, Target, Clock, ArrowUpRight, Loader2, Moon, Sun, Filter, Star, AlertCircle, PlayCircle, PauseCircle, Timer, RotateCcw, MessageSquare, ShieldCheck, ChevronRight, BarChart3, TrendingUp, MoreVertical, X, Power, Layers, Activity, Calendar as CalendarIcon, FilterX, Database, Award, ClipboardCheck, BookOpen, Heart, Wallet, FileDown, Eye, Sparkles
} from 'lucide-react';
import { supabase, handleSupabaseError, subscribeToTable } from '../lib/supabase';
import { Mission, MissionStatus, MissionPriority, MissionCategory } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const generateAIPlanner = async () => {
    setAiGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Génère 3 missions tactiques pertinentes pour aujourd'hui basées sur ces catégories: Admin, Droit, Sport, Personnel, Spirituel, Langues. 
      Réponds UNIQUEMENT avec un JSON valide respectant ce schéma:
      [{"title": "titre concis", "category": "une des catégories citées", "priority": "low/medium/high/critical"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                priority: { type: Type.STRING }
              },
              required: ["title", "category", "priority"]
            }
          }
        }
      });

      const suggestedMissions = JSON.parse(response.text || "[]");
      
      const inserts = suggestedMissions.map((m: any) => ({
        user_id: user.id,
        title: m.title.toUpperCase(),
        category: m.category,
        priority: m.priority,
        status: 'Planifiée',
        impact_score: m.priority === 'critical' ? 100 : m.priority === 'high' ? 50 : 20,
        planned_date: new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase.from('missions').insert(inserts);
      if (error) throw error;
      
      await fetchMissions();
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
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
    <div className="space-y-8 pb-44 animate-in fade-in duration-700">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl shrink-0">
              <ShieldCheck size={28} strokeWidth={2.5} />
           </div>
           <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">DISCIPLINE <span className="text-amber-500">CORE</span></h2>
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">Commandement Tactique</p>
           </div>
           <div className="md:hidden w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-lg shadow-amber-500/20">9</div>
        </div>

        <div className="flex p-1 bg-slate-900 border border-white/5 rounded-2xl shadow-xl w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'rituals', label: 'RITUELS', icon: Zap },
            { id: 'timer', label: 'TIMER', icon: Timer },
            { id: 'planner', label: 'PLANNER', icon: ListTodo },
            { id: 'history', label: 'REGISTRE', icon: History }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-amber-500 text-slate-950' : 'text-slate-500'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-blue-500/20 rounded-[2.5rem] md:rounded-[4rem] p-4 md:p-6 bg-blue-500/[0.01]">
        
        {activeTab === 'planner' && (
          <div className="space-y-10">
            
            {/* AI AUTO-PLANNER BUTTON */}
            <div className="flex justify-end mb-4">
               <button 
                 onClick={generateAIPlanner}
                 disabled={aiGenerating}
                 className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                 {aiGenerating ? "Génération IA..." : "Planifier Missions via IA"}
               </button>
            </div>

            {/* CAPTURE MODULE */}
            <div className="glass rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 border-white/5 bg-[#0b1121] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <ArrowUpRight size={18} className="text-amber-500" />
                     <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] italic">CAPTURE DE MISSION MANUELLE</h4>
                  </div>
                  
                  <div className="flex flex-col gap-4 mb-6">
                     <input 
                       type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
                       placeholder="Action spécifique..." 
                       className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/40 uppercase" 
                     />
                     <div className="grid grid-cols-2 gap-4">
                        <select 
                          value={category} onChange={(e) => setCategory(e.target.value as MissionCategory)} 
                          className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white uppercase tracking-widest"
                        >
                           {['Admin', 'Droit', 'Sport', 'Personnel', 'Spirituel', 'Langues'].map(cat => (
                             <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                           ))}
                        </select>
                        <select 
                          value={priority} onChange={(e) => setPriority(e.target.value as MissionPriority)} 
                          className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white uppercase tracking-widest"
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
                    className="w-full py-6 bg-amber-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Power size={18} />}
                    LANCER LA MISSION
                  </button>
               </div>
            </div>

            {/* PENDING MISSIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.filter(m => m.status !== 'Terminé').map(mission => (
                <div key={mission.id} className="glass rounded-[2rem] p-6 border border-white/5 bg-[#0b1121]/60 group relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[160px]">
                     <div className="flex justify-between items-start mb-4">
                        <span className="px-4 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{mission.category}</span>
                        <button 
                          onClick={() => updateMissionStatus(mission.id, 'Terminé')}
                          className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-emerald-500 transition-all flex items-center justify-center"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                     </div>
                     <h4 className="text-base font-black text-white italic tracking-tight uppercase">{mission.title}</h4>
                     <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <button 
                          onClick={() => { setFocusMission(mission); setTimeLeft(25 * 60); setIsTimerRunning(true); setActiveTab('timer'); }}
                          className="flex items-center gap-2 text-[8px] font-black text-amber-500 uppercase tracking-widest"
                        >
                          <PlayCircle size={12} /> ENGAGER
                        </button>
                        <button onClick={async () => { if(confirm('Neutraliser ?')) await supabase.from('missions').delete().eq('id', mission.id); }} className="text-slate-800">
                           <Trash2 size={14} />
                        </button>
                     </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="py-12 flex flex-col items-center">
             <div className="glass rounded-[3rem] p-12 md:p-20 border border-white/5 relative flex flex-col items-center w-full max-w-sm">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">{focusMission ? focusMission.title : 'VEILLE TACTIQUE'}</span>
                <h2 className="text-7xl md:text-8xl font-black text-white font-outfit italic">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h2>
                <div className="flex gap-6 mt-10">
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isTimerRunning ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                      {isTimerRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
                   </button>
                   <button onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }} className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center">
                      <RotateCcw size={28} />
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] p-8 text-center shadow-3xl">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-xl mb-8">
                 <ClipboardCheck size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">MISSION ACQUISE</h3>
              
              <div className="space-y-8 mb-10">
                 <div className="flex gap-2 justify-center">
                    {(['facile', 'normal', 'difficile'] as const).map(d => (
                      <button key={d} onClick={() => setFeedbackDiff(d)} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border ${feedbackDiff === d ? 'bg-white text-slate-950' : 'bg-slate-950 text-slate-500'}`}>{d}</button>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">ÉNERGIE : {energyAfter}/10</p>
                    <input type="range" min="1" max="10" value={energyAfter} onChange={e => setEnergyAfter(Number(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg accent-amber-500 appearance-none" />
                 </div>
              </div>

              <button 
                onClick={() => { updateMissionStatus(showFeedback.id, 'Terminé', { difficulty: feedbackDiff, energy: energyAfter }); setShowFeedback(null); setFocusMission(null); }} 
                className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-lg"
              >
                 SCELLER DÉFINITIVEMENT
              </button>
           </div>
        </div>
      )}

      {/* TACTICAL SCORE BAR */}
      <div className="fixed bottom-[110px] left-4 right-4 z-[100] glass border border-white/10 px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Target size={18} strokeWidth={3} />
             </div>
             <div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">DISCIPLINE</p>
                <p className="text-[10px] font-black text-white uppercase italic">{stats.score}% RENDEMENT</p>
             </div>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Activity size={18} strokeWidth={3} />
             </div>
             <div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">MISSIONS</p>
                <p className="text-[10px] font-black text-white uppercase italic">{stats.pending} EN ATTENTE</p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Discipline;
