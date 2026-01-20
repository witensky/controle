
import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  PenTool, 
  Heart, 
  Zap,
  ShieldAlert,
  Dumbbell,
  Brain,
  CheckCircle2,
  Activity,
  Plus,
  Trash2,
  ListTodo,
  CalendarDays,
  Target,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Ritual {
  id: number;
  text: string;
  icon: any;
  done: boolean;
  xp: number;
}

interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

const Discipline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rituals' | 'planner'>('planner');
  const [phase, setPhase] = useState<'morning' | 'evening'>('morning');
  const [newTask, setNewTask] = useState('');

  const [morningRituals, setMorningRituals] = useState<Ritual[]>([
    { id: 1, text: "Réveil 06:00 (Zéro Snooze)", icon: Zap, done: true, xp: 50 },
    { id: 2, text: "Prière & Méditation (20 min)", icon: Heart, done: true, xp: 40 },
    { id: 3, text: "Session Sport Haute Intensité", icon: Dumbbell, done: false, xp: 100 },
    { id: 4, text: "Lecture Droit (30 min)", icon: Brain, done: false, xp: 60 },
  ]);

  const [eveningRituals, setEveningRituals] = useState<Ritual[]>([
    { id: 1, text: "Journaling : Analyse Victoires", icon: PenTool, done: false, xp: 30 },
    { id: 2, text: "Lecture Bible & Gratitude", icon: Heart, done: false, xp: 40 },
    { id: 3, text: "Planification Stratégique J+1", icon: Zap, done: false, xp: 50 },
    { id: 4, text: "Zéro Écrans (1h avant sommeil)", icon: Moon, done: false, xp: 60 },
  ]);

  const [dailyTasks, setDailyTasks] = useState<TodoTask[]>([
    { id: '1', text: 'Synthèse Droit des Obligations (Fiches)', completed: false, priority: 'high' },
    { id: '2', text: 'Lecture 10 pages Anglais Juridique', completed: true, priority: 'medium' },
  ]);
  
  const [weeklyTasks, setWeeklyTasks] = useState<TodoTask[]>([
    { id: 'w1', text: 'Préparation Exposé Droit Public', completed: false, priority: 'high' },
    { id: 'w2', text: 'Révisions complètes Semestre 1', completed: false, priority: 'medium' },
  ]);

  const addTask = (target: 'daily' | 'weekly') => {
    if (!newTask.trim()) return;
    const task: TodoTask = { id: Date.now().toString(), text: newTask, completed: false, priority: 'medium' };
    if (target === 'daily') setDailyTasks([...dailyTasks, task]);
    else setWeeklyTasks([...weeklyTasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string, target: 'daily' | 'weekly') => {
    if (target === 'daily') setDailyTasks(dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    else setWeeklyTasks(weeklyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string, target: 'daily' | 'weekly') => {
    if (target === 'daily') setDailyTasks(dailyTasks.filter(t => t.id !== id));
    else setWeeklyTasks(weeklyTasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-10 pb-16 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Switcher Tab - Modern & Glossy */}
      <div className="flex p-1.5 bg-slate-900 border border-white/5 rounded-[2rem] max-w-md mx-auto shadow-2xl">
        <button 
          onClick={() => setActiveTab('rituals')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'rituals' ? 'bg-slate-800 text-white border border-white/10 shadow-lg' : 'text-slate-500'}`}
        >
          <Zap size={16} /> Rituels de Vie
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'planner' ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/30' : 'text-slate-500'}`}
        >
          <ListTodo size={16} /> Mission Planner
        </button>
      </div>

      {activeTab === 'planner' ? (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
          
          {/* Hero Capture Input */}
          <div className="glass rounded-[2.5rem] p-4 border-white/10 flex flex-col md:flex-row gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <input 
              type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
              placeholder="Saisir une nouvelle mission critique..."
              className="flex-1 bg-transparent border-none px-6 py-5 text-base font-bold text-white focus:outline-none placeholder:text-slate-600"
            />
            <div className="flex gap-2">
              <button onClick={() => addTask('daily')} className="px-8 bg-amber-500 text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-amber-500/20">
                <Plus size={18} strokeWidth={3} /> Aujourd'hui
              </button>
              <button onClick={() => addTask('weekly')} className="px-8 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-blue-600/20">
                <CalendarDays size={18} /> Semaine
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* TACTICAL COLUMN (Daily) */}
            <div className="glass rounded-[3rem] p-10 border-amber-500/20 bg-amber-500/[0.01] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                    Tactique <br/><span className="text-amber-500">du Jour</span>
                  </h3>
                </div>
                <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{dailyTasks.filter(t=>t.completed).length}/{dailyTasks.length} Prêt</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {dailyTasks.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-6 bg-slate-950/80 border border-white/5 rounded-[1.8rem] hover:border-amber-500/30 transition-all shadow-xl">
                    <div className="flex items-center gap-6 flex-1">
                      <button 
                        onClick={() => toggleTask(task.id, 'daily')}
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_#10b981]' : 'border-slate-800 hover:border-slate-600'}`}
                      >
                        {task.completed && <CheckCircle2 size={16} className="text-slate-950" strokeWidth={3} />}
                      </button>
                      <span className={`text-base font-bold tracking-tight transition-all ${task.completed ? 'text-slate-600 line-through italic' : 'text-slate-100'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button onClick={() => deleteTask(task.id, 'daily')} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* STRATEGIC COLUMN (Weekly) */}
            <div className="glass rounded-[3rem] p-10 border-blue-500/20 bg-blue-500/[0.01] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg">
                    <Target size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                    Stratégie <br/><span className="text-blue-500">Semaine</span>
                  </h3>
                </div>
                <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{weeklyTasks.filter(t=>t.completed).length}/{weeklyTasks.length} Maîtrisé</span>
                </div>
              </div>

              <div className="space-y-4">
                {weeklyTasks.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-6 bg-slate-950/80 border border-white/5 rounded-[1.8rem] hover:border-blue-500/30 transition-all shadow-xl">
                    <div className="flex items-center gap-6 flex-1">
                      <button 
                        onClick={() => toggleTask(task.id, 'weekly')}
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_#2563eb]' : 'border-slate-800 hover:border-slate-600'}`}
                      >
                        {task.completed && <CheckCircle2 size={16} className="text-white" strokeWidth={3} />}
                      </button>
                      <span className={`text-base font-bold tracking-tight transition-all ${task.completed ? 'text-slate-600 line-through italic' : 'text-slate-100'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button onClick={() => deleteTask(task.id, 'weekly')} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RITUALS VIEW (Enhanced) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-left-8 duration-500">
          <div className="glass rounded-[3rem] p-10 border-white/5">
             <div className="flex items-center gap-6 mb-12">
                <button onClick={() => setPhase('morning')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${phase === 'morning' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-500'}`}>Aube</button>
                <button onClick={() => setPhase('evening')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${phase === 'evening' ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}>Clôture</button>
             </div>
             <div className="space-y-6">
                {(phase === 'morning' ? morningRituals : eveningRituals).map(r => (
                  <div key={r.id} className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${r.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${r.done ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>
                          <r.icon size={24} />
                        </div>
                        <div>
                          <p className={`font-bold ${r.done ? 'text-slate-500 line-through' : 'text-white'}`}>{r.text}</p>
                          <span className="text-[9px] font-black uppercase text-slate-600">+{r.xp} XP</span>
                        </div>
                     </div>
                     <button onClick={() => {}} className={`w-8 h-8 rounded-xl border flex items-center justify-center ${r.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800'}`}>
                       {r.done && <CheckCircle2 size={16} />}
                     </button>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Gamification Sidebar */}
          <div className="space-y-8">
             <div className="glass rounded-[3rem] p-10 border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
                  <div className="h-full bg-amber-500 shadow-[0_0_15px_#fbbf24] transition-all duration-1000" style={{ width: '75%' }} />
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Discipline Score Globally</h4>
                <div className="w-40 h-40 mx-auto rounded-[2.5rem] bg-amber-500 flex items-center justify-center text-5xl font-black text-slate-950 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500 relative z-10">91%</div>
                <p className="mt-12 text-xl font-black text-white italic uppercase tracking-tighter">Grand Maître Stoïque</p>
                <div className="flex justify-center gap-1.5 mt-4">
                  {[1,1,1,1,1,1,0,0].map((v, i) => (
                    <div key={i} className={`h-1 rounded-full ${v ? 'w-8 bg-amber-500' : 'w-4 bg-slate-800'}`} />
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discipline;
