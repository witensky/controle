
import React, { useState } from 'react';
import { 
  BookText, 
  Gavel, 
  Scale, 
  History, 
  Flame, 
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { LawSubject } from '../types';

const subjects: LawSubject[] = [
  { id: '1', name: "Droit des Obligations", progress: 75, stressLevel: 'high', chaptersTotal: 12, chaptersDone: 9 },
  { id: '2', name: "Droit Administratif", progress: 45, stressLevel: 'medium', chaptersTotal: 8, chaptersDone: 4 },
  { id: '3', name: "Introduction au Droit", progress: 90, stressLevel: 'low', chaptersTotal: 10, chaptersDone: 9 },
  { id: '4', name: "Droit Constitutionnel", progress: 30, stressLevel: 'high', chaptersTotal: 15, chaptersDone: 5 },
];

const Studies: React.FC = () => {
  const [activeSession, setActiveSession] = useState<LawSubject | null>(null);

  const startSession = (sub: LawSubject) => {
    setActiveSession(sub);
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">FACULTÉ DE <span className="text-amber-500 font-outfit">DROIT</span></h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-1">LEX EST QUOD NOTAMUS</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <Flame className="text-orange-500 animate-pulse" size={24} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Focus Streak</p>
                 <p className="text-lg font-black text-white">14 Jours</p>
              </div>
           </div>
           <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <Target className="text-amber-500" size={24} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Moyenne visée</p>
                 <p className="text-lg font-black text-white">16/20</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {subjects.map((sub) => (
          <div key={sub.id} className="glass rounded-[2.5rem] p-8 group hover:border-amber-500/20 transition-all duration-500 border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  sub.stressLevel === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                  sub.stressLevel === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                } group-hover:scale-110 transition-transform shadow-lg shadow-black/40`}>
                  <Scale size={28} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">STRESS</p>
                   <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${
                     sub.stressLevel === 'high' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 
                     sub.stressLevel === 'medium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                   }`}>
                     {sub.stressLevel}
                   </span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">{sub.name}</h3>
              <p className="text-[11px] text-slate-400 mb-8 uppercase tracking-widest font-bold">Chapitres complétés : <span className="text-white">{sub.chaptersDone} / {sub.chaptersTotal}</span></p>
            </div>

            <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                   <span>AVANCEMENT</span>
                   <span className="text-white">{sub.progress}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${
                       sub.progress > 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                       sub.progress > 40 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-rose-500'
                     }`}
                     style={{ width: `${sub.progress}%` }}
                   />
                 </div>
               </div>
               <button 
                onClick={() => startSession(sub)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900/50 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border border-white/5 hover:bg-white hover:text-slate-950 transition-all group-hover:shadow-xl group-hover:shadow-black/20"
               >
                  CONTINUER L'ÉTUDE <ArrowRight size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Study Session Modal Overlay */}
      {activeSession && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-3xl text-center space-y-12">
              <button 
                onClick={() => setActiveSession(null)}
                className="absolute top-10 right-10 p-4 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
              >
                <X size={32} />
              </button>
              
              <div className="space-y-4">
                <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-xs">Session active</span>
                <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase">{activeSession.name}</h2>
              </div>

              <div className="flex items-center justify-center gap-20">
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Temps écoulé</p>
                    <span className="text-6xl font-black text-white font-mono">25:00</span>
                 </div>
                 <div className="w-px h-24 bg-white/5" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Objectif</p>
                    <span className="text-2xl font-black text-amber-500 uppercase italic">Chapitre {activeSession.chaptersDone + 1}</span>
                 </div>
              </div>

              <div className="flex gap-4 justify-center">
                 <button className="px-12 py-6 bg-amber-500 text-slate-950 font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">PAUSE</button>
                 <button 
                  onClick={() => setActiveSession(null)}
                  className="px-12 py-6 bg-rose-500 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                 >
                   TERMINER
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Studies;
