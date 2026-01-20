
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

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Globe className="text-orange-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Mastery of Languages</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Polyglotte & <span className="text-orange-500">Précis</span></h2>
        </div>
        <div className="flex gap-3">
           {['Anglais', 'Espagnol', 'Arabe'].map(lang => (
             <button key={lang} className="px-6 py-3 rounded-2xl glass border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-orange-500/20 transition-all">{lang}</button>
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
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">Juridical Word of the Day</span>
                <div className="flex gap-2">
                   <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><Volume2 size={20} /></button>
                   <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><Star size={20} /></button>
                </div>
              </div>

              <div className="mb-12">
                 <h3 className="text-6xl font-black text-white tracking-tighter mb-4 italic">Subpoena</h3>
                 <p className="text-slate-400 text-lg italic mb-2">/səˈpiːnə/</p>
                 <div className="flex items-center gap-3 bg-slate-950/50 p-6 rounded-3xl border border-white/5">
                    <BrainCircuit className="text-orange-500 shrink-0" size={24} />
                    <p className="text-slate-200 text-lg leading-relaxed font-medium">
                      "Une ordonnance rendue par un tribunal ou une autre agence gouvernementale exigeant qu'une personne comparaisse devant le tribunal."
                    </p>
                 </div>
              </div>

              <div className="space-y-4 mb-12">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exemple Pratique</p>
                 <div className="bg-slate-900 border-l-4 border-orange-500 p-6 rounded-2xl">
                    <p className="text-slate-300 italic">"The witness was served a <span className="text-white font-bold underline">subpoena</span> to testify during the trial."</p>
                 </div>
              </div>

              <button 
                onClick={() => setLearned(true)}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${
                  learned ? 'bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/20' : 'bg-orange-500 text-slate-950 shadow-2xl shadow-orange-500/20'
                }`}
              >
                {learned ? <CheckCircle2 /> : null}
                {learned ? 'MOT MAÎTRISÉ' : 'J\'AI APPRIS LE MOT'}
              </button>
           </div>
        </div>

        {/* Sidebar Mini-Module */}
        <div className="space-y-6">
           <div className="glass rounded-[2rem] p-8 border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <MessagesSquare size={16} className="text-orange-500" />
                Expression Courante
              </h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-sm font-bold text-white mb-2">"Beyond reasonable doubt"</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest italic">Au-delà de tout doute raisonnable</p>
                 </div>
                 <div className="h-[1px] bg-white/5" />
                 <div>
                    <p className="text-sm font-bold text-white mb-2">"Burden of proof"</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest italic">La charge de la preuve</p>
                 </div>
              </div>
           </div>

           <div className="glass rounded-[2rem] p-8 border-white/5 text-center bg-orange-500/5">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-orange-500/20 flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 border-4 border-orange-500 rounded-full" style={{ clipPath: 'inset(0 0 60% 0)' }} />
                 <span className="text-2xl font-black text-white">40%</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Objectif Mensuel</h4>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">12 mots / 30 acquis</p>
              <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-all">Historique Vocabulaire</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesView;
