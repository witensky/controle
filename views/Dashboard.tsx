
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Target, Zap, Loader2, Shield, Trophy, Activity, BookOpen, Flame, BrainCircuit,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingDown, Sparkles, Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line
} from 'recharts';
import { AppView } from '../types';
import { supabase, subscribeToTable } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userProfile, setUserProfile] = useState({ xp: 0, rank: 'RECRUE TACTIQUE', username: 'WITENSKY' });
  const [missions, setMissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    financeRemaining: 0, 
    financePercentage: 0,
    todaySpent: 0,
    dailyTrend: [] as { date: string, amount: number }[],
    tasksCount: 0, 
    subjectsCount: 0, 
    disciplineScore: 0
  });

  useEffect(() => {
    fetchGlobalStats();
    const sub = subscribeToTable('profiles', () => fetchGlobalStats());
    const missionSub = subscribeToTable('missions', () => fetchGlobalStats());
    const financeSub = subscribeToTable('finance_transactions', () => fetchGlobalStats());
    return () => {
      sub.unsubscribe();
      missionSub.unsubscribe();
      financeSub.unsubscribe();
    };
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txsRes, profileRes, missionsRes, subsRes] = await Promise.all([
        supabase.from('finance_transactions').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('missions').select('*').eq('user_id', user.id),
        supabase.from('study_subjects').select('*').eq('user_id', user.id),
      ]);

      if (profileRes.data) {
        setUserProfile({
          xp: profileRes.data.total_xp || 0,
          rank: profileRes.data.rank_title || 'OPÉRATEUR TACTIQUE',
          username: profileRes.data.username || 'WITENSKY'
        });
      }

      if (missionsRes.data) {
        setMissions(missionsRes.data);
      }

      const today = new Date().toISOString().split('T')[0];
      const allTxs = txsRes.data || [];
      
      const todaySpent = allTxs
        .filter(t => t.type === 'expense' && t.date === today)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dStr = d.toISOString().split('T')[0];
        const daySpent = allTxs
          .filter(t => t.type === 'expense' && t.date === dStr)
          .reduce((sum, t) => sum + Number(t.amount), 0);
        return { date: dStr, amount: daySpent };
      });

      const budget = Number(profileRes.data?.amci_monthly_amount) || 3500;
      const spentTotal = allTxs.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
      const remaining = budget - spentTotal;
      
      setStats({
        financeRemaining: remaining,
        financePercentage: Math.max(0, Math.round((remaining / budget) * 100)),
        todaySpent,
        dailyTrend: last7Days,
        tasksCount: (missionsRes.data || []).filter((m: any) => m.status !== 'Terminé').length,
        subjectsCount: (subsRes.data || []).length,
        disciplineScore: (missionsRes.data || []).length ? Math.round(((missionsRes.data || []).filter((m: any) => m.status === 'Terminé').length / (missionsRes.data || []).length) * 100) : 0
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getAIBriefing = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyse mes stats actuelles et donne-moi un briefing tactique ultra-concis (max 3 phrases). 
      Stats: Discipline ${stats.disciplineScore}%, AMCI restant ${stats.financePercentage}%, Missions en attente: ${stats.tasksCount}, Cours de droit: ${stats.subjectsCount}. 
      Sois direct, autoritaire et motivant. Identifie le point le plus critique.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiBriefing(response.text || "Erreur d'analyse.");
    } catch (error) {
      console.error(error);
      setAiBriefing("Liaison IA interrompue.");
    } finally {
      setAiLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < shift; i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  const quickStats = [
    { label: 'AMCI Reste', val: `${stats.financeRemaining.toLocaleString()} DH`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/5', view: 'FINANCE', progress: stats.financePercentage },
    { label: 'Dépenses Jour', val: `${stats.todaySpent.toLocaleString()} DH`, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/5', view: 'FINANCE', trend: stats.dailyTrend },
    { label: 'Discipline', val: `${stats.disciplineScore}%`, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/5', view: 'DISCIPLINE', progress: stats.disciplineScore },
    { label: 'Missions', val: stats.tasksCount, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/5', view: 'DISCIPLINE' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* AI INTELLIGENCE BRIEFING */}
      <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 border-blue-500/20 bg-blue-500/[0.03] shadow-[0_0_20px_rgba(59,130,246,0.1)] border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Sparkles size={18} className={aiLoading ? "animate-spin" : ""} />
            </div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">NOYAU ANALYTIQUE IA</h3>
          </div>
          <button 
            onClick={getAIBriefing}
            disabled={aiLoading}
            className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            Générer Briefing
          </button>
        </div>
        <div className="min-h-[40px] flex items-center">
          {aiLoading ? (
             <div className="flex gap-1">
               <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
               <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
               <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          ) : (
            <p className="text-xs font-medium text-slate-300 italic leading-relaxed">
              {aiBriefing || "En attente de commande. Cliquez sur 'Générer Briefing' pour une analyse tactique."}
            </p>
          )}
        </div>
      </div>

      {/* HEADER HUD */}
      <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-amber-500/20 bg-amber-500/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-amber-500"><Shield size={180} /></div>
         <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl shrink-0">
               <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
               <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">PROFIL ACTIF</p>
               <h2 className="text-xl md:text-3xl font-black text-white italic uppercase truncate">{userProfile.rank}</h2>
               <div className="mt-2 h-1.5 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: '65%' }} />
               </div>
            </div>
         </div>
      </div>

      {/* QUICK GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s, i) => (
          <div key={i} onClick={() => onNavigate(s.view as AppView)} className={`glass rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer border-white/5 ${s.bg} hover:border-white/20 transition-all active:scale-95 flex flex-col justify-between overflow-hidden relative min-h-[140px]`}>
            <div className="flex justify-between items-center mb-1 relative z-10">
              <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <s.icon size={12} className={s.color} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-black text-white italic">{s.val}</h3>
              {s.progress !== undefined && (
                <div className="mt-2 h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${s.color.replace('text-', 'bg-')}`} style={{ width: `${s.progress}%` }} />
                </div>
              )}
            </div>
            {s.trend && (
              <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.trend}>
                    <Area type="monotone" dataKey="amount" stroke="#f43f5e" fill="#f43f5e" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass rounded-[2rem] p-6 md:p-10 border-white/5 bg-[#020617]/40 shadow-xl">
           <h3 className="text-[9px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Flame size={14} className="text-rose-500" /> Flux Consommation</h3>
           <div className="h-[250px] w-full min-h-[250px] relative">
             <ResponsiveContainer width="99%" height="100%">
               <AreaChart data={[{name: 'Lun', v: 400}, {name: 'Mar', v: 300}, {name: 'Mer', v: 600}, {name: 'Jeu', v: 200}, {name: 'Ven', v: 500}, {name: 'Sam', v: 450}, {name: 'Dim', v: 350}]}>
                 <defs>
                   <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 9}} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                 <Area type="monotone" dataKey="v" stroke="#fbbf24" fill="url(#dashGrad)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-5 glass rounded-[2rem] p-6 md:p-10 border-white/5 bg-[#020617]/40 shadow-xl">
           <h3 className="text-[9px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><BrainCircuit size={14} className="text-blue-500" /> Équilibre Pilier</h3>
           <div className="h-[250px] w-full min-h-[250px] relative">
             <ResponsiveContainer width="99%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{s: 'F', v: 80}, {s: 'D', v: 90}, {s: 'L', v: 70}, {s: 'S', v: 60}, {s: 'B', v: 85}]}>
                 <PolarGrid stroke="#1e293b" />
                 <PolarAngleAxis dataKey="s" tick={{fill: '#475569', fontSize: 9, fontWeight: '900'}} />
                 <Radar dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* TACTICAL CALENDAR */}
      <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-white/5 bg-[#020617]/60 shadow-2xl relative">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
               <CalendarIcon size={20} className="text-amber-500" />
               <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">CALENDRIER OPÉRATIONNEL</h3>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
               <button onClick={() => changeMonth(-1)} className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
               <span className="text-[10px] font-black text-white uppercase tracking-widest min-w-[120px] text-center">
                 {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
               </span>
               <button onClick={() => changeMonth(1)} className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronRight size={20}/></button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-1 md:gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-[7px] font-black text-slate-600 uppercase tracking-widest pb-3">{d}</div>
            ))}
            {daysInMonth.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              
              const dStr = day.toISOString().split('T')[0];
              const isToday = dStr === todayStr;
              const dayMissions = missions.filter(m => m.planned_date === dStr || (m.completed_at && m.completed_at.startsWith(dStr)));
              const completedCount = dayMissions.filter(m => m.status === 'Terminé').length;
              const pendingCount = dayMissions.filter(m => m.status !== 'Terminé').length;

              return (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-1 relative group ${
                    isToday ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-white/5 glass hover:border-white/20'
                  }`}
                >
                  <span className={`text-[9px] md:text-xs font-black ${isToday ? 'text-amber-500' : 'text-slate-500'}`}>
                    {day.getDate()}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {completedCount > 0 && <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
                    {pendingCount > 0 && <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
                  </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
