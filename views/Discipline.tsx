
import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  PenTool, 
  Heart, 
  Zap,
  ArrowRight,
  ShieldAlert,
  Dumbbell,
  Brain,
  CheckCircle2
} from 'lucide-react';

const Discipline: React.FC = () => {
  const [phase, setPhase] = useState<'morning' | 'evening'>('morning');
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const rituals = {
    morning: [
      { id: 1, text: "Réveil 06:00 (Pas de snooze)", icon: Zap, done: true },
      { id: 2, text: "Prière & Méditation (15 min)", icon: Heart, done: true },
      { id: 3, text: "Session Sport Intégrale", icon: Dumbbell, done: false },
    ],
    evening: [
      { id: 1, text: "Journaling : Victoires du jour", icon: PenTool, done: false },
      { id: 2, text: "Lecture Bible Chapitre 5", icon: Brain, done: false },
      { id: 3, text: "Planification Lendemain", icon: Zap, done: false },
    ]
  };

  const handleValidate = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={`space-y-8 animate-in transition-all duration-700 ${isDayClosed ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
      {/* Visual State indicator */}
      <div className="flex gap-2">
        <button 
          onClick={() => setPhase('morning')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border transition-all ${phase === 'morning' ? 'bg-amber-500 border-amber-500 text-slate-950 font-black' : 'bg-slate-900 border-white/5 text-slate-500 font-bold'}`}
        >
          <Sun size={20} /> <span className="uppercase text-xs tracking-widest">Rituel Matinal</span>
        </button>
        <button 
          onClick={() => setPhase('evening')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border transition-all ${phase === 'evening' ? 'bg-indigo-600 border-indigo-500 text-white font-black' : 'bg-slate-900 border-white/5 text-slate-500 font-bold'}`}
        >
          <Moon size={20} /> <span className="uppercase text-xs tracking-widest">Rituel Nocturne</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Rituals */}
        <div className="glass rounded-[2rem] p-10 border-white/5 relative overflow-hidden">
          <div className={`absolute top-0 right-0 p-10 opacity-5 ${phase === 'morning' ? 'text-amber-500' : 'text-indigo-400'}`}>
            {phase === 'morning' ? <Sun size={120} /> : <Moon size={120} />}
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3">
               {phase === 'morning' ? <Zap className="text-amber-500" /> : <PenTool className="text-indigo-400" />}
               {phase === 'morning' ? "3 PRIORITÉS MATIN" : "CLÔTURE DE JOURNÉE"}
            </h3>
            
            <div className="space-y-4">
               {rituals[phase].map(item => (
                 <div key={item.id} className="group flex items-center justify-between p-6 bg-slate-950/80 border border-white/5 rounded-3xl cursor-pointer hover:border-white/20 transition-all relative">
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
                          <item.icon size={22} />
                       </div>
                       <span className={`font-bold ${item.done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{item.text}</span>
                    </div>
                    {item.done && <div className="absolute top-4 right-4"><ShieldAlert size={14} className="text-amber-500" /></div>}
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.done ? 'bg-amber-500 border-amber-500' : 'border-slate-700'}`}>
                       {item.done && <CheckCircle2 size={14} className="text-slate-950" />}
                    </div>
                 </div>
               ))}
            </div>

            <button 
              onClick={handleValidate}
              className="w-full mt-10 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
            >
              {showSuccess ? <CheckCircle2 className="animate-bounce" /> : null}
              {showSuccess ? 'PROGRESSION VALIDÉE' : 'VALIDER LA PROGRESSION'}
            </button>
          </div>
        </div>

        {/* Gamification / Scores */}
        <div className="space-y-8">
           <div className="glass rounded-[2rem] p-8 border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">NIVEAU ACTUEL</h4>
              <div className="w-24 h-24 mx-auto bg-amber-500 rounded-[2.5rem] rotate-45 flex items-center justify-center border-4 border-slate-950 shadow-2xl shadow-amber-500/20 mb-10">
                 <span className="text-3xl font-black text-slate-950 -rotate-45">14</span>
              </div>
              <p className="text-xl font-black text-white mb-2 uppercase tracking-tight">VÉTÉRAN DE DISCIPLINE</p>
              <div className="flex justify-center gap-1 mb-8">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-1 bg-amber-500 rounded-full" />)}
                 <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">1,240 XP AVANT LE PROCHAIN BADGE</p>
           </div>

           <div className="glass rounded-[2rem] p-8 border-white/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                 BADGES DÉBLOQUÉS
                 <span className="text-amber-500">4 / 12</span>
              </h4>
              <div className="flex flex-wrap gap-4 justify-center">
                 {[
                   { name: "Levé tôt", icon: Zap, color: "text-amber-500" },
                   { name: "Focus 4h", icon: Brain, color: "text-blue-400" },
                   { name: "Zéro Excès", icon: ShieldAlert, color: "text-rose-400" },
                   { name: "Bible 7j", icon: Heart, color: "text-emerald-400" },
                 ].map(b => (
                    <div key={b.name} className="flex flex-col items-center gap-2">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors shadow-lg shadow-black/50">
                          <b.icon className={b.color} size={24} />
                       </div>
                       <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{b.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {isDayClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl animate-in zoom-in-95 duration-500 pointer-events-auto">
           <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-4 uppercase italic">JOURNÉE TERMINÉE.</h2>
              <button 
                onClick={() => setIsDayClosed(false)}
                className="px-12 py-5 bg-white text-slate-950 font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Retour au dashboard
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Discipline;
