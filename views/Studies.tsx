
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, X, Plus, Trash2, Edit3, Zap, Loader2, Search, Calendar, User, Award, BookOpen, Target, Brain, ArrowRight, ShieldCheck, ChevronRight, AlertCircle, GraduationCap, Layers
} from 'lucide-react';
import { LawSubject, LawSubjectStatus } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

const Studies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<LawSubject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LawSubject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

      if (editingSubject) {
        await supabase.from('study_subjects').update(payload).eq('id', editingSubject.id);
      } else {
        await supabase.from('study_subjects').insert([payload]);
      }

      await fetchSubjects();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormSemester('S1'); setFormProf(''); setFormStatus('En cours');
    setFormChaptersTotal(10); setFormChaptersDone(0); setFormExamDate(''); 
    setFormEcts(5); setFormNotes(''); setEditingSubject(null);
  };

  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION - FIXED MOBILE OVERLAP (SCREENSHOT 3 FIX) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">CURRICULUM <span className="text-amber-500">DROIT</span></h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Architecture Académique</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl"
        >
          AJOUTER MODULE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {filteredSubjects.map((sub) => (
          <div key={sub.id} className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-white/5 bg-[#0f172a]/40 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-slate-950 border border-white/10 rounded-lg text-[8px] font-black text-amber-500 uppercase tracking-widest">{sub.semester}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditingSubject(sub); setIsModalOpen(true); }} className="text-slate-700"><Edit3 size={14} /></button>
                <button onClick={async () => { if(confirm('Supprimer ?')) { await supabase.from('study_subjects').delete().eq('id', sub.id); fetchSubjects(); } }} className="text-slate-700 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>

            <h3 className="text-2xl font-black text-white uppercase italic mb-1 tracking-tight">{sub.name}</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">{sub.professor || 'PR. NON SPÉCIFIÉ'}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-white italic">{sub.progress}%</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sub.chaptersDone}/{sub.chaptersTotal} CHAPITRES</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${sub.progress}%` }} />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <AlertCircle size={12} className={sub.stressLevel === 'high' ? 'text-rose-500' : 'text-emerald-500'} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${sub.stressLevel === 'high' ? 'text-rose-500' : 'text-slate-500'}`}>
                    RISQUE : {sub.stressLevel === 'high' ? 'CRITIQUE' : 'MAÎTRISÉ'}
                  </span>
               </div>
               <button className="py-3 px-6 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[8px] font-black uppercase tracking-widest">DÉFI IA</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CONFIG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-6">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">CONFIG <span className="text-amber-500">MODULE</span></h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="NOM DU MODULE..." className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/50 uppercase" />
                <div className="grid grid-cols-2 gap-4">
                   <select value={formSemester} onChange={e => setFormSemester(e.target.value)} className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white uppercase outline-none">
                      {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <input type="number" value={formEcts} onChange={e => setFormEcts(Number(e.target.value))} placeholder="ECTS" className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input type="number" value={formChaptersDone} onChange={e => setFormChaptersDone(Number(e.target.value))} placeholder="FAITS" className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white outline-none" />
                   <input type="number" value={formChaptersTotal} onChange={e => setFormChaptersTotal(Number(e.target.value))} placeholder="TOTAL" className="bg-[#020617] border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black text-white outline-none" />
                </div>
                <button onClick={handleSave} className="w-full py-6 bg-amber-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-lg">SCELLER MODULE</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Studies;
