
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
  Clock,
  Tag,
  AlertTriangle,
  Search,
  History,
  Filter,
  ArrowUpRight,
  BookOpen,
  Briefcase
} from 'lucide-react';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type TaskCategory = 'Droit' | 'Sport' | 'Admin' | 'Personnel' | 'Spirituel' | 'Langues';
type TaskStatus = 'Backlog' | 'En cours' | 'Terminé' | 'Bloqué';

interface TodoTask {
  id: string;
  text: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  completedAt?: string;
}

const Discipline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rituals' | 'planner' | 'history'>('planner');
  const [phase, setPhase] = useState<'morning' | 'evening'>('morning');
  
  // States pour le formulaire
  const [taskText, setTaskText] = useState('');
  const [taskCat, setTaskCat] = useState<TaskCategory>('Droit');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);

  const [tasks, setTasks] = useState<TodoTask[]>([
    { id: '1', text: 'Synthèse Droit des Obligations (Fiches)', category: 'Droit', priority: 'high', status: 'En cours', deadline: '2024-10-15' },
    { id: '2', text: 'Lecture 10 pages Anglais Juridique', category: 'Langues', priority: 'medium', status: 'Terminé', deadline: '2024-10-14', completedAt: '2024-10-14' },
    { id: '3', text: 'Préparation Exposé Droit Public', category: 'Droit', priority: 'critical', status: 'Backlog', deadline: '2024-10-18' },
  ]);

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'Terminé'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'Terminé'), [tasks]);

  const addTask = () => {
    if (!taskText.trim()) return;
    const newTask: TodoTask = {
      id: Date.now().toString(),
      text: taskText,
      category: taskCat,
      priority: taskPriority,
      status: 'Backlog',
      deadline: taskDeadline
    };
    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isNowDone = t.status !== 'Terminé';
        return { 
          ...t, 
          status: isNowDone ? 'Terminé' : 'En cours',
          completedAt: isNowDone ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Supprimer cette mission ?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Navigation de la section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            DISCIPLINE <span className="text-amber-500 font-outfit">CORE</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Architecture de l'Exécution Stricte</p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-white/5 rounded-2xl shadow-xl">
          {[
            { id: 'rituals', label: 'Rituels', icon: Zap },
            { id: 'planner', label: 'Planner', icon: ListTodo },
            { id: 'history', label: 'Historique', icon: History }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'planner' && (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
          
          {/* Nouveau Formulaire de Capture de Mission */}
          <div className="glass rounded-[2.5rem] p-8 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic flex items-center gap-2">
              <ArrowUpRight size={14} className="text-amber-500" /> Capture de Mission Tactique
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Intitulé de la mission</label>
                <input 
                  type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)}
                  placeholder="Ex: Révision Droit Pénal..."
                  className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Catégorie</label>
                <select 
                  value={taskCat} onChange={(e) => setTaskCat(e.target.value as TaskCategory)}
                  className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 px-5 text-[10px] font-black text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="Droit">DROIT</option>
                  <option value="Sport">SPORT</option>
                  <option value="Admin">ADMIN</option>
                  <option value="Spirituel">SPIRITUEL</option>
                  <option value="Langues">LANGUES</option>
                  <option value="Personnel">PERSONNEL</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Priorité</label>
                <select 
                  value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 px-5 text-[10px] font-black text-white outline-none"
                >
                  <option value="low">BASSE</option>
                  <option value="medium">NORMALE</option>
                  <option value="high">HAUTE</option>
                  <option value="critical">CRITIQUE</option>
                </select>
              </div>

              <div className="md:col-span-1 space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Échéance</label>
                <input 
                  type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-white outline-none uppercase"
                />
              </div>

              <div className="md:col-span-3 flex items-end">
                <p className="text-[9px] text-slate-500 italic">"L'excellence n'est pas un acte, c'est une habitude de fer."</p>
              </div>

              <button 
                onClick={addTask}
                className="bg-amber-500 text-slate-950 py-4 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} fill="currentColor" /> LANCER LA MISSION
              </button>
            </div>
          </div>

          {/* Liste des Missions Actives */}
          <div className="grid grid-cols-1 gap-6">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
              <Target size={20} className="text-amber-500" /> Missions <span className="text-amber-500">Actives</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTasks.length > 0 ? activeTasks.map(task => (
                <div key={task.id} className="glass rounded-3xl p-6 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between h-full bg-slate-900/40">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-slate-950 border border-white/5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {task.category}
                      </span>
                      <span className={`px-3 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-rose-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-white tracking-tight leading-tight">{task.text}</h4>
                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Échéance : {new Date(task.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className="w-full py-4 bg-[#020617] hover:bg-emerald-500 text-slate-500 hover:text-slate-950 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    <CheckCircle2 size={16} className="group-hover/btn:scale-125 transition-transform" /> TERMINER LA MISSION
                  </button>
                </div>
              )) : (
                <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                   <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">Toutes les missions tactiques sont accomplies.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
              <History size={20} className="text-slate-500" /> Registre des <span className="text-slate-500">Missions Passées</span>
            </h3>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400">
                 <Filter size={14} /> Filtre
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                  <th className="px-6 pb-2">Description</th>
                  <th className="px-6 pb-2">Catégorie</th>
                  <th className="px-6 pb-2">Complété le</th>
                  <th className="px-6 pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {completedTasks.length > 0 ? completedTasks.map(task => (
                  <tr key={task.id} className="group bg-slate-950/60 hover:bg-white/[0.03] transition-all rounded-2xl">
                    <td className="px-6 py-5 rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-slate-300 italic line-through decoration-slate-600">{task.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{task.completedAt ? new Date(task.completedAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5 rounded-r-2xl">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-1.5">
                        <ShieldAlert size={10} /> MAÎTRISÉ
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-700 font-bold uppercase text-[10px] tracking-widest italic">Aucun enregistrement disponible dans le registre.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rituals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-left-8 duration-500">
          <div className="glass rounded-[3rem] p-10 border-white/5">
             <div className="flex items-center gap-6 mb-12">
                <button onClick={() => setPhase('morning')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${phase === 'morning' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-500'}`}>Aube</button>
                <button onClick={() => setPhase('evening')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${phase === 'evening' ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}>Clôture</button>
             </div>
             {/* Rituels Morning/Evening existants conservés */}
             <div className="space-y-6">
                {[
                  { text: phase === 'morning' ? "Réveil 06:00 (Zéro Snooze)" : "Journaling : Analyse Victoires", icon: phase === 'morning' ? Zap : PenTool, xp: 50, done: true },
                  { text: phase === 'morning' ? "Prière & Méditation (20 min)" : "Lecture Bible & Gratitude", icon: Heart, xp: 40, done: true },
                  { text: phase === 'morning' ? "Session Sport Haute Intensité" : "Planification Stratégique J+1", icon: phase === 'morning' ? Dumbbell : Zap, xp: 100, done: false },
                  { text: phase === 'morning' ? "Lecture Droit (30 min)" : "Zéro Écrans (1h avant sommeil)", icon: phase === 'morning' ? Brain : Moon, xp: 60, done: false }
                ].map((r, i) => (
                  <div key={i} className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${r.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${r.done ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-600'}`}>
                          <r.icon size={24} />
                        </div>
                        <div>
                          <p className={`font-bold ${r.done ? 'text-slate-500 line-through' : 'text-white'}`}>{r.text}</p>
                          <span className="text-[9px] font-black uppercase text-slate-600">+{r.xp} XP Points</span>
                        </div>
                     </div>
                     <button className={`w-8 h-8 rounded-xl border flex items-center justify-center ${r.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800'}`}>
                       {r.done && <CheckCircle2 size={16} />}
                     </button>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="space-y-8">
             <div className="glass rounded-[3rem] p-10 border-white/5 text-center relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
                  <div className="h-full bg-amber-500 shadow-[0_0_15px_#fbbf24] transition-all duration-1000" style={{ width: '75%' }} />
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Performance de Discipline Globale</h4>
                <div className="w-40 h-40 mx-auto rounded-[2.5rem] bg-amber-500 flex items-center justify-center text-5xl font-black text-slate-950 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500 relative z-10 border-4 border-slate-950">91%</div>
                <p className="mt-12 text-xl font-black text-white italic uppercase tracking-tighter">Grand Maître Stoïque</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4">Prochain Niveau : Architecte du Destin</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discipline;
