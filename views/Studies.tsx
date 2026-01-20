
import React from 'react';
import { 
  BookText, 
  Gavel, 
  Scale, 
  History, 
  Flame, 
  Target,
  ArrowRight
} from 'lucide-react';
import { LawSubject } from '../types';

const subjects: LawSubject[] = [
  { id: '1', name: "Droit des Obligations", progress: 75, stressLevel: 'high', chaptersTotal: 12, chaptersDone: 9 },
  { id: '2', name: "Droit Administratif", progress: 45, stressLevel: 'medium', chaptersTotal: 8, chaptersDone: 4 },
  { id: '3', name: "Introduction au Droit", progress: 90, stressLevel: 'low', chaptersTotal: 10, chaptersDone: 9 },
  { id: '4', name: "Droit Constitutionnel", progress: 30, stressLevel: 'high', chaptersTotal: 15, chaptersDone: 5 },
];

const Studies: React.FC = () => {
  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Faculté de <span className="text-amber-500">Droit</span></h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Lex est quod notamus</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div key={sub.id} className="glass rounded-[2rem] p-8 group hover:border-amber-500/20 transition-all duration-500 border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  sub.stressLevel === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                  sub.stressLevel === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                } group-hover:scale-110 transition-transform`}>
                  <Scale size={28} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stress</p>
                   <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                     sub.stressLevel === 'high' ? 'bg-rose-500/20 text-rose-500' : 
                     sub.stressLevel === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                   }`}>
                     {sub.stressLevel}
                   </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{sub.name}</h3>
              <p className="text-xs text-slate-400 mb-8">Chapitres complétés : <span className="text-white font-bold">{sub.chaptersDone} / {sub.chaptersTotal}</span></p>
            </div>

            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                   <span>Avancement</span>
                   <span className="text-white">{sub.progress}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${
                       sub.progress > 80 ? 'bg-emerald-500' : sub.progress > 40 ? 'bg-amber-500' : 'bg-rose-500'
                     }`}
                     style={{ width: `${sub.progress}%` }}
                   />
                 </div>
               </div>
               <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  Continuer l'étude <ArrowRight size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2rem] p-10 border-amber-500/10 relative overflow-hidden">
         <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-4">Temps d'Étude Hebdomadaire</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Tu as étudié <span className="text-amber-500 font-bold">28 heures</span> cette semaine. C'est 4 heures de plus que la semaine dernière. Maintiens ce rythme d'excellence.</p>
              <div className="grid grid-cols-7 gap-2">
                 {[4, 6, 2, 5, 8, 3, 0].map((h, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-950 rounded-lg h-24 relative overflow-hidden border border-white/5">
                         <div className="absolute bottom-0 left-0 right-0 bg-amber-500 rounded-t-lg transition-all duration-1000" style={{ height: `${(h/8)*100}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</span>
                   </div>
                 ))}
              </div>
            </div>
            <div className="w-48 h-48 rounded-full border-8 border-slate-900 p-2 flex items-center justify-center text-center relative group">
               <div className="absolute inset-0 border-8 border-amber-500 rounded-full" style={{ clipPath: 'inset(0 0 25% 0)' }} />
               <div>
                  <span className="text-3xl font-black text-white block">75%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Ready</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Studies;
