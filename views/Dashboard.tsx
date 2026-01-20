
import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  Wallet,
  FileBarChart,
  Target,
  Zap,
  Plus,
  LayoutList,
  Radar,
  Activity,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarArea,
  ResponsiveContainer
} from 'recharts';
import { AppView } from '../types';
import Reports from './Reports';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

interface DashboardTask {
  id: string;
  text: string;
  completed: boolean;
}

const focusData = [
  { subject: 'Finance', value: 80 }, { subject: 'Droit', value: 95 },
  { subject: 'Sport', value: 70 }, { subject: 'Langues', value: 50 },
  { subject: 'Bible', value: 85 }, { subject: 'Mental', value: 60 },
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
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
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

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Lundi 14 Octobre 2024</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight italic uppercase leading-none">Command <span className="text-amber-500">Center</span></h1>
        </div>
        <button onClick={() => onNavigate('REPORTS')} className="bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
          <FileBarChart size={18} /> Rapports Complets
        </button>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.label} onClick={() => onNavigate(cat.label.toUpperCase() as AppView)} className="glass rounded-[1.5rem] p-5 border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all relative group overflow-hidden">
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 blur-3xl rounded-full group-hover:bg-amber-500/5 transition-all" />
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

        <div onClick={() => onNavigate('FINANCE')} className="glass rounded-[1.5rem] p-5 border-emerald-500/20 bg-emerald-500/[0.03] shadow-xl flex items-center gap-4 cursor-pointer hover:bg-emerald-500/[0.06] transition-all">
          <LiquidPurse percentage={budgetPercentage} />
          <div className="flex-1">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Reste à Vivre</p>
            <h4 className="text-xl font-black text-white italic tracking-tighter leading-none mb-2">
              {remaining.toLocaleString()} <span className="text-[10px] text-emerald-400 not-italic">DH</span>
            </h4>
            <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_12px_#10b981]" style={{ width: `${budgetPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* CORE ANALYTICS ENGINE (The 6 Graphs Integrated) */}
      <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-inner"><TrendingUp size={24} /></div>
              <div>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">ANALYTIQUE SYSTÈME</h3>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Flux de performance unifiés • J&B Kernel v3.2</p>
              </div>
          </div>
          <div className="animate-in fade-in duration-1000">
             <Reports />
          </div>
      </div>

      {/* Controls & Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-[#0f172a]/60 shadow-2xl h-[350px]">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2 italic">
            <Radar size={16} className="text-blue-500" /> Focus Area Matrix
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <RadarChart data={focusData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 9, fontWeight: '900'}} />
              <RadarArea name="Niveau" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 bg-slate-900/20 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-white uppercase text-[10px] italic flex items-center gap-4">
              <LayoutList size={20} className="text-amber-500" /> Mission Control Center
            </h3>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{taskProgress}% ACCOMPLI</span>
              <div className="w-32 h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 shadow-[0_0_12px_#fbbf24]" style={{ width: `${taskProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mb-8 p-2 bg-slate-950 rounded-2xl border border-white/10 shadow-inner">
            <input 
              type="text" value={quickTaskInput} onChange={(e) => setQuickTaskInput(e.target.value)}
              placeholder="Saisir une nouvelle mission tactique..." className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-white outline-none placeholder:text-slate-800 font-bold"
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuickTask()}
            />
            <button onClick={handleAddQuickTask} className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center hover:bg-amber-500 transition-all active:scale-90"><Plus size={20} strokeWidth={3} /></button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-3 custom-scrollbar">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTask(t.id)} className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${t.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_#10b981]' : 'border-slate-800 hover:border-slate-600'}`}>
                    {t.completed && <CheckCircle2 size={14} className="text-slate-950" strokeWidth={3} />}
                  </button>
                  <span className={`text-[13px] font-bold ${t.completed ? 'text-slate-600 line-through italic' : 'text-slate-200'}`}>{t.text}</span>
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
