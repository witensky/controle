
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Scale, 
  ArrowRight,
  X,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  User,
  GraduationCap,
  Layers,
  Search,
  ChevronRight,
  Target,
  Clock,
  Zap,
  BookOpen,
  Trophy,
  PieChart as PieChartIcon,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Volume2
} from 'lucide-react';
import { LawSubject, LawSubjectStatus } from '../types';

const initialSubjects: LawSubject[] = [
  { id: '1', name: "Droit des Obligations", semester: "S3", professor: "Pr. Benjelloun", status: 'En cours', progress: 75, stressLevel: 'high', chaptersTotal: 12, chaptersDone: 9, examDate: '2024-06-15', ects: 6 },
  { id: '2', name: "Droit Constitutionnel", semester: "S1", professor: "Dr. Alami", status: 'Maîtrisé', progress: 100, stressLevel: 'low', chaptersTotal: 10, chaptersDone: 10, examDate: '2024-01-20', ects: 5 },
  { id: '3', name: "Droit Administratif", semester: "S3", professor: "Mme. Tazi", status: 'En cours', progress: 45, stressLevel: 'medium', chaptersTotal: 8, chaptersDone: 4, examDate: '2024-06-18', ects: 5 },
  { id: '4', name: "Droit Pénal Général", semester: "S2", professor: "Pr. Idrissi", status: 'Révision', progress: 85, stressLevel: 'high', chaptersTotal: 15, chaptersDone: 13, examDate: '2024-06-22', ects: 6 },
];

