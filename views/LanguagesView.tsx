
import React, { useState } from 'react';
import { 
  Globe, 
  BookMarked, 
  Volume2, 
  Star, 
  CheckCircle2,
  BrainCircuit,
  MessagesSquare
} from 'lucide-react';

const LanguagesView: React.FC = () => {
  const [learned, setLearned] = useState(false);
  const [activeLang, setActiveLang] = useState('Anglais');

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Globe className="text-orange-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">MASTERY OF LANGUAGES</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">POLYGLOTTE & <span className="text-orange-500 font-outfit">PRÉCIS</span></h2>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-blue-500/20">
           {['ANGLAIS', 'FRANÇAIS', 'ARABE'].map(lang => (
             <button 
                key={lang} 
                onClick={() => setActiveLang(lang)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeLang.toUpperCase() === lang 
                  ? 'bg-blue-500/10 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Word of the day Main Card */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
             <BookMarked size={200} />
           </div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">JURIDICAL WORD OF THE DAY</span>
                <div className="flex gap-2">
                   <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><Volume2 size={20} /></button>
                   <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><Star size={20} /></button>
                </div>
              </div>

              <div className="mb-12">
                 <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 italic">Subpoena</h3>
                 <p className="text-slate-400 text-lg italic mb-6">/səˈpiːnə/</p>
                 <div className="flex items-center gap-6 bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/40" />
                    <BrainCircuit className="text-orange-500 shrink-0" size={32} />
                    <p className="text-slate-200 text-xl md:text-2xl leading-relaxed font-medium tracking-tight">
                      "Une ordonnance rendue par un tribunal ou une autre agence gouvernementale exigeant qu'une personne comparaisse devant le tribunal."
                    </p>
                 </div>
              </div>

              <div className="space-y-4 mb-12">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EXEMPLE PRATIQUE</p>
                 <div className="bg-slate-900 border-l-4 border-orange-500 p-8 rounded-2xl shadow-inner">
                    <p className="text-slate-300 text-lg italic leading-relaxed">"The witness was served a <span className="text-white font-black underline decoration-orange-500 decoration-2 underline-offset-4">subpoena</span> to testify during the trial."</p>
                 </div>
              </div>

              <button 
                onClick={() => setLearned(true)}
                className={`w-full py-7 rounded-3xl font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 text-sm ${
                  learned ? 'bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/30 scale-95' : 'bg-orange-500 text-slate-950 shadow-2xl shadow-orange-500/20 hover:scale-[1.01] active:scale-95'
                }`}
              >
                {learned ? <CheckCircle2 size={24} /> : null}
                {learned ? 'MOT MAÎTRISÉ' : 'J\'AI APPRIS LE MOT'}
              </button>
           </div>
        </div>

        {/* Sidebar Mini-Module */}
        <div className="space-y-6">
           <div className="glass rounded-[2rem] p-8 border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <MessagesSquare size={18} className="text-orange-500" />
                EXPRESSION COURANTE
              </h3>
              <div className="space-y-8">
                 <div className="group cursor-help">
                    <p className="text-lg font-black text-white mb-2 group-hover:text-orange-500 transition-colors tracking-tight">"Beyond reasonable doubt"</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest italic font-bold">Au-delà de tout doute raisonnable</p>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="group cursor-help">
                    <p className="text-lg font-black text-white mb-2 group-hover:text-orange-500 transition-colors tracking-tight">"Burden of proof"</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest italic font-bold">La charge de la preuve</p>
                 </div>
              </div>
           </div>

           <div className="glass rounded-[2rem] p-8 border-white/5 text-center bg-orange-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-3xl rounded-full" />
              <div className="w-24 h-24 mx-auto rounded-full border-8 border-slate-900 flex items-center justify-center mb-8 relative">
                 <div className="absolute inset-0 border-8 border-orange-500 rounded-full group-hover:rotate-180 transition-transform duration-1000" style={{ clipPath: 'inset(0 0 60% 0)' }} />
                 <span className="text-3xl font-black text-white italic">40%</span>
              </div>
              <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">OBJECTIF MENSUEL</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">12 MOTS / 30 ACQUIS</p>
              <button className="mt-8 w-full py-4 bg-slate-900 border border-white/5 hover:bg-white hover:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">HISTORIQUE VOCABULAIRE</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesView;
