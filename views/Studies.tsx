
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, X, Plus, Trash2, Edit3, Zap, Loader2, Search, Calendar, User, Award, BookOpen, Target, Brain, ArrowRight, ShieldCheck, ChevronRight, AlertCircle, GraduationCap, Layers
} from 'lucide-react';
import { LawSubject, LawSubjectStatus } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const Studies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<LawSubject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LawSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{ subject: LawSubject, questions: QuizQuestion[] } | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSemester, setFormSemester] = useState('S1');
  const [formProf, setFormProf] = useState('');
  const [formStatus, setFormStatus] = useState<LawSubjectStatus>('En cours');
  const [formChaptersTotal, setFormChaptersTotal] = useState(10);
  const [formChaptersDone, setFormChaptersDone] = useState(0);
  const [formExamDate, setFormExamDate] = useState('');
  const [formEcts, setFormEcts] = useState(5);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) handleSupabaseError(error, 'fetchSubjects');
      else setSubjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formName) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const total = Math.max(1, Number(formChaptersTotal));
      const done = Math.max(0, Number(formChaptersDone));
      const progress = Math.min(100, Math.round((done / total) * 100));
      const stressLevel = progress < 30 ? 'high' : progress < 70 ? 'medium' : 'low';

      const payload = {
        user_id: user.id,
        name: formName,
        semester: formSemester,
        professor: formProf || null,
        status: formStatus,
        chaptersTotal: total,
        chaptersDone: done,
        examDate: formExamDate || null,
        ects: Number(formEcts) || 5,
        notes: formNotes || null,
        progress: progress,
        stressLevel: stressLevel
      };

      let result;
      if (editingSubject) {
        result = await supabase.from('study_subjects').update(payload).eq('id', editingSubject.id);
      } else {
        result = await supabase.from('study_subjects').insert([payload]);
      }

      if (result.error) throw result.error;

      await fetchSubjects();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Supabase Save Error:", err);
      alert(`Erreur technique : ${err.message || 'Problème de structure de données.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const startQuiz = async (subject: LawSubject) => {
    setIsQuizLoading(true);
    setActiveQuiz(null);
    setCurrentQuestionIdx(0);
    setQuizAnswered(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const prompt = `Génère un quiz QCM de 3 questions pour : "${subject.name}".
      Notes : "${subject.notes || 'Théorie générale'}".
      Réponds en JSON uniquement :
      [
        {
          "question": "Énoncé",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "Pourquoi."
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const questions = JSON.parse(response.text || "[]");
      setActiveQuiz({ subject, questions });
    } catch (err) {
      alert("Erreur de l'IA.");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormSemester('S1'); setFormProf(''); setFormStatus('En cours');
    setFormChaptersTotal(10); setFormChaptersDone(0); setFormExamDate(''); 
    setFormEcts(5); setFormNotes(''); setEditingSubject(null);
  };

  const openEditModal = (sub: LawSubject) => {
    setEditingSubject(sub);
    setFormName(sub.name); setFormSemester(sub.semester); setFormProf(sub.professor || '');
    setFormStatus(sub.status); setFormChaptersTotal(sub.chaptersTotal); 
    setFormChaptersDone(sub.chaptersDone); setFormExamDate(sub.examDate || '');
    setFormEcts(sub.ects || 5); setFormNotes(sub.notes || '');
    setIsModalOpen(true);
  };

  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter">CURRICULUM <span className="text-amber-500">DROIT</span></h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Architecture de Maîtrise Académique</p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">
          AJOUTER MODULE
        </button>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
           <Scale size={64} className="mx-auto text-slate-800 mb-6" />
           <p className="text-xl font-black text-slate-600 uppercase italic tracking-widest">Aucun module scellé dans le curriculum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="glass rounded-[2.5rem] p-8 border-white/5 bg-[#0f172a]/40 shadow-xl flex flex-col group min-h-[380px] relative overflow-hidden transition-all hover:border-amber-500/20">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
                 <Scale size={180} />
              </div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <span className="px-4 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-[9px] font-black text-amber-500 uppercase tracking-widest italic">{sub.semester}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEditModal(sub)} className="p-3 bg-white/5 rounded-xl hover:text-amber-500 transition-colors"><Edit3 size={16} /></button>
                  <button onClick={async () => { if(confirm('Supprimer définitivement ce module ?')) { await supabase.from('study_subjects').delete().eq('id', sub.id); fetchSubjects(); } }} className="p-3 bg-white/5 rounded-xl hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              <h3 className="text-3xl font-black text-white uppercase italic mb-2 relative z-10 tracking-tight leading-none">{sub.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 relative z-10">{sub.professor || 'Professeur non spécifié'}</p>
              
              <div className="space-y-6 mb-10 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-white italic tracking-tighter">{sub.progress}</span>
                     <span className="text-sm font-black text-amber-500 uppercase italic">%</span>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Vecteur d'avancement</p>
                     <p className="text-xs font-black text-white uppercase italic">{sub.chaptersDone} / {sub.chaptersTotal} Chapitres</p>
                  </div>
                </div>

                <div className="relative h-6 bg-slate-950 rounded-full border border-white/10 p-1 shadow-inner overflow-hidden group/bar">
                  <div className="absolute inset-0 flex justify-between px-4 pointer-events-none z-20">
                    <div className="w-px h-full bg-white/10" />
                    <div className="w-px h-full bg-white/10" />
                    <div className="w-px h-full bg-white/10" />
                  </div>
                  
                  <div 
                     className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 h-full rounded-full transition-all duration-1000 relative shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-pulse-glow" 
                     style={{ width: `${sub.progress}%` }}
                  >
                     <div className="absolute top-0 right-0 w-2 h-full bg-white/40 blur-[2px] rounded-full" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <AlertCircle size={12} className={sub.stressLevel === 'high' ? 'text-rose-500' : sub.stressLevel === 'medium' ? 'text-amber-500' : 'text-emerald-500'} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                         Niveau de Risque : <span className={sub.stressLevel === 'high' ? 'text-rose-500' : sub.stressLevel === 'medium' ? 'text-amber-500' : 'text-emerald-500'}>{sub.stressLevel === 'high' ? 'CRITIQUE' : sub.stressLevel === 'medium' ? 'MOYEN' : 'MAÎTRISÉ'}</span>
                      </span>
                   </div>
                   {sub.ects && <span className="text-[9px] font-black text-slate-600 italic">{sub.ects} ECTS</span>}
                </div>
              </div>

              <button 
                onClick={() => startQuiz(sub)}
                disabled={isQuizLoading}
                className="mt-auto w-full py-5 bg-blue-500/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20 flex items-center justify-center gap-3 group shadow-xl hover:shadow-blue-600/20"
              >
                {isQuizLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={18} className="group-hover:animate-bounce" />}
                Défier le Noyau (Quiz IA)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* QUIZ MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">INTERROGATION TACTIQUE</h4>
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2 italic">{activeQuiz.subject.name}</p>
                 </div>
                 <button onClick={() => setActiveQuiz(null)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all active:scale-90"><X size={24} /></button>
              </div>
              
              <div className="space-y-10">
                 <div className="bg-slate-950/80 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <p className="text-2xl font-bold text-white italic leading-relaxed font-serif">"{activeQuiz.questions[currentQuestionIdx].question}"</p>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {activeQuiz.questions[currentQuestionIdx].options.map((opt, i) => (
                      <button 
                        key={i} 
                        disabled={quizAnswered !== null}
                        onClick={() => setQuizAnswered(i)}
                        className={`p-6 rounded-[1.8rem] border text-left text-sm font-bold transition-all flex items-center gap-5 ${
                          quizAnswered === null ? 'bg-slate-950/50 border-white/5 hover:border-amber-500/40 hover:bg-slate-900' :
                          i === activeQuiz.questions[currentQuestionIdx].correctIndex ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5' :
                          quizAnswered === i ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-950 opacity-40'
                        }`}
                      >
                         <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black ${quizAnswered === i ? 'border-current' : 'border-slate-800 text-slate-600'}`}>{String.fromCharCode(65 + i)}</span>
                         {opt}
                      </button>
                    ))}
                 </div>
                 {quizAnswered !== null && (
                   <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] animate-in slide-in-from-top-6">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 italic">EXPLICATION TACTIQUE</p>
                      <p className="text-sm text-slate-300 italic font-medium leading-relaxed font-serif">"{activeQuiz.questions[currentQuestionIdx].explanation}"</p>
                      <button 
                        onClick={() => {
                          if (currentQuestionIdx < 2) { setCurrentQuestionIdx(prev => prev + 1); setQuizAnswered(null); }
                          else { setActiveQuiz(null); }
                        }}
                        className="mt-8 w-full py-6 bg-white text-slate-950 rounded-3xl text-xs font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                      >
                        {currentQuestionIdx < 2 ? 'PASSER À LA SUIVANTE' : 'TERMINER LA MISSION'}
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
           <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] my-12">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">NOUVELLE <span className="text-amber-500">UNITÉ D'ÉTUDE</span></h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-3 space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">INTITULÉ DE LA MATIÈRE</label>
                     <div className="relative">
                        <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Droit Constitutionnel, Obligations..." className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all uppercase tracking-widest shadow-inner" />
                        <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">SEMESTRE</label>
                     <select value={formSemester} onChange={e => setFormSemester(e.target.value)} className="w-full h-[60px] bg-[#020617] border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white outline-none focus:border-amber-500/40 uppercase tracking-widest">
                        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'MASTER 1', 'MASTER 2'].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-3 space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">TITULAIRE DU COURS (PROFESSEUR)</label>
                     <div className="relative">
                        <input type="text" value={formProf} onChange={e => setFormProf(e.target.value)} placeholder="Pr. Nom de famille..." className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all uppercase tracking-widest shadow-inner" />
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">VOLUME ECTS</label>
                     <div className="relative">
                        <input type="number" value={formEcts} onChange={e => setFormEcts(Number(e.target.value))} className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold text-white outline-none focus:border-amber-500/50" />
                        <Award className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">ARCHITECTURE DU MODULE (CHAPITRES)</label>
                     <div className="flex gap-4 p-2 bg-[#020617] border border-white/10 rounded-2xl">
                        <div className="flex-1 flex items-center gap-3 px-4">
                           <Layers size={14} className="text-slate-800" />
                           <input type="number" value={formChaptersDone} onChange={e => setFormChaptersDone(Number(e.target.value))} className="w-full bg-transparent text-sm font-bold text-white outline-none" placeholder="Maîtrisés" />
                        </div>
                        <span className="flex items-center text-slate-800 font-black">/</span>
                        <div className="flex-1 px-4">
                           <input type="number" value={formChaptersTotal} onChange={e => setFormChaptersTotal(Number(e.target.value))} className="w-full bg-transparent text-sm font-bold text-white outline-none" placeholder="Total" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">DÉPLOIEMENT TACTIQUE</label>
                     <select value={formStatus} onChange={e => setFormStatus(e.target.value as LawSubjectStatus)} className="w-full h-[60px] bg-[#020617] border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white outline-none focus:border-amber-500/40 uppercase tracking-widest">
                        {['En cours', 'Terminé', 'En attente', 'Échec', 'Rattrapage'].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">ÉCHÉANCE EXAMEN</label>
                     <div className="relative">
                        <input type="date" value={formExamDate} onChange={e => setFormExamDate(e.target.value)} className="w-full h-[60px] bg-[#020617] border border-white/10 rounded-2xl px-14 text-[11px] font-black text-white outline-none uppercase" />
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3 italic">ARCHIVES TACTIQUES & NOTES DE RÉVISION</label>
                   <textarea 
                      value={formNotes} 
                      onChange={(e) => setFormNotes(e.target.value)} 
                      placeholder="Saisissez les principes fondamentaux, points de doctrine et jurisprudence clé..."
                      className="w-full h-64 bg-[#020617] border border-white/10 rounded-[1.5rem] p-6 text-sm text-slate-200 outline-none focus:border-amber-500/30 transition-all resize-none font-serif italic shadow-inner"
                   />
                </div>

                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={handleSave} disabled={isSaving || !formName} className="w-full py-8 bg-amber-500 text-slate-950 font-black uppercase rounded-[2rem] shadow-3xl hover:scale-[1.01] active:scale-95 transition-all text-xs tracking-[0.4em] flex items-center justify-center gap-4">
                    {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} strokeWidth={3} />}
                    {editingSubject ? "RE-SCELLER L'UNITÉ" : "SCELLER L'UNITÉ DANS LE NOYAU"}
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="w-full py-8 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all bg-slate-900/50 rounded-[2rem] border border-white/5">ANNULER L'OPÉRATION</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Studies;