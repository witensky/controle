
import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Bell,
  Target,
  Zap,
  Send,
  Wallet,
  FileBarChart,
  ArrowLeft,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  LayoutList,
  Radar,
  BarChart as BarChartIcon,
  Activity,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarArea,
  LineChart, Line
} from 'recharts';
import { AppView, UserStats } from '../types';
import Reports from './Reports';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

interface DashboardTask {
  id: string;
  text: string;
  completed: boolean;
}

const masteryData = [
  { day: 'Lun', score: 65 }, { day: 'Mar', score: 72 }, { day: 'Mer', score: 85 },
  { day: 'Jeu', score: 78 }, { day: 'Ven', score: 90 }, { day: 'Sam', score: 95 }, { day: 'Dim', score: 91 },
];

const focusData = [
  { subject: 'Finance', value: 80 }, { subject: 'Droit', value: 95 },
  { subject: 'Sport', value: 70 }, { subject: 'Langues', value: 50 },
  { subject: 'Bible', value: 85 }, { subject: 'Mental', value: 60 },
];

const energyData = [
  { time: '06h', level: 95 }, { time: '09h', level: 85 }, { time: '12h', level: 60 },
  { time: '15h', level: 75 }, { time: '18h', level: 90 }, { time: '21h', level: 50 },
];

const workIntensityData = [
  { name: 'Oblig.', hours: 12 }, { name: 'Admin.', hours: 8 },
  { name: 'Const.', hours: 10 }, { name: 'Pénal', hours: 6 },
];

const LiquidPurse: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div className="relative w-12 h-16 bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden shadow-inner shrink-0">
      <div 
        className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out bg-emerald-500/50"
        style={{ height: `${percentage}%` }}
      >
        <div className="absolute -top-3 left-0 w-[200%] h-6 bg-emerald-400/30 animate-wave opacity-50" 
             style={{ animation: 'wave 3s infinite linear' }} />
      </div>
      <div className="absolute top-1.5 left-1.5 w-0.5 h-4 bg-white/10 rounded-full blur-[0.5px]" />
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [showReports, setShowReports] = useState(false);
  const [quickTaskInput, setQuickTaskInput] = useState('');
  
  const [tasks, setTasks] = useState<DashboardTask[]>([
    { id: '1', text: "Synthèse Droit des Obligations", completed: false },
    { id: '2', text: "Séance Sport Push Day", completed: true },
    { id: '3', text: "Lecture Bible Matthieu 5", completed: false },
  ]);

  const totalBudget = 3500;
  const remaining = 1070;
  const budgetPercentage = Math.round((remaining / totalBudget) * 100);

  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  const handleAddQuickTask = () => {
    if (!quickTaskInput.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: quickTaskInput, completed: false }]);
    setQuickTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const categories = [
    { label: 'Finance', value: 82, color: 'text-amber-500', bg: 'bg-amber-500/20', icon: Wallet },
    { label: 'Études', value: 65, color: 'text-blue-500', bg: 'bg-blue-500/20', icon: Target },
    { label: 'Discipline', value: 91, valueLabel: `${pendingTasksCount} Tâches`, color: 'text-emerald-500', bg: 'bg-emerald-500/20', icon: Zap, badge: pendingTasksCount },
  ];

  if (showReports) return <Reports />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Lundi 14 Octobre 2024</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight italic uppercase leading-none">Command <span className="text-amber-500">Center</span></h1>
        </div>
        <button onClick={() => setShowReports(true)} className="bg-amber-500 text-slate-950 px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20">
          <FileBarChart size={18} /> Rapports Détaillés
        </button>
      </div>

      {/* Main Grid: Status + Finance Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.label} onClick={() => onNavigate(cat.label.toUpperCase() as AppView)} className="glass rounded-[1.5rem] p-5 border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all relative group overflow-hidden">
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all" />
              {cat.badge !== undefined && cat.badge > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-pulse">{cat.badge}</div>
              )}
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{cat.label}</p>
                <h4 className={`text-xl font-black ${cat.color} italic tracking-tighter`}>{cat.valueLabel || `${cat.value}%`}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color}`}><cat.icon size={20} /></div>
            </div>
          ))}
        </div>

        {/* REMAINING BUDGET WIDGET - Styled for Dashboard */}
        <div onClick={() => onNavigate('FINANCE')} className="glass rounded-[1.5rem] p-5 border-emerald-500/20 bg-emerald-500/[0.03] shadow-xl flex items-center gap-4 cursor-pointer hover:bg-emerald-500/[0.06] transition-all">
          <LiquidPurse percentage={budgetPercentage} />
          <div className="flex-1">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Reste à Vivre</p>
            <h4 className="text-xl font-black text-white italic tracking-tighter leading-none mb-2">
              {remaining.toLocaleString()} <span className="text-[10px] text-emerald-400 not-italic">DH</span>
            </h4>
            <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${budgetPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[2rem] p-7 border-white/5 bg-[#0f172a]/60 shadow-xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 italic">
            <Radar size={14} className="text-blue-500" /> Focus Area Matrix
          </h3>
          <div className="h-[180px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={focusData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 8, fontWeight: '900'}} />
                <RadarArea name="Niveau" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-7 border-white/5 bg-[#0f172a]/60 shadow-xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 italic">
            <Activity size={14} className="text-emerald-500" /> Courbe d'Énergie
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyData}>
                <XAxis dataKey="time" axisLine={false} tick={{fill: '#475569', fontSize: 8}} />
                <Line type="step" dataKey="level" stroke="#10b981" strokeWidth={3} dot={{r: 3, fill: '#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-7 border-white/5 bg-[#0f172a]/60 shadow-xl">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 italic">
            <BarChartIcon size={14} className="text-rose-500" /> Intensité de Travail
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workIntensityData}>
                <XAxis dataKey="name" axisLine={false} tick={{fill: '#475569', fontSize: 8, fontWeight: '700'}} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={15}>
                  {workIntensityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f43f5e' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Primary Mastery Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 italic">
            <TrendingUp size={16} className="text-amber-500" /> Tendance de Maîtrise
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={masteryData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <Area type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={4} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mission Control Widget */}
        <div className="glass rounded-[2rem] p-8 border-white/5 bg-slate-900/20 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-white uppercase text-[10px] italic flex items-center gap-3">
              <LayoutList size={18} className="text-amber-500" /> Mission Control
            </h3>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{taskProgress}% ACCOMPLI</span>
              <div className="w-24 h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-amber-500 shadow-[0_0_8px_#fbbf24]" style={{ width: `${taskProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-6 p-2 bg-slate-950/50 rounded-xl border border-white/5">
            <input 
              type="text" value={quickTaskInput} onChange={(e) => setQuickTaskInput(e.target.value)}
              placeholder="Mission tactique..." className="flex-1 bg-transparent border-none px-3 py-1 text-xs text-white outline-none placeholder:text-slate-700 font-bold"
            />
            <button onClick={handleAddQuickTask} className="w-8 h-8 bg-white text-slate-950 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-all"><Plus size={16} /></button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-950 border border-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(t.id)} className={`w-4 h-4 rounded border-2 transition-all ${t.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_#10b981]' : 'border-slate-800'}`}>
                    {t.completed && <CheckCircle2 size={10} className="text-slate-950" />}
                  </button>
                  <span className={`text-[11px] font-bold ${t.completed ? 'text-slate-600 line-through italic' : 'text-slate-200'}`}>{t.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
