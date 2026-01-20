
import React, { useState, useMemo } from 'react';
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
  PieChart as PieChartIcon
} from 'lucide-react';
import { LawSubject, LawSubjectStatus } from '../types';

const initialSubjects: LawSubject[] = [
  { id: '1', name: "Droit des Obligations", semester: "S3", professor: "Pr. Benjelloun", status: 'En cours', progress: 75, stressLevel: 'high', chaptersTotal: 12, chaptersDone: 9, examDate: '2024-06-15', ects: 6 },
  { id: '2', name: "Droit Constitutionnel", semester: "S1", professor: "Dr. Alami", status: 'Maîtrisé', progress: 100, stressLevel: 'low', chaptersTotal: 10, chaptersDone: 10, examDate: '2024-01-20', ects: 5 },
  { id: '3', name: "Droit Administratif", semester: "S3", professor: "Mme. Tazi", status: 'En cours', progress: 45, stressLevel: 'medium', chaptersTotal: 8, chaptersDone: 4, examDate: '2024-06-18', ects: 5 },
  { id: '4', name: "Droit Pénal Général", semester: "S2", professor: "Pr. Idrissi", status: 'Révision', progress: 85, stressLevel: 'high', chaptersTotal: 15, chaptersDone: 13, examDate: '2024-06-22', ects: 6 },
  { id: '5', name: "Droit Commercial", semester: "S4", professor: "Dr. Mansouri", status: 'A débutER', progress: 0, stressLevel: 'medium', chaptersTotal: 10, chaptersDone: 0, examDate: '2024-07-05', ects: 4 },
  { id: '6', name: "Droit International Public", semester: "S4", professor: "Pr. Filali", status: 'A débutER', progress: 10, stressLevel: 'low', chaptersTotal: 12, chaptersDone: 1, examDate: '2024-07-10', ects: 5 },
  { id: '7', name: "Droit de la Famille", semester: "S2", professor: "Mme. Bennani", status: 'Maîtrisé', progress: 95, stressLevel: 'low', chaptersTotal: 8, chaptersDone: 8, examDate: '2024-01-25', ects: 4 },
  { id: '8', name: "Droit du Travail", semester: "S5", professor: "Dr. Amrani", status: 'En cours', progress: 30, stressLevel: 'medium', chaptersTotal: 14, chaptersDone: 4, examDate: '2024-08-15', ects: 5 },
  { id: '9', name: "Procédure Civile", semester: "S5", professor: "Pr. Chraibi", status: 'A débutER', progress: 5, stressLevel: 'high', chaptersTotal: 20, chaptersDone: 1, examDate: '2024-08-20', ects: 6 },
  { id: '10', name: "Droit Fiscal", semester: "S4", professor: "Dr. Zahiri", status: 'En cours', progress: 55, stressLevel: 'medium', chaptersTotal: 10, chaptersDone: 6, examDate: '2024-07-12', ects: 4 },
];

