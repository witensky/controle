
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

const LanguagesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'archive'>('learn');
  const [activeLang, setActiveLang] = useState('Anglais');
  const [words, setWords] = useState<WordDetail[]>([]);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');

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
      const prompt = `Génère une liste de 5 mots juridiques complexes en ${activeLang}. Réponds uniquement en JSON: [{"word": "...", "phonetic": "...", "definition": "...", "example": "...", "translation": "..."}]`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      setWords(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsLearned = async (word: WordDetail) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('learned_words').insert([{
        user_id: user.id,
        ...word,
        language: activeLang
      }]);
      setWords(prev => prev.filter(w => w.word !== word.word));
      fetchLearnedWords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <Globe className="text-blue-500" size={14} />
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">IA Lexical Engine • v3.8</span>
           </div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">POLYGLOTTE <span className="text-blue-500">STRATÉGIQUE</span></h2>
        </div>
        
        {/* LANGUAGE SELECTOR - OPTIMIZED FOR MOBILE (SCREENSHOT 4 FIX) */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2 p-1 bg-slate-900 border border-white/5 rounded-2xl">
             {['Anglais', 'Français', 'Espagnol', 'Arabe'].map(lang => (
               <button 
                  key={lang} 
                  onClick={() => setActiveLang(lang)}
                  className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    activeLang === lang ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'
                  }`}
                >
                  {lang.slice(0, 3)}
                </button>
             ))}
          </div>
          <div className="flex gap-2 p-1 bg-slate-950/50 rounded-2xl border border-white/5">
             <button onClick={() => setActiveTab('learn')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'learn' ? 'bg-white text-slate-950' : 'text-slate-600'}`}>ACQUISITION</button>
             <button onClick={() => setActiveTab('archive')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white text-slate-950' : 'text-slate-600'}`}>REGISTRE</button>
          </div>
        </div>
      </div>

      {activeTab === 'learn' && (
        <div className="space-y-6">
          <button 
            onClick={generateWords}
            disabled={isLoading}
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Scanner nouveaux termes
          </button>

          <div className="grid grid-cols-1 gap-4">
            {words.map((w, idx) => (
              <div key={idx} className="glass rounded-[2rem] p-6 border-white/5 relative group shadow-xl">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10 italic">IA DETECTED</span>
                    <button className="text-slate-700 hover:text-white"><Volume2 size={16} /></button>
                 </div>
                 <h3 className="text-2xl font-black text-white tracking-tight italic mb-1 uppercase">{w.word}</h3>
                 <p className="text-slate-500 text-[10px] italic mb-4">{w.phonetic}</p>
                 <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 mb-6">
                    <p className="text-slate-300 text-sm font-medium italic line-clamp-3">"{w.definition}"</p>
                 </div>
                 <button 
                  onClick={() => markAsLearned(w)}
                  className="w-full py-4 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg"
                >
                  SÉCURISER L'ACQUISITION
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguagesView;
