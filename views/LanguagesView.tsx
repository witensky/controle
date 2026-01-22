
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
  X,
  Target,
  Brain,
  Search,
  Trash2,
  BookOpen,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase, handleSupabaseError, safeDbQuery } from '../lib/supabase';

interface WordDetail {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  translation: string;
}

interface LearnedWord extends WordDetail {
  id: string;
  language: string;
  learned_at: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  contextUsed: string;
}

const LanguagesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'archive'>('learn');
  const [activeLang, setActiveLang] = useState('Anglais');
  const [words, setWords] = useState<WordDetail[]>([]);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [isTargetedMode, setIsTargetedMode] = useState(false);

  useEffect(() => {
    fetchLearnedWords();
  }, [activeLang]);

  const fetchLearnedWords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await safeDbQuery(
        supabase.from('learned_words')
          .select('*')
          .eq('user_id', user.id)
          .eq('language', activeLang)
          .order('learned_at', { ascending: false })
      );
      
      if (data) setLearnedWords(data as LearnedWord[]);
    } catch (err) {
      console.error("Fetch history error", err);
    }
  };

  const generateWords = async () => {
    setIsLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const excludedWords = learnedWords.map(w => w.word).join(', ');
      
      const prompt = `Génère une liste de 5 mots juridiques ou académiques complexes en ${activeLang}. 
      IMPORTANT: EXCLURE STRICTEMENT les mots suivants : [${excludedWords}].
      Pour chaque mot, donne la phonétique, une définition précise et un exemple d'utilisation dans une phrase. 
      Réponds UNIQUEMENT avec un objet JSON au format suivant:
      [
        {
          "word": "le mot",
          "phonetic": "la phonétique",
          "definition": "la définition en français",
          "example": "l'exemple en ${activeLang}",
          "translation": "la traduction française de l'exemple"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "[]");
      setWords(data);
    } catch (error) {
      console.error("Erreur génération:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsLearned = async (word: WordDetail) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('learned_words').insert([{
        user_id: user.id,
        word: word.word,
        phonetic: word.phonetic,
        definition: word.definition,
        example: word.example,
        translation: word.translation,
        language: activeLang
      }]);

      if (error) throw error;
      
      setWords(prev => prev.filter(w => w.word !== word.word));
      fetchLearnedWords();
    } catch (err) {
      handleSupabaseError(err, 'markAsLearned');
    }
  };

  const deleteLearnedWord = async (id: string) => {
    if (!window.confirm("Supprimer ce mot de l'archive ?")) return;
    try {
      const { error } = await supabase.from('learned_words').delete().eq('id', id);
      if (error) throw error;
      setLearnedWords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      handleSupabaseError(err, 'deleteLearnedWord');
    }
  };

  const startQuiz = async () => {
    if (learnedWords.length < 2) {
      alert("Acquérez au moins 2 mots pour lancer un quiz tactique.");
      return;
    }
    
    setIsQuizLoading(true);
    setQuizAnswered(null);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      // Logique Révision Ciblée : On pioche dans les 5 plus récents
      const pool = isTargetedMode 
        ? learnedWords.slice(0, 5) 
        : learnedWords;
        
      const targetWord = pool[Math.floor(Math.random() * pool.length)];
      
      const prompt = `En tant qu'expert en linguistique juridique et académique, crée un défi complexe pour le mot "${targetWord.word}" en ${activeLang}.
      
      CONTEXTE DU MOT:
      Définition: "${targetWord.definition}"
      Exemple d'origine: "${targetWord.example}"
      
      CONSIGNES:
      1. Ne pose pas une question de définition simple.
      2. Crée un nouveau scénario ou une phrase à trou complexe où l'usage de "${targetWord.word}" est indispensable ou testé par rapport à des synonymes.
      3. Propose 4 options très proches sémantiquement pour tester la précision.
      4. L'explication doit lier la définition à l'exemple d'origine pour renforcer la mémorisation.

      Réponds UNIQUEMENT en JSON :
      {
        "question": "Énoncé du défi contextuel",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "Explication détaillée liant définition et contexte",
        "contextUsed": "Le type de contexte (Juridique, Académique, Diplomatique...)"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setCurrentQuiz(JSON.parse(response.text || "{}"));
      setShowQuiz(true);
    } catch (err) {
      console.error("Quiz generation error", err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const filteredArchive = useMemo(() => {
    return learnedWords.filter(w => 
      w.word.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      w.definition.toLowerCase().includes(archiveSearch.toLowerCase())
    );
  }, [learnedWords, archiveSearch]);

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Globe className="text-blue-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">IA Lexical Engine • v3.8</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">POLYGLOTTE <span className="text-blue-500 font-outfit">STRATÉGIQUE</span></h2>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
             {['Anglais', 'Français', 'Espagnol', 'Arabe'].map(lang => (
               <button 
                  key={lang} 
                  onClick={() => setActiveLang(lang)}
                  className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeLang === lang 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lang}
                </button>
             ))}
          </div>
          <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5 self-end">
             <button onClick={() => setActiveTab('learn')} className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'learn' ? 'bg-white text-slate-950' : 'text-slate-600'}`}>ACQUISITION</button>
             <button onClick={() => setActiveTab('archive')} className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white text-slate-950' : 'text-slate-600'}`}>REGISTRE</button>
          </div>
        </div>
      </div>

      {activeTab === 'learn' ? (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row justify-center gap-6 items-center">
             <button 
              onClick={generateWords}
              disabled={isLoading || isQuizLoading}
              className="group flex items-center justify-center gap-4 bg-white text-slate-950 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-all shadow-3xl disabled:opacity-50"
             >
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-blue-600 group-hover:animate-bounce" />}
               Scanner nouveaux termes
             </button>

             <div className="flex flex-col gap-2">
                <button 
                  onClick={startQuiz}
                  disabled={isLoading || isQuizLoading || learnedWords.length < 2}
                  className={`group flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all border ${
                    learnedWords.length < 2 
                    ? 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed' 
                    : isTargetedMode 
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xl shadow-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white shadow-xl shadow-blue-500/10'
                  }`}
                >
                  {isQuizLoading ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                  {isTargetedMode ? 'Révision Critique (5 derniers)' : 'Lancer Quiz Tactique'}
                </button>
                
                <button 
                  onClick={() => setIsTargetedMode(!isTargetedMode)}
                  className={`flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${isTargetedMode ? 'text-amber-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                   {isTargetedMode ? <Zap size={10} fill="currentColor" /> : <RotateCcw size={10} />}
                   {isTargetedMode ? 'MODE CIBLÉ ACTIF' : 'ACTIVER RÉVISION CIBLÉE'}
                </button>
             </div>
          </div>

          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-6">
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit size={32} className="text-blue-500 animate-pulse" />
                 </div>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Interrogation du réseau neural...</p>
            </div>
          )}

          {!isLoading && words.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {words.map((w, idx) => (
                <div key={idx} className="glass rounded-[3rem] p-10 border-white/5 relative group hover:border-blue-500/30 transition-all shadow-2xl overflow-hidden animate-in zoom-in-95">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-500 group-hover:scale-110 transition-transform duration-700">
                      <BookMarked size={140} />
                   </div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 italic">Détection IA</span>
                        <button className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><Volume2 size={18} /></button>
                      </div>

                      <div>
                         <h3 className="text-4xl font-black text-white tracking-tight italic mb-2 uppercase">{w.word}</h3>
                         <p className="text-slate-500 text-sm italic font-medium tracking-widest">{w.phonetic}</p>
                      </div>

                      <div className="bg-slate-950/80 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                         <p className="text-slate-300 text-lg leading-relaxed font-bold italic font-serif">"{w.definition}"</p>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <MessagesSquare size={14} className="text-slate-700" />
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">MISE EN SITUATION</p>
                         </div>
                         <div className="pl-6 border-l-2 border-slate-900">
                           <p className="text-slate-400 text-sm leading-relaxed italic">
                             {w.example}
                           </p>
                           <p className="text-slate-600 text-[10px] mt-3 uppercase font-black tracking-widest italic">— {w.translation}</p>
                         </div>
                      </div>

                      <button 
                        onClick={() => markAsLearned(w)}
                        className="w-full py-6 bg-blue-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/10 hover:shadow-emerald-500/20"
                      >
                        <CheckCircle2 size={18} strokeWidth={3} /> SÉCURISER L'ACQUISITION
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && words.length === 0 && (
            <div className="py-24 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
                <Brain size={64} className="mx-auto text-slate-800 mb-6" />
                <p className="text-xl font-black text-slate-600 uppercase italic tracking-widest">Initialisez un scan pour détecter de nouveaux termes.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
           <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
              <div className="relative flex-1 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <input 
                  type="text" 
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  placeholder="RECHERCHER DANS LE REGISTRE..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-blue-500/40 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-800"
                 />
              </div>
              <div className="bg-slate-900/80 px-8 py-5 rounded-[2rem] border border-white/5 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-white italic">{learnedWords.length}</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Mode Critique</p>
                    <p className="text-xl font-black text-amber-500 italic">Prêt</p>
                  </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArchive.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-700 italic font-black uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">
                   Aucun terme correspondant dans le registre {activeLang}.
                </div>
              ) : (
                filteredArchive.map((w, i) => {
                  const isRecent = i < 5;
                  return (
                    <div key={w.id} className={`glass rounded-[2rem] p-8 border bg-[#0f172a]/40 hover:border-blue-500/20 transition-all group flex flex-col h-full relative ${isRecent ? 'border-amber-500/10' : 'border-white/5'}`}>
                      {isRecent && (
                        <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-xl animate-bounce">
                           Priorité Révision
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                              <BookOpen size={14} />
                           </div>
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(w.learned_at).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => deleteLearnedWord(w.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-rose-500 transition-all">
                           <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="text-2xl font-black text-white italic mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{w.word}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6 italic line-clamp-2">"{w.definition}"</p>
                      <div className="mt-auto pt-6 border-t border-white/5">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] italic mb-2">PHONÉTIQUE</p>
                        <p className="text-[10px] text-blue-500 font-bold tracking-widest">{w.phonetic}</p>
                      </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && currentQuiz && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-[100px] animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isTargetedMode ? 'from-amber-500 to-rose-500' : 'from-blue-500 to-emerald-500'}`}></div>
              
              <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-slate-950 shadow-2xl ${isTargetedMode ? 'bg-amber-500' : 'bg-blue-500'}`}><Brain size={30} strokeWidth={2.5} /></div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">{isTargetedMode ? 'RÉVISION CRITIQUE' : 'DÉFI CONTEXTUEL'}</h4>
                        <p className={`text-[9px] font-black uppercase mt-2 tracking-[0.3em] ${isTargetedMode ? 'text-amber-500' : 'text-blue-500'}`}>
                           {currentQuiz.contextUsed} • ANALYSE TACTIQUE
                        </p>
                    </div>
                 </div>
                 <button onClick={() => setShowQuiz(false)} className="p-4 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all active:scale-90"><X size={24} /></button>
              </div>

              <div className="space-y-10">
                 <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 shadow-inner relative overflow-hidden">
                    <div className="absolute top-4 right-6 text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Analyse sémantique</div>
                    <p className="text-2xl font-bold text-white leading-relaxed italic font-serif">"{currentQuiz.question}"</p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {currentQuiz.options.map((opt, i) => {
                      const isCorrect = i === currentQuiz.correctIndex;
                      const isSelected = quizAnswered === i;
                      
                      let btnClass = "bg-slate-950/50 border-white/5 text-slate-400 hover:border-blue-500/30 hover:bg-slate-900";
                      if (quizAnswered !== null) {
                        if (isCorrect) btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/5";
                        else if (isSelected) btnClass = "bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/5";
                        else btnClass = "bg-slate-950 border-white/5 text-slate-700 opacity-30";
                      }

                      return (
                        <button 
                          key={i} 
                          disabled={quizAnswered !== null}
                          onClick={() => setQuizAnswered(i)}
                          className={`w-full p-6 rounded-[1.8rem] border text-left text-sm font-bold transition-all flex items-center justify-between group active:scale-95 ${btnClass}`}
                        >
                          <span className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border ${quizAnswered === i ? 'border-current' : 'border-slate-800 text-slate-600'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </span>
                          {quizAnswered !== null && isCorrect && <CheckCircle2 size={20} className="animate-in zoom-in" />}
                          {quizAnswered !== null && isSelected && !isCorrect && <X size={20} className="animate-in shake" />}
                        </button>
                      );
                    })}
                 </div>

                 {quizAnswered !== null && (
                   <div className="p-8 bg-blue-500/[0.03] border border-blue-500/10 rounded-[2.5rem] animate-in slide-in-from-top-6 duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <ArrowUpRight size={16} className="text-blue-400" />
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic">CORRÉLATION DÉFINITION-CONTEXTE</p>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic font-medium">{currentQuiz.explanation}</p>
                      <button 
                        onClick={startQuiz}
                        className="mt-8 w-full py-6 bg-white text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                      >
                        MISSION SUIVANTE <ArrowRight size={18} />
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Floating Tactical Status Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-3xl border border-white/10 px-12 py-6 rounded-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] flex items-center gap-12 ring-1 ring-white/10 animate-in slide-in-from-bottom-12 delay-1000 duration-1000">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Trophy size={18} fill="currentColor" />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Lexique</p>
                <p className="text-sm font-black text-white uppercase tracking-tighter italic">{learnedWords.length} ACQUISITIONS</p>
             </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <BrainCircuit size={18} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Maîtrise</p>
                <p className="text-sm font-black text-white uppercase tracking-tighter italic">{Math.min(100, learnedWords.length * 2)}% EFFICACE</p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default LanguagesView;