const Studies: React.FC = () => {
  const [subjects, setSubjects] = useState<LawSubject[]>(initialSubjects);
  const [activeSession, setActiveSession] = useState<LawSubject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LawSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formSemester, setFormSemester] = useState('S1');
  const [formProf, setFormProf] = useState('');
  const [formStatus, setFormStatus] = useState<LawSubjectStatus>('En cours');
  const [formChaptersTotal, setFormChaptersTotal] = useState(10);
  const [formChaptersDone, setFormChaptersDone] = useState(0);
  const [formStress, setFormStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [formExamDate, setFormExamDate] = useState('');
  const [formEcts, setFormEcts] = useState(5);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = subjects.length;
    const mastered = subjects.filter(s => s.status === 'Maîtrisé').length;
    const avgProgress = Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / total);
    const totalEcts = subjects.reduce((acc, s) => acc + (s.ects || 0), 0);
    const chaptersLeft = subjects.reduce((acc, s) => acc + (s.chaptersTotal - s.chaptersDone), 0);
    
    return { total, mastered, avgProgress, totalEcts, chaptersLeft };
  }, [subjects]);

  const resetForm = () => {
    setFormName(''); setFormSemester('S1'); setFormProf(''); setFormStatus('En cours');
    setFormChaptersTotal(10); setFormChaptersDone(0); setFormStress('medium');
    setFormExamDate(''); setFormEcts(5); setEditingSubject(null);
  };

  const openAddModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (sub: LawSubject) => {
    setEditingSubject(sub);
    setFormName(sub.name); setFormSemester(sub.semester); setFormProf(sub.professor || '');
    setFormStatus(sub.status); setFormChaptersTotal(sub.chaptersTotal);
    setFormChaptersDone(sub.chaptersDone); setFormStress(sub.stressLevel);
    setFormExamDate(sub.examDate || ''); setFormEcts(sub.ects || 5);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const progress = Math.round((formChaptersDone / formChaptersTotal) * 100);
    const newSubject: LawSubject = {
      id: editingSubject ? editingSubject.id : Date.now().toString(),
      name: formName || 'Sans titre',
      semester: formSemester, professor: formProf, status: formStatus,
      chaptersTotal: formChaptersTotal, chaptersDone: formChaptersDone,
      progress, stressLevel: formStress, examDate: formExamDate, ects: formEcts,
    };
    if (editingSubject) setSubjects(subjects.map(s => s.id === editingSubject.id ? newSubject : s));
    else setSubjects([...subjects, newSubject]);
    setIsModalOpen(false); resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer ce cours ?')) setSubjects(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Dynamic Header */}
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
          <Plus size={20} strokeWidth={3} />
          Nouveau Module
        </button>
      </div>

      {/* Analytics Dashboard - TOP SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500 group-hover:scale-110 transition-transform">
            <BookOpen size={48} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Modules</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-white">{stats.total}</h3>
            <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Cours</span>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform">
            <Trophy size={48} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Maîtrise Globale</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-emerald-500">{stats.avgProgress}%</h3>
            <div className="w-12 h-1 bg-slate-800 rounded-full mb-2.5 overflow-hidden">
               <div className="bg-emerald-500 h-full" style={{ width: `${stats.avgProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500 group-hover:scale-110 transition-transform">
            <GraduationCap size={48} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total ECTS</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-blue-500">{stats.totalEcts}</h3>
            <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Crédits</span>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-500 group-hover:scale-110 transition-transform">
            <Target size={48} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Charge Restante</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-rose-500">{stats.chaptersLeft}</h3>
            <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Chapitres</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher dans le curriculum..."
          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Grid of Mastery Cards - BOTTOM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSubjects.map((sub) => (
          <div key={sub.id} className="relative group">
            <div className="glass rounded-[2.5rem] p-8 border-white/5 hover:border-amber-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl overflow-hidden">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/5 flex items-center gap-1.5">
                    <Layers size={10} /> {sub.semester}
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    sub.status === 'Maîtrisé' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    sub.status === 'Révision' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {sub.status}
                  </div>
                </div>
                
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(sub)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-2.5 bg-white/5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Subject Title */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors leading-tight mb-3 tracking-tight uppercase italic">
                  {sub.name}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <User size={12} className="text-amber-500" /> {sub.professor}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <GraduationCap size={12} className="text-blue-500" /> {sub.ects} ECTS
                  </div>
                </div>
              </div>

              {/* Progress Visualizer */}
              <div className="mt-auto space-y-5">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">MAÎTRISE</p>
                     <span className={`text-2xl font-black ${sub.progress >= 90 ? 'text-emerald-500' : 'text-white'}`}>{sub.progress}%</span>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">CAPACITÉ</p>
                     <span className="text-xs font-bold text-slate-300 italic">{sub.chaptersDone} <span className="text-slate-600">/</span> {sub.chaptersTotal} chap.</span>
                   </div>
                </div>
                
                <div className="h-2 w-full bg-slate-950/50 rounded-full border border-white/5 p-[1px]">
                   <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                      sub.progress >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.progress}%` }}
                   >
                     <div className="absolute inset-0 bg-white/10 blur-[1px] rounded-full" />
                   </div>
                </div>

                <button 
                  onClick={() => setActiveSession(sub)}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-2 group/btn"
                >
                  DEEP STUDY SESSION <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <button 
          onClick={openAddModal}
          className="border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 text-slate-600 group-hover:scale-110 group-hover:text-amber-500 transition-all shadow-xl">
            <Plus size={32} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Enregistrer une nouvelle matière</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {editingSubject ? 'MODIFIER' : 'NOUVEAU'} <span className="text-amber-500">MODULE</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Dénomination du cours</label>
                <div className="grid grid-cols-3 gap-4">
                  <input 
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="Intitulé..."
                    className="col-span-2 bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
                  />
                  <select 
                    value={formSemester} onChange={(e) => setFormSemester(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-black text-white focus:border-amber-500 outline-none"
                  >
                    {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'M1', 'M2'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Chargé de cours</label>
                  <input 
                    type="text" value={formProf} onChange={(e) => setFormProf(e.target.value)}
                    placeholder="Pr. Nom..."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">ECTS / Coeff</label>
                  <input 
                    type="number" value={formEcts} onChange={(e) => setFormEcts(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-slate-950 rounded-3xl border border-white/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Chapitres Totaux</label>
                  <input 
                    type="number" value={formChaptersTotal} onChange={(e) => setFormChaptersTotal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm font-bold text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Acquis</label>
                  <input 
                    type="number" value={formChaptersDone} onChange={(e) => setFormChaptersDone(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm font-bold text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Planification & État</label>
                <div className="grid grid-cols-2 gap-6">
                  <select 
                    value={formStatus} onChange={(e) => setFormStatus(e.target.value as LawSubjectStatus)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white"
                  >
                    <option value="A débutER">A DÉBUTER</option>
                    <option value="En cours">EN COURS</option>
                    <option value="Révision">RÉVISION</option>
                    <option value="Maîtrisé">MAÎTRISÉ</option>
                  </select>
                  <input 
                    type="date" value={formExamDate} onChange={(e) => setFormExamDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex gap-4 relative z-10">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">ANNULER</button>
              <button onClick={handleSave} className="flex-[2] bg-amber-500 text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-2xl shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                ENREGISTRER LE MODULE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Session Overlay */}
      {activeSession && (
        <div className="fixed inset-0 z-[200] bg-slate-950 backdrop-blur-[60px] flex items-center justify-center p-6 animate-in zoom-in-110 duration-700">
           <div className="w-full max-w-4xl text-center space-y-16 relative z-10">
              <button onClick={() => setActiveSession(null)} className="absolute -top-12 right-0 p-5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-full transition-all text-slate-500">
                <X size={32} />
              </button>
              
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-6 py-2.5 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">MODE DEEP WORK</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">{activeSession.name}</h2>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32">
                 <div className="space-y-4 text-center">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">TEMPS RESTANT</p>
                    <div className="text-9xl font-black text-white font-mono tracking-tighter shadow-glow">25:00</div>
                 </div>
                 <div className="hidden md:block w-px h-32 bg-white/10" />
                 <div className="space-y-6 text-left">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">PROCHAIN OBJECTIF</p>
                      <p className="text-3xl font-black text-white uppercase italic">Chapitre {activeSession.chaptersDone + 1}</p>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-500 text-sm font-black uppercase tracking-widest">
                      <Zap size={18} fill="currentColor" /> +150 XP Mastery Points
                    </div>
                 </div>
              </div>

              <div className="flex gap-8 justify-center pt-8">
                 <button className="px-14 py-7 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl border border-white/5 hover:bg-white hover:text-slate-950 transition-all shadow-2xl">
                   PAUSE SÉANCE
                 </button>
                 <button 
                  onClick={() => setActiveSession(null)}
                  className="px-14 py-7 bg-amber-500 text-slate-950 font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                 >
                   TERMINER & LOG
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Studies;
