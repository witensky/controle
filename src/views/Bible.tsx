
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Cross, Book, PenTool, Flame, Calendar, CloudSun, ChevronRight, X, CheckCircle2, Heart, Star, ListChecks, History, Bold, Italic, Tag as TagIcon, Trash2, Loader2, Quote, Brain, Sparkles, Shield, Zap, Target, BookOpen, Eye, EyeOff, Scroll
} from 'lucide-react';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { useBibleEntries, useBibleProgress, useMarkChapterRead, useMarkChapterUnread, useCreateEntry } from '../features/bible/hooks/useBible';
import { JournalEntry, ReadingItem } from '../features/bible/types';

// ── MEMORY TAB COMPONENT ──────────────────────────────────
const MemoryTab: React.FC<{ readingPlan: ReadingItem[] }> = ({ readingPlan }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<string, 'easy' | 'hard' | 'forgot'>>({});

  const current = readingPlan[cardIndex] ?? readingPlan[0];
  const progress = Object.keys(scores).length;

  const handleScore = (s: 'easy' | 'hard' | 'forgot') => {
    setScores(prev => ({ ...prev, [current.id]: s }));
    setRevealed(false);
    setCardIndex(prev => (prev + 1) % readingPlan.length);
  };

  const restart = () => { setScores({}); setCardIndex(0); setRevealed(false); };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">SUIVI DE <span className="text-amber-500 font-outfit">MÉMORISATION</span></h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{progress}/{readingPlan.length} APPRIS</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${(progress / readingPlan.length) * 100}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="glass rounded-[3rem] p-10 md:p-14 border border-white/5 bg-[#0f172a]/60 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
        <div className="absolute -top-10 -right-10 opacity-[0.02]"><Cross size={350} /></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{current.chapter}</span>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{current.title}</span>
          </div>

          {!revealed ? (
            <div className="flex flex-col items-center justify-center py-14 gap-6 text-center">
              <Eye size={48} className="text-slate-700" />
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Récite ce verset de mémoire,<br />puis révèle pour vérifier</p>
              <button
                onClick={() => setRevealed(true)}
                className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
              >
                <Eye size={16} />RÉVÉLER LE TEXTE
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-950/80 p-10 rounded-[2.5rem] border border-white/5 text-xl text-slate-100 font-serif italic leading-relaxed relative">
                <Quote className="absolute -top-4 -left-2 text-amber-500/10" size={80} />
                "{current.verse}"
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => handleScore('forgot')} className="flex-1 py-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                  😔 OUBLIÉ
                </button>
                <button onClick={() => handleScore('hard')} className="flex-1 py-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-500/20 transition-all">
                  🔥 DIFFICILE
                </button>
                <button onClick={() => handleScore('easy')} className="flex-1 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                  ✅ MAÎTRISÉ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Maîtrisés', key: 'easy', color: 'emerald' },
          { label: 'Difficiles', key: 'hard', color: 'amber' },
          { label: 'Oubliés', key: 'forgot', color: 'rose' },
        ].map(({ label, key, color }) => {
          const count = Object.values(scores).filter(v => v === key).length;
          return (
            <div key={key} className={`glass rounded-2xl p-5 border border-white/5 text-center`}>
              <p className={`text-3xl font-black text-${color}-500`}>{count}</p>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {progress === readingPlan.length && (
        <div className="text-center space-y-4 py-6">
          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Session complète !</p>
          <button onClick={restart} className="px-10 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">
            RECOMMENCER
          </button>
        </div>
      )}
    </div>
  );
};

const Bible: React.FC = () => {
  const { showAlert } = useAppDialog();
  const { data: entriesRaw, isLoading: entriesLoading } = useBibleEntries();
  const { data: progressRaw, isLoading: progressLoading } = useBibleProgress();
  const markRead = useMarkChapterRead();
  const markUnread = useMarkChapterUnread();
  const createEntry = useCreateEntry();

  const entries = entriesRaw || [];
  const checkedChapters = progressRaw || [];
  const loading = entriesLoading || progressLoading;

  const [activeTab, setActiveTab] = useState<'reading' | 'memory' | 'journal'>('reading');
  const [showJournal, setShowJournal] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const readingPlan: ReadingItem[] = [
    { id: 'Ps 23', title: 'Le Bon Berger', chapter: 'PSAUME 23', verse: "L'Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles..." },
    { id: 'Gen 12', title: 'L\'appel d\'Abraham', chapter: 'GENÈSE 12', verse: "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai." },
    { id: 'Gen 13', title: 'Le choix de Lot', chapter: 'GENÈSE 13', verse: "Abram monta d'Égypte vers le midi, lui, sa femme, et tout ce qui lui appartenait, et Lot avec lui." },
    { id: 'Gen 15', title: 'L\'Alliance', chapter: 'GENÈSE 15', verse: "Après ces événements, la parole de l'Éternel fut adressée à Abram dans une vision, et il dit: Ne crains point, Abram; je suis ton bouclier." },
    { id: 'Prov 3', title: 'La Sagesse', chapter: 'PROVERBES 3', verse: "Mon fils, n'oublie pas mes enseignements, et que ton coeur garde mes préceptes; Car ils prolongeront les jours et les années de ta vie." },
  ];



  const currentReading = useMemo(() => {
    return readingPlan.find(r => !checkedChapters.includes(r.id)) || readingPlan[0];
  }, [checkedChapters]);

  const toggleChapter = async (id: string) => {
    try {
      if (checkedChapters.includes(id)) {
        await markUnread.mutateAsync(id);
      } else {
        await markRead.mutateAsync(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveJournal = async () => {
    if (!journalContent.trim()) return;
    setIsSaving(true);
    try {
      const tagsArray = journalTags.split(',').map(t => t.trim()).filter(t => t !== "");

      await createEntry.mutateAsync({
        content: journalContent,
        tags: tagsArray,
        mood: currentMood
      });

      setShowJournal(false);
      setJournalContent("");
      setJournalTags("");
      setCurrentMood(null);
    } catch (err) {
      await showAlert({
        title: 'Enregistrement impossible',
        message: "L'entree n'a pas pu etre enregistree localement.",
        tone: 'danger',
      });
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
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-outfit">CHEMIN SPIRITUEL • V1.0</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic font-outfit">BIBLE & <span className="text-amber-500">MENTAL</span></h2>
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

      {/* TAB CONTENT */}

      {/* ── READING TAB ── */}
      {activeTab === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* COLONNE GAUCHE & CENTRE : LECTURE RECOMMANDEE */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-[3.5rem] p-10 md:p-14 border-white/5 bg-[#0f172a]/60 relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-12 -right-12 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
                <Cross size={400} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-14">
                  <span className="px-6 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-amber-500/5 animate-pulse">
                    Lecture du jour
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-40">Plan quotidien</span>
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
                    className={`flex-1 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-3xl transition-all flex items-center justify-center gap-4 ${checkedChapters.includes(currentReading.id)
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-white text-slate-950 hover:scale-[1.02] active:scale-95'
                      }`}
                  >
                    <CheckCircle2 size={24} strokeWidth={3} />
                    {checkedChapters.includes(currentReading.id) ? 'LECTURE TERMINÉE' : 'MARQUER COMME LU'}
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
                  className={`glass rounded-[2.5rem] p-8 border bg-slate-900/40 flex items-center justify-between group cursor-pointer transition-all ${checkedChapters.includes(item.id) ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-amber-500/20'
                    }`}
                >
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{item.chapter}</p>
                    <h4 className="text-lg font-black text-white italic tracking-tight uppercase leading-none">{item.title}</h4>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${checkedChapters.includes(item.id)
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-800 text-slate-700'
                    }`}>
                    {checkedChapters.includes(item.id) ? <CheckCircle2 size={20} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE LATERALE : DERNIERES REFLEXIONS */}
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
      )}

      {/* ── MEMORY / ACQUISITION TAB ── */}
      {activeTab === 'memory' && (
        <MemoryTab readingPlan={readingPlan} />
      )}

      {/* ── JOURNAL / REFLEXIONS TAB ── */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">ARCHIVE <span className="text-amber-500">SPIRITUELLE</span></h3>
            <button onClick={() => setShowJournal(true)} className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
              <PenTool size={14} />NOUVELLE RÉFLEXION
            </button>
          </div>
          {entries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-3">
              <PenTool size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucune réflexion archivée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(e => (
                <div key={e.id} className="glass rounded-[2rem] p-8 border border-white/5 bg-slate-900/40">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(e.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      {e.tags?.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {e.tags.map((tag: string) => <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black uppercase tracking-wider">{tag}</span>)}
                        </div>
                      )}
                    </div>
                    <span className="text-2xl">{moodEmojis[e.mood || 2].icon}</span>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed italic text-sm">"{e.content}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL JOURNAL (HERITAGE DE L'ANCIENNE VERSION MAIS RE-STYLISE) */}
      {showJournal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-[100px] animate-in zoom-in-95">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 flex flex-col h-[85vh] shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">MES <span className="text-amber-500 font-outfit">PENSÉES</span></h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Journal de réflexion personnelle</p>
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
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
