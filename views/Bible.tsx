
import React, { useState } from 'react';
import { 
  Cross, 
  Book, 
  PenTool, 
  Flame, 
  Calendar,
  CloudSun,
  ChevronRight,
  X,
  CheckCircle2
} from 'lucide-react';

const Bible: React.FC = () => {
  const [showJournal, setShowJournal] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [isRead, setIsRead] = useState(false);

  const saveJournal = () => {
    setShowJournal(false);
    // Simulation d'enregistrement
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="w-16 h-16 bg-slate-900 mx-auto rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-xl shadow-black/50">
          <Cross size={32} className="text-slate-500" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">LUMIÈRE & <span className="text-slate-500 font-outfit">SAGESSE</span></h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed italic opacity-80">"Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." - Psaume 119:105</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Reading Plan */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">LECTURE D'AUJOURD'HUI</p>
                <h3 className="text-3xl font-black text-white tracking-tight italic">Genèse, Chapitre 12</h3>
              </div>
              <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-white/5 flex flex-col items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">JOUR</p>
                <p className="text-lg font-black text-white">45 / 365</p>
              </div>
           </div>

           <div className="bg-slate-950/80 p-10 rounded-[2rem] border border-white/5 mb-10 leading-relaxed text-lg text-slate-300 font-serif italic relative">
              <span className="absolute -top-4 -left-2 text-6xl text-white/5 font-serif select-none">"</span>
              "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction."
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setIsRead(!isRead)}
                className={`flex-1 py-5 font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 ${isRead ? 'bg-emerald-500 text-slate-950' : 'bg-white text-slate-950 hover:scale-[1.01]'}`}
              >
                {isRead && <CheckCircle2 size={20} />}
                {isRead ? 'MARQUÉ COMME LU' : 'MARQUER COMME LU'}
              </button>
              <button 
                onClick={() => setShowJournal(true)}
                className="p-5 bg-slate-900 rounded-3xl border border-white/5 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/50"
              >
                <PenTool size={24} />
              </button>
           </div>
        </div>

        {/* Mental Health Sidebar */}
        <div className="space-y-6">
           <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-indigo-500/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <CloudSun size={20} />
                 </div>
                 <h4 className="font-black text-white uppercase text-[10px] tracking-widest">SANTÉ MENTALE</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-8 leading-relaxed font-medium">Comment te sens-tu spirituellement et mentalement aujourd'hui ?</p>
              <div className="grid grid-cols-4 gap-2 mb-8">
                 {['😔', '😐', '🙂', '🔥'].map((emoji, i) => (
                    <button key={i} className="aspect-square rounded-2xl bg-slate-950 flex items-center justify-center text-xl hover:bg-white/5 transition-all border border-white/5 shadow-inner">
                      {emoji}
                    </button>
                 ))}
              </div>
              <button className="w-full flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest group hover:bg-white/5 hover:text-white transition-all border border-white/5">
                 JOURNAL DE GRATITUDE <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Calendar size={20} />
                 </div>
                 <h4 className="font-black text-white uppercase text-[10px] tracking-widest">HISTORIQUE</h4>
              </div>
              <div className="flex justify-between gap-2">
                 {[1,1,1,0,1,1,1].map((v, i) => (
                    <div key={i} className={`flex-1 h-12 rounded-xl border border-white/5 transition-all ${v ? 'bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.25)]' : 'bg-slate-950 opacity-20'}`} />
                 ))}
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 text-center">ASSIDUITÉ 7 DERNIERS JOURS</p>
           </div>
        </div>
      </div>

      {/* Journaling Modal */}
      {showJournal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 flex flex-col h-[70vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase italic">Journal <span className="text-amber-500 font-outfit">Intime</span></h3>
                <button onClick={() => setShowJournal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
              </div>
              <textarea 
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Exprime tes pensées, tes défis et tes victoires spirituelles..."
                className="flex-1 bg-slate-950/50 rounded-3xl p-8 text-slate-200 font-serif text-lg leading-relaxed focus:outline-none border border-white/5 focus:border-amber-500/30 transition-colors resize-none mb-8"
              />
              <button 
                onClick={saveJournal}
                className="w-full py-5 bg-amber-500 text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                SAUVEGARDER LA RÉFLEXION
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