const Studies: React.FC = () => {
  const [subjects, setSubjects] = useState<LawSubject[]>(initialSubjects);
  const [activeSession, setActiveSession] = useState<LawSubject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LawSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Timer State
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [sessionObjectives, setSessionObjectives] = useState<{id: string, text: string, done: boolean}[]>([]);
  const [newObjective, setNewObjective] = useState('');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = subjects.length;
    const mastered = subjects.filter(s => s.status === 'Maîtrisé').length;
    const avgProgress = total > 0 ? Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / total) : 0;
    const totalEcts = subjects.reduce((acc, s) => acc + (s.ects || 0), 0);
    const chaptersLeft = subjects.reduce((acc, s) => acc + (s.chaptersTotal - s.chaptersDone), 0);
    return { total, mastered, avgProgress, totalEcts, chaptersLeft };
  }, [subjects]);

  const resetForm = () => {
    setFormName(''); setFormSemester('S1'); setFormProf(''); setFormStatus('En cours');
    setFormChaptersTotal(10); setFormChaptersDone(0); setFormStress('medium');
    setFormExamDate(''); setFormEcts(5); setEditingSubject(null);
  };

  const [formName, setFormName] = useState('');
  const [formSemester, setFormSemester] = useState('S1');
  const [formProf, setFormProf] = useState('');
  const [formStatus, setFormStatus] = useState<LawSubjectStatus>('En cours');
  const [formChaptersTotal, setFormChaptersTotal] = useState(10);
  const [formChaptersDone, setFormChaptersDone] = useState(0);
  const [formStress, setFormStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [formExamDate, setFormExamDate] = useState('');
  const [formEcts, setFormEcts] = useState(5);

  const openAddModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (sub: LawSubject) => {
    setFormName(sub.name); setFormSemester(sub.semester); setFormProf(sub.professor || '');
    setFormStatus(sub.status); setFormChaptersTotal(sub.chaptersTotal); setFormChaptersDone(sub.chaptersDone);
    setFormStress(sub.stressLevel); setFormExamDate(sub.examDate || ''); setFormEcts(sub.ects || 5);
    setEditingSubject(sub); setIsModalOpen(true);
  };

  const handleSave = () => {
    const progress = Math.round((formChaptersDone / formChaptersTotal) * 100);
    const newSubject: LawSubject = {
      id: editingSubject ? editingSubject.id : Date.now().toString(),
      name: formName || 'Sans titre', semester: formSemester, professor: formProf, status: formStatus,
      chaptersTotal: formChaptersTotal, chaptersDone: formChaptersDone, progress, stressLevel: formStress,
      examDate: formExamDate, ects: formEcts,
    };
    if (editingSubject) setSubjects(subjects.map(s => s.id === editingSubject.id ? newSubject : s));
    else setSubjects([...subjects, newSubject]);
    setIsModalOpen(false); resetForm();
  };

  const startSession = (sub: LawSubject) => {
    setActiveSession(sub);
    // On pourrait ici récupérer la valeur depuis un contexte de paramètres global
    setTimeLeft(1500); 
    setIsActive(true);
    setSessionObjectives([
      { id: '1', text: `Réviser chapitre ${sub.chaptersDone + 1}`, done: false },
      { id: '2', text: "Faire fiche de synthèse", done: false }
    ]);
  };

  const addTodo = () => {
    if (!newObjective.trim()) return;
    setSessionObjectives([...sessionObjectives, { id: Date.now().toString(), text: newObjective, done: false }]);
    setNewObjective('');
  };

  const toggleTodo = (id: string) => {
    setSessionObjectives(sessionObjectives.map(o => o.id === id ? { ...o, done: !o.done } : o));
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Analytics Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            CURRICULUM <span className="text-amber-500">DROIT</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Architecture de la Réussite Académique</p>
        </div>
        <button 
          onClick={openAddModal}
          className="group flex items-center gap-4 bg-amber-500 text-slate-950 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-amber-500/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Nouveau Module
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-[2rem] p-6 border-white/5 group hover:bg-white/5 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Modules Totaux</p>
          <h3 className="text-3xl font-black text-white">{stats.total}</h3>
        </div>
        <div className="glass rounded-[2rem] p-6 border-white/5 group hover:bg-white/5 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Maîtrise Moyenne</p>
          <h3 className="text-3xl font-black text-emerald-500">{stats.avgProgress}%</h3>
        </div>
        <div className="glass rounded-[2rem] p-6 border-white/5 group hover:bg-white/5 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">ECTS Sécurisés</p>
          <h3 className="text-3xl font-black text-blue-500">{stats.totalEcts}</h3>
        </div>
        <div className="glass rounded-[2rem] p-6 border-white/5 group hover:bg-white/5 transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Chapitres Restants</p>
          <h3 className="text-3xl font-black text-rose-500">{stats.chaptersLeft}</h3>
        </div>
      </div>

      {/* Search Bar - Améliorée avec animation */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
          <Search className="text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une matière dans le curriculum..."
          className="w-full bg-[#020617] border border-white/5 rounded-2xl py-6 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSubjects.map((sub) => (
          <div key={sub.id} className="glass rounded-[2.5rem] p-8 border-white/5 hover:border-amber-500/30 transition-all group flex flex-col h-full shadow-2xl relative overflow-hidden">
            {/* Background Glow on hover */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-slate-800/80 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/5">{sub.semester}</span>
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  sub.status === 'Maîtrisé' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  sub.status === 'Révision' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>{sub.status}</span>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <button onClick={() => openEditModal(sub)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Edit3 size={14} /></button>
                <button onClick={() => { if(window.confirm('Supprimer ce module ?')) setSubjects(subjects.filter(s => s.id !== sub.id)); }} className="p-2.5 bg-white/5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors leading-tight mb-2 tracking-tight uppercase italic">{sub.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{sub.professor}</p>
            </div>

            <div className="mt-auto space-y-5 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">STATION DE MAÎTRISE</p>
                  <span className={`text-2xl font-black ${sub.progress >= 90 ? 'text-emerald-500' : 'text-white'}`}>{sub.progress}%</span>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">CAPACITÉ</p>
                   <span className="text-xs font-bold text-slate-300 italic">{sub.chaptersDone} <span className="text-slate-700">/</span> {sub.chaptersTotal} CHAP.</span>
                </div>
              </div>

              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className={`h-full transition-all duration-1000 relative rounded-full ${sub.progress >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#fbbf24]'}`} 
                  style={{ width: `${sub.progress}%` }} 
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <button 
                onClick={() => startSession(sub)}
                className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group/btn"
              >
                LANCER DEEP FOCUS <ChevronRight size={14} className="inline-block ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal (Simpler and polished) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 flex flex-col max-h-[90vh] shadow-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20" />
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{editingSubject ? 'MODIFIER' : 'NOUVEAU'} <span className="text-amber-500">MODULE</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">NOM DE LA MATIÈRE</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Droit des Contrats..." className="w-full bg-[#020617] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">CHAPITRES TOTAUX</label>
                     <input type="number" value={formChaptersTotal} onChange={(e) => setFormChaptersTotal(Number(e.target.value))} className="w-full bg-[#020617] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">ACQUISITION</label>
                     <input type="number" value={formChaptersDone} onChange={(e) => setFormChaptersDone(Number(e.target.value))} className="w-full bg-[#020617] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white" />
                   </div>
                </div>
              </div>
              <button onClick={handleSave} className="mt-12 py-6 bg-amber-500 text-slate-950 font-black uppercase tracking-[0.4em] text-xs rounded-2xl shadow-2xl shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all">
                ENREGISTRER LES MODIFICATIONS
              </button>
           </div>
        </div>
      )}

      {/* IMMERSIVE SESSION OVERLAY - VERSION CORRIGÉE AVEC TAILLE DE TITRE ADAPTIVE */}
      {activeSession && (
        <div className="fixed inset-0 z-[500] bg-[#020617] backdrop-blur-[120px] flex flex-col animate-in zoom-in-110 duration-500 font-outfit overflow-hidden">
           
           <div className="w-full flex justify-end p-8 md:p-12 absolute top-0 left-0 z-50">
              <button 
                onClick={() => { setActiveSession(null); setIsActive(false); }} 
                className="w-16 h-16 bg-white/5 hover:bg-rose-600/20 hover:text-rose-500 rounded-full transition-all flex items-center justify-center text-slate-400 border border-white/5 active:scale-90"
              >
                <X size={32} strokeWidth={2.5} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-20 py-24 md:py-32 flex flex-col items-center justify-center">
              
              <div className="w-full max-w-6xl space-y-16 md:space-y-24">
                
                <div className="text-center space-y-8 max-w-5xl mx-auto px-4">
                  <div className="inline-flex items-center gap-4 bg-white/5 border border-amber-500/30 px-8 py-3 rounded-full">
                    <span className="text-amber-500 font-black uppercase tracking-[0.5em] text-[10px] sm:text-[12px]">SESSION DE TRAVAIL PROFOND</span>
                  </div>
                  <h2 className={`font-black text-white italic tracking-tighter uppercase leading-[0.9] text-center break-words ${
                    activeSession.name.length > 20 ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-5xl md:text-8xl lg:text-9xl'
                  }`}>
                    {activeSession.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
                   
                   <div className="space-y-6 text-center lg:text-right lg:border-r border-white/10 lg:pr-32">
                      <p className="text-[12px] md:text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] italic">DÉCOMPTE TACTIQUE</p>
                      <div className="text-[100px] md:text-[160px] lg:text-[200px] font-black text-white font-mono tracking-tighter leading-none select-none drop-shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
                        {formatTime(timeLeft)}
                      </div>
                   </div>

                   <div className="space-y-12 text-center lg:text-left">
                      <div className="space-y-6">
                        <p className="text-[12px] md:text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] italic">PROCHAIN OBJECTIF</p>
                        <h3 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tight leading-none">
                          CHAPITRE {activeSession.chaptersDone + 1}
                        </h3>
                        <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Zap size={20} fill="currentColor" />
                          </div>
                          <span className="text-emerald-500 text-base md:text-xl font-black uppercase tracking-widest italic">
                            +150 XP MASTERY POINTS
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 max-w-md mx-auto lg:mx-0">
                        <div className="flex gap-3 mb-6 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                           <input 
                            type="text" value={newObjective} onChange={(e) => setNewObjective(e.target.value)}
                            placeholder="Ajouter une micro-tâche..."
                            className="flex-1 bg-transparent px-5 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-700"
                            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                           />
                           <button onClick={addTodo} className="w-12 h-12 bg-white text-slate-950 rounded-xl flex items-center justify-center hover:bg-amber-500 transition-all active:scale-90">
                             <Plus size={24} strokeWidth={3} />
                           </button>
                        </div>
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-3 custom-scrollbar">
                           {sessionObjectives.map(obj => (
                              <div key={obj.id} onClick={() => toggleTodo(obj.id)} className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${obj.done ? 'bg-emerald-500/10 border-emerald-500/20 opacity-50' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}>
                                 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${obj.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                                   {obj.done && <CheckSquare size={14} className="text-slate-950" strokeWidth={3} />}
                                 </div>
                                 <span className={`text-sm md:text-base font-bold tracking-tight ${obj.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{obj.text}</span>
                              </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 md:gap-10 justify-center pt-8 md:pt-12">
                   <button 
                    onClick={() => setIsActive(!isActive)}
                    className="group px-12 md:px-20 py-6 md:py-8 bg-slate-950/40 text-white font-black uppercase tracking-[0.4em] text-sm md:text-base rounded-[2.5rem] border border-white/10 hover:bg-white hover:text-slate-950 transition-all shadow-2xl flex items-center justify-center gap-5"
                   >
                     {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                     {isActive ? 'PAUSE SESSION' : 'REPRENDRE'}
                   </button>
                   
                   <button 
                    onClick={() => { setActiveSession(null); setIsActive(false); }}
                    className="px-12 md:px-20 py-6 md:py-8 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase tracking-[0.4em] text-sm md:text-base rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(251,191,36,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-5"
                   >
                     <CheckSquare size={24} strokeWidth={3} />
                     TERMINER & LOG
                   </button>
                </div>
              </div>
           </div>
           <div className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
           <div className="absolute bottom-[10%] right-[15%] w-[40vw] h-[40vw] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default Studies;
