
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cross, Book, PenTool, Flame, Calendar, CloudSun, ChevronRight, X, CheckCircle2, Heart, Star, ListChecks, History, Bold, Italic, Tag as TagIcon, Trash2, Loader2, Quote, Brain, Sparkles, Shield, Zap, Target, BookOpen, Eye, EyeOff, Scroll
} from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  mood: number | null;
  created_at: string;
}

interface ReadingItem {
  id: string;
  title: string;
  chapter: string;
  verse: string;
}

const Bible: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'memory' | 'journal'>('reading');
  const [showJournal, setShowJournal] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const readingPlan: ReadingItem[] = [
    { id: 'Ps 23', title: 'Le Bon Berger', chapter: 'PSAUME 23', verse: "L'Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles..." },
    { id: 'Gen 12', title: 'L\'appel d\'Abraham', chapter: 'GENÈSE 12', verse: "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai." },
    { id: 'Gen 13', title: 'Le choix de Lot', chapter: 'GENÈSE 13', verse: "Abram monta d'Égypte vers le midi, lui, sa femme, et tout ce qui lui appartenait, et Lot avec lui." },
    { id: 'Gen 15', title: 'L\'Alliance', chapter: 'GENÈSE 15', verse: "Après ces événements, la parole de l'Éternel fut adressée à Abram dans une vision, et il dit: Ne crains point, Abram; je suis ton bouclier." },
    { id: 'Prov 3', title: 'La Sagesse', chapter: 'PROVERBES 3', verse: "Mon fils, n'oublie pas mes enseignements, et que ton coeur garde mes préceptes; Car ils prolongeront les jours et les années de ta vie." },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [entriesRes, progressRes] = await Promise.all([
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bible_progress').select('chapter_id').eq('user_id', user.id)
      ]);

      if (entriesRes.data) setEntries(entriesRes.data);
      if (progressRes.data) {
        setCheckedChapters(progressRes.data.map((p: any) => p.chapter_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentReading = useMemo(() => {
    return readingPlan.find(r => !checkedChapters.includes(r.id)) || readingPlan[0];
  }, [checkedChapters]);

  const toggleChapter = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (checkedChapters.includes(id)) {
        await supabase.from('bible_progress').delete().eq('user_id', user.id).eq('chapter_id', id);
        setCheckedChapters(prev => prev.filter(c => c !== id));
      } else {
        await supabase.from('bible_progress').upsert({ user_id: user.id, chapter_id: id });
        setCheckedChapters(prev => [...prev, id]);
        // XP Reward Logic could be added here
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveJournal = async () => {
    if (!journalContent.trim()) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const tagsArray = journalTags.split(',').map(t => t.trim()).filter(t => t !== "");
      const { data, error } = await supabase.from('journal_entries').insert([{
        user_id: user.id,
        content: journalContent,
        tags: tagsArray,
        mood: currentMood,
      }]).select();
      if (error) throw error;
      if (data) setEntries([data[0], ...entries]);
      setShowJournal(false);
      setJournalContent("");
    } catch (err) {
      alert("Erreur de synchronisation Cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const moodEmojis = [
    { icon: '😔', label: 'Combat' }, { icon: '😐', label: 'Focus' }, { icon: '🙂', label: 'Paix' }, { icon: '🔥', label: 'Zèle' }
  ];

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-1000">
      {/* Header Tactique */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <Shield className="text-amber-500" size={20} />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Spiritual Armory v4.2</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">BIBLE & <span className="text-amber-500 font-outfit">MENTAL</span></h2>
        </div>

        <div className="flex p-1 bg-slate-900 border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          {[
            { id: 'reading', label: 'Lecture', icon: BookOpen },
            { id: 'memory', label: 'Acquisition', icon: Target },
            { id: 'journal', label: 'Réflexions', icon: PenTool }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-6 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLONNE GAUCHE & CENTRE : LECTURE RECOMMANDEE */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass rounded-[3.5rem] p-10 md:p-14 border-white/5 bg-[#0f172a]/60 relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-12 -right-12 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
                 <Cross size={400} />
              </div>

              <div className="relative z-10">
                 <div className="flex justify-between items-center mb-14">
                    <span className="px-6 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.4em] italic shadow-lg shadow-amber-500/5 animate-pulse">
                       Lecture Recommandée
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-40">Witensky's Plan</span>
                 </div>

                 <div className="mb-14">
                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-8 flex items-center gap-4">
                       <Scroll className="text-amber-500" size={32} />
                       {currentReading.chapter}
                    </h3>
                    <div className="bg-slate-950/80 p-12 rounded-[3rem] border border-white/5 shadow-2xl text-2xl md:text-3xl text-slate-100 font-serif italic leading-[1.6] relative">
                       <Quote className="absolute -top-6 -left-4 text-amber-500/10" size={100} />
                       "{currentReading.verse}"
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-6">
                    <button 
                       onClick={() => toggleChapter(currentReading.id)}
                       className={`flex-1 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-3xl transition-all flex items-center justify-center gap-4 ${
                          checkedChapters.includes(currentReading.id)
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-white text-slate-950 hover:scale-[1.02] active:scale-95'
                       }`}
                    >
                       <CheckCircle2 size={24} strokeWidth={3} />
                       {checkedChapters.includes(currentReading.id) ? 'MISSION ACQUISE' : 'SCELLER LA LECTURE'}
                    </button>
                    <button 
                       onClick={() => setShowJournal(true)}
                       className="p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] text-slate-500 hover:text-amber-500 hover:border-amber-500/30 transition-all flex items-center justify-center"
                    >
                       <PenTool size={28} />
                    </button>
                 </div>
              </div>
           </div>

           {/* GRILLE DE PROGRESSION DU PLAN */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {readingPlan.filter(r => r.id !== currentReading.id).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChapter(item.id)}
                  className={`glass rounded-[2.5rem] p-8 border bg-slate-900/40 flex items-center justify-between group cursor-pointer transition-all ${
                    checkedChapters.includes(item.id) ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-amber-500/20'
                  }`}
                >
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{item.chapter}</p>
                      <h4 className="text-lg font-black text-white italic tracking-tight uppercase leading-none">{item.title}</h4>
                   </div>
                   <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                     checkedChapters.includes(item.id) 
                     ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                     : 'border-slate-800 text-slate-700'
                   }`}>
                      {checkedChapters.includes(item.id) ? <CheckCircle2 size={20} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* COLONNE DROITE : DERNIERES REFLEXIONS (SIDEBAR) */}
        <div className="space-y-8 h-full">
           <div className="glass rounded-[3rem] p-10 border-white/5 bg-indigo-500/[0.02] h-full flex flex-col">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-10 italic flex items-center gap-4">
                 <History size={18} className="text-indigo-400" />
                 Dernières Réflexions
              </h4>
              
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 {entries.length === 0 ? (
                   <div className="py-20 text-center opacity-20">
                      <PenTool size={48} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aucune archive</p>
                   </div>
                 ) : (
                   entries.slice(0, 5).map(e => (
                     <div key={e.id} className="p-6 bg-slate-950/60 rounded-[2rem] border border-white/5 group hover:border-amber-500/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(e.created_at).toLocaleDateString('fr-FR')}</span>
                           <span className="text-xl transform group-hover:scale-125 transition-transform">{moodEmojis[e.mood || 2].icon}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed line-clamp-2">
                           "{e.content}"
                        </p>
                     </div>
                   ))
                 )}
              </div>

              <button 
                onClick={() => setShowJournal(true)}
                className="mt-10 w-full py-5 border border-white/5 bg-slate-950 rounded-[1.8rem] text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
              >
                Ouvrir les archives complètes
              </button>
           </div>
        </div>

      </div>

      {/* MODAL JOURNAL (HERITAGE DE L'ANCIENNE VERSION MAIS RE-STYLISE) */}
      {showJournal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-[100px] animate-in zoom-in-95">
           <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 flex flex-col h-[85vh] shadow-3xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">SCEAU DE <span className="text-amber-500 font-outfit">GRATITUDE</span></h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Interrogation du Noyau Mental</p>
                </div>
                <button onClick={() => setShowJournal(false)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex items-center gap-4 p-2 bg-slate-950 rounded-2xl border border-white/5">
                   <div className="flex flex-1 gap-2 overflow-x-auto p-1 custom-scrollbar">
                      {moodEmojis.map((m, i) => (
                        <button key={i} onClick={() => setCurrentMood(i)} className={`px-4 py-2 rounded-xl text-xs transition-all border ${currentMood === i ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{m.icon} {m.label}</button>
                      ))}
                   </div>
                </div>

                <textarea 
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Écris ton flux de conscience..."
                  className="flex-1 bg-slate-950/50 rounded-[2.5rem] p-10 text-slate-200 font-serif text-xl leading-relaxed focus:outline-none border border-white/5 focus:border-amber-500/30 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="mt-10 flex gap-4">
                 <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-2 flex items-center gap-3">
                    <TagIcon size={14} className="text-slate-700 ml-4" />
                    <input type="text" value={journalTags} onChange={e => setJournalTags(e.target.value)} placeholder="TAGS (SÉPARÉS PAR VIRGULE)" className="flex-1 bg-transparent text-[10px] font-black text-white uppercase outline-none placeholder:text-slate-800" />
                 </div>
                 <button onClick={saveJournal} disabled={isSaving || !journalContent.trim()} className="px-12 py-6 bg-amber-500 text-slate-950 font-black uppercase tracking-[0.4em] text-xs rounded-3xl shadow-3xl hover:scale-105 transition-all flex items-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                    SCELLER
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
