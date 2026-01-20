
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Zap,
  ChevronRight,
  Activity,
  History,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const volumeData = [
  { day: 'Lun', volume: 2500 },
  { day: 'Mar', volume: 3200 },
  { day: 'Mer', volume: 0 },
  { day: 'Jeu', volume: 2800 },
  { day: 'Ven', volume: 4100 },
  { day: 'Sam', volume: 1500 },
  { day: 'Dim', volume: 0 },
];

const Sport: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Dumbbell className="text-rose-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Athletic Excellence</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">FORCE & <span className="text-rose-500">RIGUEUR</span></h2>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <Flame className="text-orange-500" size={24} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streak</p>
                 <p className="text-lg font-black text-white">4 Jours</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Workout of the day */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 text-rose-500 group-hover:scale-125 transition-transform duration-1000">
             <Activity size={200} />
           </div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">Aujourd'hui : Push Day</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Durée : 60 min</span>
              </div>

              <div className="space-y-6 mb-12">
                 {[
                   { name: "Bench Press", sets: "4 x 10", weight: "80kg" },
                   { name: "Shoulder Press", sets: "3 x 12", weight: "24kg" },
                   { name: "Lateral Raises", sets: "4 x 15", weight: "10kg" },
                   { name: "Tricep Pushdowns", sets: "3 x 15", weight: "35kg" },
                 ].map((ex, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-950/50 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group/item cursor-pointer">
                      <div className="flex items-center gap-6">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-rose-500 font-black border border-white/5 group-hover/item:bg-rose-500 group-hover/item:text-slate-950 transition-all">{i+1}</div>
                         <h4 className="text-lg font-bold text-white group-hover/item:translate-x-1 transition-transform">{ex.name}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-white">{ex.sets}</p>
                         <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{ex.weight}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="w-full py-6 bg-rose-500 text-slate-950 font-black uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95">
                DÉBUTER LA SÉANCE
              </button>
           </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
           <div className="glass rounded-[2rem] p-8 border-white/5 overflow-hidden">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <TrendingUp size={16} className="text-rose-500" />
                VOLUME HEBDOMADAIRE
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <XAxis dataKey="day" hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                    <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={12}>
                      {volumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.volume > 0 ? '#f43f5e' : '#1e293b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="glass rounded-[2rem] p-8 border-white/5 bg-emerald-500/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Zap size={20} className="animate-pulse" />
                 </div>
                 <h4 className="font-black text-white uppercase text-[10px] tracking-widest">SUIVI POIDS</h4>
              </div>
              <div className="text-center py-4">
                 <span className="text-5xl font-black text-white tracking-tighter">78.5 <span className="text-lg text-emerald-500 italic">KG</span></span>
                 <p className="text-[9px] text-slate-500 uppercase font-black mt-4 tracking-[0.2em]">OBJECTIF : 80 KG (PRISE DE MASSE)</p>
              </div>
           </div>

           <button 
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center justify-between p-6 bg-slate-900/50 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group hover:bg-white hover:text-slate-950 transition-all border border-white/5"
           >
              HISTORIQUE DES SÉANCES <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in zoom-in-95">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Historique <span className="text-rose-500">Athlétique</span></h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               {[
                 { date: "Hier", session: "Pull Day", volume: "4100 kg" },
                 { date: "Mercredi", session: "Leg Day", volume: "6200 kg" },
                 { date: "Mardi", session: "Push Day", volume: "3200 kg" },
                 { date: "Lundi", session: "Pull Day", volume: "2500 kg" },
               ].map((h, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                       <History className="text-rose-500" size={18} />
                       <div>
                          <p className="text-sm font-bold text-white">{h.session}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{h.date}</p>
                       </div>
                    </div>
                    <span className="text-sm font-black text-white">{h.volume}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sport;
