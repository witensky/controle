
import React from 'react';
import { 
  Cross, 
  Book, 
  PenTool, 
  Flame, 
  Calendar,
  CloudSun,
  ChevronRight
} from 'lucide-react';

const Bible: React.FC = () => {
  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="w-16 h-16 bg-slate-900 mx-auto rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Cross size={32} className="text-slate-400" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Lumière & <span className="text-slate-500">Sagesse</span></h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed italic italic">"Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." - Psaume 119:105</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Reading Plan */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lecture d'aujourd'hui</p>
                <h3 className="text-3xl font-black text-white tracking-tight">Genèse, Chapitre 12</h3>
              </div>
              <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 text-center">
                 <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jour</p>
                    <p className="text-lg font-black text-white">45 / 365</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-950/80 p-10 rounded-[2rem] border border-white/5 mb-10 leading-relaxed text-lg text-slate-300 font-serif">
              "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction."
           </div>

           <div className="flex gap-4">
              <button className="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-white/5">
                Marquer comme lu
              </button>
              <button className="p-5 bg-slate-900 rounded-3xl border border-white/5 text-slate-400 hover:text-white transition-all">
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
                 <h4 className="font-bold text-white uppercase text-xs tracking-widest">Santé Mentale</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">Comment te sens-tu spirituellement et mentalement aujourd'hui ?</p>
              <div className="grid grid-cols-4 gap-2 mb-8">
                 {['😔', '😐', '🙂', '🔥'].map((emoji, i) => (
                    <button key={i} className="aspect-square rounded-2xl bg-slate-950 flex items-center justify-center text-xl hover:bg-white/5 transition-all border border-white/5">{emoji}</button>
                 ))}
              </div>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest group hover:bg-white/10 transition-all">
                 Journal de Gratitude <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Calendar size={20} />
                 </div>
                 <h4 className="font-bold text-white uppercase text-xs tracking-widest">Historique</h4>
              </div>
              <div className="flex justify-between gap-1">
                 {[1,1,1,0,1,1,1].map((v, i) => (
                    <div key={i} className={`flex-1 h-12 rounded-lg border border-white/5 ${v ? 'bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.2)]' : 'bg-slate-950 opacity-20'}`} />
                 ))}
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4 text-center">Assiduité 7 derniers jours</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Bible;
