
import React, { useState, useEffect } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface WordDetail {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  translation: string;
}

const LanguagesView: React.FC = () => {
  const [activeLang, setActiveLang] = useState('Anglais');
  const [words, setWords] = useState<WordDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  const generateWords = async () => {
    setIsLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const prompt = `Génère une liste de 5 mots juridiques ou académiques complexes en ${activeLang}. 
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
      console.error("Erreur lors de la génération des mots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateWords();
  }, [activeLang]);

  return (
    <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Globe className="text-blue-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">IA Lexical Engine</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">POLYGLOTTE <span className="text-blue-500 font-outfit">STRATÉGIQUE</span></h2>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-white/5">
           {['Anglais', 'Français', 'Espagnol', 'Arabe'].map(lang => (
             <button 
                key={lang} 
                onClick={() => setActiveLang(lang)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeLang === lang 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang}
              </button>
           ))}
        </div>
      </div>

      {/* Main AI Generation Controls */}
      <div className="flex justify-center">
         <button 
          onClick={generateWords}
          disabled={isLoading}
          className="group flex items-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-all disabled:opacity-50"
         >
           {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-blue-600 group-hover:animate-bounce" />}
           Générer de nouveaux termes
         </button>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-[2.5rem] h-64 animate-pulse border-white/5 bg-white/5" />
          ))
        ) : (
          words.map((w, idx) => (
            <div key={idx} className="glass rounded-[2.5rem] p-10 border-white/5 relative group hover:border-blue-500/30 transition-all shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-500 group-hover:scale-110 transition-transform duration-700">
                  <BookMarked size={120} />
               </div>
               
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 italic">Terme Académique</span>
                    <button className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors"><Volume2 size={18} /></button>
                  </div>

                  <div>
                     <h3 className="text-4xl font-black text-white tracking-tight italic mb-2">{w.word}</h3>
                     <p className="text-slate-500 text-sm italic font-medium">{w.phonetic}</p>
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                     <p className="text-slate-300 text-sm leading-relaxed font-bold italic">"{w.definition}"</p>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">EXEMPLE CONTEXTUEL</p>
                     <p className="text-slate-400 text-sm leading-relaxed">
                       {w.example} <span className="block text-slate-600 text-[10px] mt-1 italic">— {w.translation}</span>
                     </p>
                  </div>

                  <button 
                    onClick={() => setLearnedCount(prev => prev + 1)}
                    className="w-full py-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={16} /> Marquer comme appris
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Mini-bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-10 py-4 rounded-full shadow-2xl flex items-center gap-8">
          <div className="flex items-center gap-3">
             <Star className="text-amber-500" size={16} fill="currentColor" />
             <span className="text-xs font-black text-white uppercase tracking-widest">{learnedCount} MOTS ACQUIS</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
             <BrainCircuit className="text-blue-500" size={16} />
             <span className="text-xs font-black text-white uppercase tracking-widest">Niveau Master Lexique</span>
          </div>
      </div>
    </div>
  );
};

export default LanguagesView;
