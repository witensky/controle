
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Wallet, Target, Zap, Loader2, BarChart3, TrendingUp, ChevronLeft, ChevronRight, Clock, BookOpen, Quote, CheckCircle2, History, Banknote, Shield, Trophy, Star, Activity, BrainCircuit, LineChart as LucideLineChart, AlertCircle, Flame, ArrowDownCircle, Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area, LineChart, Line, Cell
} from 'recharts';
import { AppView, LawSubject, Mission } from '../types';
import { supabase, subscribeToTable } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

interface TacticalEvent {
  id: string;
  type: 'task' | 'exam' | 'journal' | 'expense' | 'future_expense';
  title: string;
  date: string;
  amount?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'COURSES': '#10b981',
  'PLAISIR': '#f59e0b',
  'TRANSPORT': '#3b82f6',
  'LOYERS': '#6366f1',
  'ADMIN': '#94a3b8',
  'SANTÉ': '#f43f5e',
  'AUTRES': '#64748b'
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ xp: 0, rank: 'RECRUE TACTIQUE', username: 'WITENSKY' });
  const [stats, setStats] = useState({
    financeRemaining: 0,
    financePercentage: 0,
    todaySpent: 0,
    futureProvisions: 0,
    tasksCount: 0,
    subjectsCount: 0,
    disciplineScore: 0
  });
  const [categoryData, setCategoryData] = useState<{name: string, value: number}[]>([]);
  const [dailyTrendData, setDailyTrendData] = useState<{name: string, value: number}[]>([]);
  const [radarData, setRadarData] = useState<{subject: string, A: number, fullMark: number}[]>([]);
  const [trendData, setTrendData] = useState<{name: string, score: number}[]>([]);
  const [events, setEvents] = useState<TacticalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchGlobalStats();
    const subs = [
      subscribeToTable('finance_transactions', () => fetchGlobalStats()),
      subscribeToTable('missions', () => fetchGlobalStats()),
      subscribeToTable('study_subjects', () => fetchGlobalStats()),
      subscribeToTable('journal_entries', () => fetchGlobalStats()),
      subscribeToTable('profiles', () => fetchGlobalStats())
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txsRes, profileRes, missionsRes, subsRes, journalRes, langRes] = await Promise.all([
        supabase.from('finance_transactions').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('missions').select('*').eq('user_id', user.id),
        supabase.from('study_subjects').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('learned_words').select('*').eq('user_id', user.id)
      ]);

      const txs = txsRes.data || [];
      const profile = profileRes.data;
      const missions: Mission[] = missionsRes.data || [];
      const subs: LawSubject[] = subsRes.data || [];
      const journals = journalRes.data || [];
      const words = langRes.data || [];

      if (profile) {
        setUserProfile({
          xp: profile.total_xp || 0,
          rank: profile.rank_title || 'RECRUE TACTIQUE',
          username: profile.username || 'WITENSKY'
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Stats financières
      const totalBudget = Number(profile?.amci_monthly_amount) || 3500;
      const expenses = txs.filter(t => t.type === 'expense' && t.date <= today).reduce((a, b) => a + Number(b.amount), 0);
      const todaySpent = txs.filter(t => t.type === 'expense' && t.date === today).reduce((a, b) => a + Number(b.amount), 0);
      const futureProvisions = txs.filter(t => t.type === 'expense' && t.date > today).reduce((a, b) => a + Number(b.amount), 0);
      const remaining = totalBudget - expenses;
      const financePct = Math.max(0, Math.min(100, Math.round((remaining / totalBudget) * 100)));

      // Tendance quotidienne sur 7 jours
      const last7DaysFinance = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dStr = d.toISOString().split('T')[0];
        const daySpent = txs.filter(t => t.type === 'expense' && t.date === dStr).reduce((a, b) => a + Number(b.amount), 0);
        return { name: d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase(), value: daySpent };
      });
      setDailyTrendData(last7DaysFinance);

      const totalMissions = missions.length || 1;
      const completedMissions = missions.filter(m => m.status === 'Terminé').length;
      const discScore = Math.round((completedMissions / totalMissions) * 100);

      const studiesProgress = subs.length > 0 ? Math.round(subs.reduce((a, b) => a + b.progress, 0) / subs.length) : 0;
      const spiritualScore = Math.min(100, journals.length * 10);
      const langScore = Math.min(100, words.length * 5);

      setRadarData([
        { subject: 'Finance', A: financePct, fullMark: 100 },
        { subject: 'Discipline', A: discScore, fullMark: 100 },
        { subject: 'Droit', A: studiesProgress, fullMark: 100 },
        { subject: 'Mental', A: spiritualScore, fullMark: 100 },
        { subject: 'Langues', A: langScore, fullMark: 100 },
        { subject: 'Sport', A: 75, fullMark: 100 },
      ]);

      const last7DaysDiscipline = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dStr = d.toISOString().split('T')[0];
        const dayDone = missions.filter(m => m.status === 'Terminé' && m.completed_at?.startsWith(dStr)).length;
        return { name: d.toLocaleDateString('fr-FR', { weekday: 'short' }), score: (dayDone * 20) + 40 };
      });
      setTrendData(last7DaysDiscipline);

      const catMap: Record<string, number> = {};
      txs.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      }).forEach(t => { 
        const cat = (t.category || 'AUTRES').toUpperCase();
        catMap[cat] = (catMap[cat] || 0) + Number(t.amount); 
      });

      const compiledEvents: TacticalEvent[] = [
        ...missions.map(m => ({
          id: m.id,
          type: 'task' as const,
          title: m.status === 'Terminé' ? `Acquis: ${m.title}` : `Prévu: ${m.title}`,
          date: m.completed_at ? m.completed_at.split('T')[0] : (m.planned_date || m.created_at.split('T')[0])
        })),
        ...subs.filter(s => s.examDate).map(s => ({
          id: s.id,
          type: 'exam' as const,
          title: `EXAM: ${s.name}`,
          date: s.examDate!
        })),
        ...txs.map(t => ({
          id: t.id,
          type: (t.date > today ? 'future_expense' : 'expense') as any,
          title: `${t.type === 'deposit' ? 'Dépôt' : 'Dépense'}: ${t.title} (${t.amount} DH)`,
          date: t.date,
          amount: t.amount
        }))
      ];

      setEvents(compiledEvents);
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));
      setStats({
        financeRemaining: remaining,
        financePercentage: financePct,
        todaySpent,
        futureProvisions,
        tasksCount: missions.filter(t => t.status !== 'Terminé').length,
        subjectsCount: subs.length,
        disciplineScore: discScore
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextRankXP = useMemo(() => {
    if (userProfile.xp < 500) return 500;
    if (userProfile.xp < 1500) return 1500;
    if (userProfile.xp < 3000) return 3000;
    return 5000;
  }, [userProfile.xp]);

  const xpProgress = (userProfile.xp / nextRankXP) * 100;

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      {/* HEADER HUD */}
      <div className="glass rounded-[2.5rem] p-8 border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
            <Shield size={180} />
         </div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/20">
               <Trophy size={40} strokeWidth={2.5} />
            </div>
            <div>
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1 italic">PROFIL OPÉRATEUR : {userProfile.username}</p>
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{userProfile.rank}</h2>
            </div>
         </div>
         <div className="flex-1 max-w-md w-full relative z-10">
            <div className="flex justify-between items-end mb-3">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{userProfile.xp} XP</span>
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">{nextRankXP} XP</span>
            </div>
            <div className="h-4 bg-slate-950 rounded-full border border-white/5 p-1">
               <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
            </div>
         </div>
      </div>

      {/* QUICK STATS & NEW DAILY SPENT MONITOR */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* NEW WIDGET: DAILY BURN */}
        <div onClick={() => onNavigate('FINANCE')} className="glass rounded-[1.5rem] p-6 cursor-pointer bg-rose-500/5 border-rose-500/10 shadow-xl hover:border-rose-500/30 transition-all group animate-pulse-glow">
           <div className="flex justify-between items-center mb-3">
             <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">Dépenses Jour</p>
             <ArrowDownCircle size={14} className="text-rose-500" />
           </div>
           <h3 className="text-2xl font-black text-white italic">{stats.todaySpent.toLocaleString()} <span className="text-xs text-slate-500 uppercase">DH</span></h3>
           <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-2">RESET À MINUIT</p>
        </div>
        
        <div onClick={() => onNavigate('FINANCE')} className="glass rounded-[1.5rem] p-6 cursor-pointer bg-[#0f172a]/40 border-white/5 shadow-xl hover:border-amber-500/30 transition-all group">
           <div className="flex justify-between items-center mb-3">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AMCI Flux</p>
             <Wallet size={14} className="text-emerald-500 opacity-50 group-hover:opacity-100" />
           </div>
           <h3 className="text-2xl font-black text-white italic">{stats.financePercentage}%</h3>
        </div>
        
        <div onClick={() => onNavigate('DISCIPLINE')} className="glass rounded-[1.5rem] p-6 cursor-pointer bg-amber-500/5 border-amber-500/10 shadow-xl hover:border-amber-500/30 transition-all group">
           <div className="flex justify-between items-center mb-3">
             <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">Discipline</p>
             <Target size={14} className="text-amber-500 opacity-50 group-hover:opacity-100" />
           </div>
           <h3 className="text-2xl font-black text-white italic">{stats.disciplineScore}%</h3>
        </div>
        
        <div onClick={() => onNavigate('DISCIPLINE')} className="glass rounded-[1.5rem] p-6 cursor-pointer bg-[#0f172a]/40 border-white/5 shadow-xl hover:border-amber-500/30 transition-all group">
           <div className="flex justify-between items-center mb-3">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Missions</p>
             <Activity size={14} className="text-blue-500 opacity-50 group-hover:opacity-100" />
           </div>
           <h3 className="text-2xl font-black text-white italic">{stats.tasksCount}</h3>
        </div>
        
        <div onClick={() => onNavigate('STUDIES')} className="glass rounded-[1.5rem] p-6 cursor-pointer bg-[#0f172a]/40 border-white/5 shadow-xl hover:border-amber-500/30 transition-all group">
           <div className="flex justify-between items-center mb-3">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Droit</p>
             <BookOpen size={14} className="text-indigo-500 opacity-50 group-hover:opacity-100" />
           </div>
           <h3 className="text-2xl font-black text-white italic">{stats.subjectsCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FINANCE BY CATEGORY */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
             <TrendingUp size={16} className="text-emerald-500" /> RÉPARTITION DES DÉPENSES (MOIS)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 9, fontWeight: 900}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['AUTRES']} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NEW: DAILY VELOCITY CHART (7 DAYS) */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
             <Flame size={16} className="text-rose-500" /> VÉLOCITÉ FINANCIÈRE (7 DERNIERS JOURS)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 9, fontWeight: 900}} />
                <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* RADAR CHART - BALANCE */}
        <div className="lg:col-span-4 glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
             <BrainCircuit size={16} className="text-blue-500" /> ÉQUILIBRE DES PILIERS
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 8, fontWeight: 900}} />
                <Radar
                  name="Niveau"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISCIPLINE TREND CHART */}
        <div className="lg:col-span-8 glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
             <LucideLineChart size={16} className="text-emerald-500" /> TENDANCE DE DISCIPLINE (7 DERNIERS JOURS)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 9, fontWeight: 900}} />
                <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CALENDAR - REGISTRE TEMPOREL */}
        <div className="lg:col-span-12 glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
             <div>
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                  <CalendarIcon size={16} className="text-amber-500" /> REGISTRE TEMPOREL & ÉVÉNEMENTS TACTIQUES
               </h3>
               <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[8px] font-black text-slate-600 uppercase">Missions</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[8px] font-black text-slate-600 uppercase">Examens</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[8px] font-black text-slate-600 uppercase">Finances</span></div>
               </div>
             </div>
             <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-slate-500 hover:text-white"><ChevronLeft size={16} /></button>
                <span className="text-[9px] font-black text-white uppercase tracking-widest min-w-[120px] text-center italic">{monthName}</span>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-slate-500 hover:text-white"><ChevronRight size={16} /></button>
             </div>
          </div>
          
          <div className="grid grid-cols-7 gap-3">
             {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
               <div key={d} className="text-center text-[9px] font-black text-slate-700 uppercase tracking-widest pb-4 italic">{d}</div>
             ))}
             {calendarDays.map((day, i) => {
               if (day === null) return <div key={`empty-${i}`} className="aspect-square opacity-5" />;
               
               const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
               const dayEvents = events.filter(e => e.date === dayStr);
               
               const hasTasks = dayEvents.some(e => e.type === 'task');
               const hasExams = dayEvents.some(e => e.type === 'exam');
               const hasFinance = dayEvents.some(e => e.type === 'expense' || e.type === 'future_expense');

               return (
                 <div key={day} className={`aspect-square rounded-[1.5rem] border relative flex flex-col items-center justify-center group transition-all p-2 ${
                   dayEvents.length > 0 ? 'bg-white/[0.02] border-white/10 hover:border-amber-500/30' : 'border-white/5 bg-slate-950/30 hover:bg-white/[0.01]'
                 }`}>
                    <span className={`text-[14px] font-black mb-1 ${dayEvents.length > 0 ? 'text-white italic' : 'text-slate-800'}`}>{day}</span>
                    
                    <div className="flex gap-1">
                      {hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" title="Missions" />}
                      {hasExams && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" title="Examens" />}
                      {hasFinance && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" title="Finances" />}
                    </div>

                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-[200] pointer-events-none">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-2 italic">Détails du {dayStr}</p>
                        <div className="space-y-1.5">
                           {dayEvents.slice(0, 3).map((e, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${e.type === 'task' ? 'bg-amber-500' : e.type === 'exam' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                <span className="text-[9px] font-bold text-white truncate uppercase">{e.title}</span>
                             </div>
                           ))}
                           {dayEvents.length > 3 && <p className="text-[7px] text-slate-600 uppercase font-black">+{dayEvents.length - 3} autres</p>}
                        </div>
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
