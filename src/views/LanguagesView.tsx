
import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  BookMarked,
  Volume2,
  Star,
  CheckCircle2,
  BrainCircuit,
  MessagesSquare,
  Sparkles,
  Loader2,
  RotateCcw,
  Trophy,
  History,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Brain,
  Search,
  Trash2,
  BookOpen,
  ArrowUpRight,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useLearnedWords, useMarkAsLearned, useGenerateWords } from '../features/languages/hooks/useLanguages';
import { WordDetail, LearnedWord } from '../features/languages/types';

const Flashcard: React.FC<{ word: WordDetail; onLearned: () => void; activeLang: string }> = ({ word, onLearned, activeLang }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLang === 'Anglais' ? 'en-US' : activeLang === 'Français' ? 'fr-FR' : activeLang === 'Espagnol' ? 'es-ES' : 'ar-SA';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="perspective-1000 w-full h-[400px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden glass rounded-[3rem] p-8 border-white/10 flex flex-col items-center justify-center text-center bg-slate-900/40">
          <div className="absolute top-8 right-8">
            <button
              onClick={(e) => { e.stopPropagation(); speak(word.word); }}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 italic">MOT DU JOUR</span>
            <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{word.word}</h3>
            <p className="text-slate-500 text-sm font-bold tracking-widest">{word.phonetic}</p>
          </div>

          <div className="absolute bottom-12 flex items-center gap-2 text-slate-500 animate-pulse">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cliquer pour voir la définition</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 backface-hidden glass rounded-[3rem] p-8 border-white/10 flex flex-col items-center justify-center text-center bg-blue-600/10 rotate-y-180">
          <div className="space-y-8 w-full">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60 italic">DÉFINITION</span>
              <p className="text-xl font-bold text-white italic leading-relaxed px-4">"{word.definition}"</p>
            </div>

            {word.example && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60 italic">EXEMPLE</span>
                <p className="text-sm font-medium text-slate-400 italic">"{word.example}"</p>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); onLearned(); }}
              className="w-full mt-4 py-5 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
            >
              MARQUER COMME APPRIS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const LanguagesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'archive'>('learn');
  const [activeLang, setActiveLang] = useState('Anglais');
  const { data: learnedWordsRaw, isLoading: isHistoryLoading } = useLearnedWords(activeLang);
  const markAsLearnedMutation = useMarkAsLearned();
  const generateWordsMutation = useGenerateWords();

  const learnedWords = learnedWordsRaw || [];
  const isLoading = isHistoryLoading || generateWordsMutation.isPending;

  const [words, setWords] = useState<WordDetail[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [archiveSearch, setArchiveSearch] = useState('');

  const generateWords = async () => {
    try {
      const newWords = await generateWordsMutation.mutateAsync({ language: activeLang });
      if (Array.isArray(newWords)) {
        setWords(newWords);
        setCurrentWordIndex(0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsLearned = async (word: WordDetail) => {
    try {
      await markAsLearnedMutation.mutateAsync({
        ...word,
        language: activeLang
      });
      const remainingWords = words.filter(w => w.word !== word.word);
      setWords(remainingWords);
      if (currentWordIndex >= remainingWords.length && remainingWords.length > 0) {
        setCurrentWordIndex(remainingWords.length - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      totalMastered: learnedWords.length,
      todayCount: learnedWords.filter(w => w.learned_at && new Date(w.learned_at).toDateString() === new Date().toDateString()).length
    };
  }, [learnedWords]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="text-blue-500" size={14} />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">GESTION DU VOCABULAIRE</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">MES <span className="text-blue-500 font-outfit">LANGUES</span></h2>
        </div>

        {/* STATS CAPSULES */}
        <div className="flex gap-4">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-3 flex flex-col gap-1 shadow-lg">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MASTERED</span>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" />
              <span className="text-sm font-black text-white">{stats.totalMastered}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-3 flex flex-col gap-1 shadow-lg">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TODAY</span>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <span className="text-sm font-black text-white">{stats.todayCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LANGUAGE SELECTOR & TAB NAVIGATION */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-950 border border-white/5 rounded-2xl shadow-xl">
          {['Anglais', 'Français', 'Espagnol', 'Arabe'].map(lang => (
            <button
              key={lang}
              onClick={() => { setActiveLang(lang); setWords([]); }}
              className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeLang === lang ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:text-slate-400'
                }`}
            >
              {lang.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
          {[
            { id: 'learn', label: 'ACQUISITION', icon: Brain },
            { id: 'archive', label: 'REGISTRE', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-600 hover:text-white'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="min-h-[450px]">
        {activeTab === 'learn' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {words.length === 0 ? (
              <div className="glass rounded-[3.5rem] p-16 border border-dashed border-white/10 bg-slate-950/20 flex flex-col items-center justify-center text-center gap-8 shadow-2xl">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Brain size={40} className="relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">PRÊT POUR L'ACQUISITION</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">Générez 5 nouveaux termes pour étendre votre lexique personnel.</p>
                </div>
                <button
                  onClick={generateWords}
                  disabled={isLoading}
                  className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                  CHARGER DE NOUVEAUX MOTS
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* DECK HEADER */}
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">SESSION {activeLang.toUpperCase()}</h4>
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <span className="text-white">{currentWordIndex + 1}</span> / {words.length}
                  </div>
                </div>

                {/* FLASHCARD INTERFACE */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur-2xl opacity-10" />
                  <Flashcard
                    word={words[currentWordIndex]}
                    activeLang={activeLang}
                    onLearned={() => markAsLearned(words[currentWordIndex])}
                  />
                </div>

                {/* NAVIGATION CONTROLS */}
                <div className="flex justify-center items-center gap-12">
                  <button
                    onClick={() => setCurrentWordIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentWordIndex === 0}
                    className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center text-slate-600 hover:text-white hover:border-blue-500/30 transition-all disabled:opacity-10"
                  >
                    <ChevronLeft size={32} />
                  </button>

                  <div className="h-1 w-24 bg-slate-900 rounded-full flex gap-1 overflow-hidden">
                    {words.map((_, i) => (
                      <div key={i} className={`h-full transition-all duration-500 ${i === currentWordIndex ? 'flex-[2] bg-blue-500' : 'flex-1 bg-slate-800'}`} />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentWordIndex(prev => Math.min(words.length - 1, prev + 1))}
                    disabled={currentWordIndex === words.length - 1}
                    className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center text-slate-600 hover:text-white hover:border-blue-500/30 transition-all disabled:opacity-10"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-600 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="RECHERCHER DANS VOTRE VOCABULAIRE..."
                className="w-full bg-slate-950 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-black text-white outline-none focus:border-blue-500/50 transition-all uppercase tracking-tight placeholder:text-slate-800"
              />
            </div>

            {isHistoryLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">Chargement local...</span>
              </div>
            ) : learnedWords.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-800 space-y-6 grayscale opacity-40">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                  <BookOpen size={48} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Le registre est vide</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learnedWords
                  .filter(w => w.word.toLowerCase().includes(archiveSearch.toLowerCase()) || w.definition?.toLowerCase().includes(archiveSearch.toLowerCase()))
                  .map((w, idx) => (
                    <div key={idx} className="glass rounded-[2rem] p-6 border border-white/5 bg-slate-900/10 flex flex-col gap-4 group hover:border-blue-600/30 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookMarked size={60} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-blue-500 transition-colors">{w.word}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const utterance = new SpeechSynthesisUtterance(w.word);
                                utterance.lang = activeLang === 'Anglais' ? 'en-US' : activeLang === 'Français' ? 'fr-FR' : activeLang === 'Espagnol' ? 'es-ES' : 'ar-SA';
                                if ('speechSynthesis' in window) {
                                  window.speechSynthesis.cancel();
                                  window.speechSynthesis.speak(utterance);
                                }
                              }}
                              className="p-2 text-slate-700 hover:text-white transition-colors"
                            >
                              <Volume2 size={16} />
                            </button>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-lg text-[7px] font-black uppercase tracking-widest">MASTERED</span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-3">{w.phonetic}</p>
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <p className="text-slate-400 text-xs font-medium italic leading-relaxed">"{w.definition}"</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-4">
                          <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">ENREGISTRÉ LE {new Date(w.learned_at || '').toLocaleDateString('fr-FR')}</span>
                          <ArrowUpRight size={14} className="text-slate-800" />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER LEGEND */}
      <div className="flex flex-col items-center gap-3 py-12 opacity-30">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Fin de liste</p>
      </div>
    </div>
  );
};

export default LanguagesView;
