
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
  Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
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
    { label: 'Langues', value: stats.languages, color: 'text-orange-500', bg: 'bg-orange-500/20', icon: Zap },
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
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 mr-4">
            <button 
              onClick={() => setTimeFilter('day')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${timeFilter === 'day' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >Jour</button>
            <button 
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${timeFilter === 'week' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
            >Semaine</button>
          </div>
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

      {/* Primary Trend Graph */}
      <div className="glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase">Tendance de Maîtrise</h3>
            <p className="text-xs text-slate-500 font-medium">Évolution de ta discipline and tes résultats</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discipline</span>
             </div>
          </div>
        </div>
        
        <div className="h-[280px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={masteryData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDiscipline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'}}
                itemStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}}
              />
              <Area type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              <Area type="monotone" dataKey="discipline" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDiscipline)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Finance Quickview */}
        <div 
          onClick={() => onNavigate('FINANCE')}
          className="group glass rounded-[2rem] p-8 cursor-pointer hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Solde Actuel AMCI</p>
              <h2 className="text-5xl font-black text-white tracking-tighter">1,000.00 <span className="text-lg text-amber-500 ml-1">DH</span></h2>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="text-amber-500" size={24} />
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
               <span>Limite journalière</span>
               <span className="text-white">250 DH</span>
             </div>
             <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
             </div>
          </div>
        </div>

        {/* Study Focus Distribution */}
        <div className="glass rounded-[2rem] p-8 border-white/5 flex flex-col justify-between group overflow-hidden relative">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Focus Études (Auj.)</h3>
             <Target size={16} className="text-blue-500 group-hover:rotate-45 transition-transform" />
           </div>
           
           <div className="h-40 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={studyDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                 >
                   {studyDistribution.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-2 gap-2 mt-4">
              {studyDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}} />
                   <span className="text-[9px] font-bold text-slate-500 uppercase">{item.name}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Yesterday Mini Heatmap */}
        <div className="glass rounded-[2rem] p-8 border-white/5 group">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Régularité</h3>
             <Zap size={16} className="text-amber-500" />
           </div>
           <div className="flex flex-wrap gap-1.5 mb-6">
              {Array.from({length: 28}).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-md transition-all hover:scale-125 cursor-help ${
                    i > 22 ? 'bg-slate-800/30' : i % 5 === 0 ? 'bg-amber-500' : 'bg-amber-500/40'
                  }`}
                  title={`Jour ${i+1}: Discipline ${i % 5 === 0 ? 'Excellente' : 'Bonne'}`}
                />
              ))}
           </div>
           <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dernière Victoire</p>
              <p className="text-xs font-bold text-white uppercase italic">7 jours de Focus consécutifs</p>
           </div>
        </div>

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
               <div className="flex items-center justify-center gap-1">
                  <span className={`text-sm font-black ${cat.color}`}>{cat.value}%</span>
               </div>
             </div>
           ))}
        </div>

        {/* Tasks and Alerts */}
        <div className="md:col-span-2 glass rounded-[2rem] p-8 border-white/5">
           <div className="flex justify-between items-center mb-8">
             <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-500" />
                Objectifs du Jour
             </h3>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">4 / 6 Complétés</span>
           </div>
           <div className="space-y-4">
              {[
                { task: "Réviser Droit Civil (Contrats)", done: true, tag: "Études" },
                { task: "Séance Sport 45 min", done: true, tag: "Discipline" },
                { task: "Lecture Bible Chap. 4", done: false, tag: "Spirituel" },
                { task: "Apprendre 2 mots d'Anglais", done: true, tag: "Langues" },
              ].map((t, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${t.done ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-950 border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.done ? 'bg-emerald-500 text-slate-950' : 'border-2 border-slate-700 text-transparent'}`}>
                      {t.done && <CheckCircle2 size={14} />}
                    </div>
                    <span className={`text-sm font-medium ${t.done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{t.task}</span>
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${t.done ? 'bg-slate-900 text-slate-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {t.tag}
                  </span>
                </div>
              ))}
           </div>
        </div>

        {/* Urgent Alerts */}
        <div className="glass rounded-[2rem] p-8 border-rose-500/20 bg-rose-500/[0.02]">
           <div className="flex justify-between items-center mb-8">
             <h3 className="font-bold text-rose-500 tracking-tight flex items-center gap-2 uppercase text-xs">
                <Bell size={16} />
                Alertes Urgentes
             </h3>
             <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
           </div>
           <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-4">
                 <AlertCircle className="text-rose-500 shrink-0" size={20} />
                 <div>
                    <h4 className="text-xs font-bold text-white mb-1">Dépassement Budget Journalier</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Tu as dépensé 150 DH de plus que le recommandé aujourd'hui. Resserre la ceinture demain.</p>
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                 <Calendar className="text-amber-500 shrink-0" size={20} />
                 <div>
                    <h4 className="text-xs font-bold text-white mb-1">Examen Droit Administratif</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Prévu dans 5 jours. Ta régularité baisse sur cette matière (Actuellement 45%).</p>
                 </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                 Tout Marquer comme lu <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
