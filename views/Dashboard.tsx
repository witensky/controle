
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Calendar, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Bell,
  Target,
  Zap,
  Info,
  Send,
  Dumbbell,
  // Added missing Wallet icon import
  Wallet
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { AppView, UserStats } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const masteryData = [
  { day: 'Lun', score: 65, discipline: 70 },
  { day: 'Mar', score: 72, discipline: 75 },
  { day: 'Mer', score: 85, discipline: 80 },
  { day: 'Jeu', score: 78, discipline: 82 },
  { day: 'Ven', score: 90, discipline: 88 },
  { day: 'Sam', score: 95, discipline: 92 },
  { day: 'Dim', score: 91, discipline: 91 },
];

const studyDistribution = [
  { name: 'Droit Civil', value: 45, color: '#fbbf24' },
  { name: 'Admin', value: 25, color: '#3b82f6' },
  { name: 'Constit', value: 20, color: '#8b5cf6' },
  { name: 'Langues', value: 10, color: '#f97316' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week'>('day');
  const [activityInput, setActivityInput] = useState('');
  const [activities, setActivities] = useState([
    { text: "Révision intensive Contrats", time: "14:30" },
    { text: "Séance Push Day validée", time: "17:45" }
  ]);

  const handleLogActivity = () => {
    if (!activityInput.trim()) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    setActivities([{ text: activityInput, time }, ...activities]);
    setActivityInput('');
  };

  const stats: UserStats = {
    finance: 82,
    studies: 65,
    discipline: 91,
    mental: 70,
    spiritual: 88,
    languages: 45
  };

  const currentDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const categories = [
    { label: 'Finance', value: stats.finance, color: 'text-amber-500', bg: 'bg-amber-500/20', icon: TrendingUp },
    { label: 'Études', value: stats.studies, color: 'text-blue-500', bg: 'bg-blue-500/20', icon: Target },
    { label: 'Discipline', value: stats.discipline, color: 'text-emerald-500', bg: 'bg-emerald-500/20', icon: Zap },
    { label: 'Mental', value: stats.mental, color: 'text-indigo-500', bg: 'bg-indigo-500/20', icon: Info },
    { label: 'Spirituel', value: stats.spiritual, color: 'text-purple-500', bg: 'bg-purple-500/20', icon: Bell },
    { label: 'Sport', value: 75, color: 'text-rose-500', bg: 'bg-rose-500/20', icon: Dumbbell },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 capitalize">{currentDate}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Bonjour, <span className="text-amber-500">Witensky</span></h1>
          <p className="text-slate-400 font-medium italic">"La discipline est le pont entre tes objectifs et tes accomplissements."</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Score</span>
              <span className="text-2xl font-black text-emerald-500">91/100</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full" style={{ clipPath: 'inset(0 0 9% 0)' }}></div>
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logger - NEW FIELD */}
      <div className="glass rounded-[2rem] p-6 border-amber-500/20 bg-amber-500/5">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Qu'as-tu accompli aujourd'hui ?</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={activityInput}
            onChange={(e) => setActivityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogActivity()}
            placeholder="Ex: Révisé 2h de droit civil..." 
            className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-amber-500 transition-all text-white"
          />
          <button 
            onClick={handleLogActivity}
            className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
           {activities.slice(0, 3).map((act, i) => (
             <div key={i} className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                <span className="text-[10px] font-black text-amber-500">{act.time}</span>
                <span className="text-[11px] font-medium text-slate-300">{act.text}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Primary Trend Graph */}
      <div className="glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase">Tendance de Maîtrise</h3>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all bg-amber-500 text-slate-950`}>Semaine</button>
          </div>
        </div>
        
        <div className="h-[250px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={masteryData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}}
              />
              <Area type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive Category Cards */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-6 gap-4">
           {categories.map((cat) => (
             <div 
              key={cat.label} 
              className="glass rounded-3xl p-5 border-white/5 text-center group transition-all hover:bg-white/5 hover:scale-105 active:scale-95 cursor-pointer"
              onClick={() => onNavigate(cat.label.toUpperCase() as AppView)}
            >
               <div className={`w-12 h-12 mx-auto rounded-full ${cat.bg} flex items-center justify-center mb-4 group-hover:bg-opacity-40 transition-all`}>
                 <cat.icon className={cat.color} size={20} />
               </div>
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{cat.label}</h4>
               <span className={`text-sm font-black ${cat.color}`}>{cat.value}%</span>
             </div>
           ))}
        </div>

        {/* Urgent Alerts */}
        <div className="md:col-span-1 glass rounded-[2rem] p-8 border-rose-500/20 bg-rose-500/[0.02]">
           <h3 className="font-bold text-rose-500 tracking-tight flex items-center gap-2 uppercase text-xs mb-8">
              <Bell size={16} /> Alertes
           </h3>
           <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-4">
                 <AlertCircle className="text-rose-500 shrink-0" size={16} />
                 <p className="text-[10px] text-slate-400 leading-relaxed">Examen Droit dans <span className="text-white font-bold">5 jours</span>. Régularité : 45%.</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                 <Wallet className="text-amber-500 shrink-0" size={16} />
                 <p className="text-[10px] text-slate-400 leading-relaxed">Renouvellement Bourse AMCI dans <span className="text-white font-bold">12 jours</span>.</p>
              </div>
           </div>
        </div>

        {/* Tasks */}
        <div className="md:col-span-2 glass rounded-[2rem] p-8 border-white/5">
           <div className="flex justify-between items-center mb-8">
             <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-500" /> Objectifs
             </h3>
             <span className="text-[10px] font-bold text-slate-500 uppercase">4 / 6 Complétés</span>
           </div>
           <div className="space-y-3">
              {["Droit Civil", "Séance Sport", "Lecture Bible"].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5">
                  <span className="text-sm font-medium text-slate-100">{task}</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;