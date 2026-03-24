
import React, { useMemo } from 'react';
import { Sparkles, Clock, Activity, Brain, Dumbbell, Coffee } from 'lucide-react';

const PlannerHUD: React.FC = () => {
    // Simple energy-based slot prediction logic
    const now = new Date();
    const currentHour = now.getHours();

    const suggestedSlots = useMemo(() => {
        // Basic heuristic: 
        // - Morning (6-10): Extreme Energy -> Deep Work / Study
        // - Mid-day (11-14): Lowering Energy -> Admin / Chores
        // - Afternoon (15-18): Rebound -> Sport / Learning
        // - Evening (19-22): Low/Creative -> Spirit / Bible / Languages

        const slots = [];

        if (currentHour < 10) {
            slots.push({ title: 'Deep Work: Études pénales', category: 'Studies', type: 'High Intensity', icon: Brain, color: 'text-blue-500' });
            slots.push({ title: 'Régularisation Admin', category: 'Admin', type: 'Maintenance', icon: Clock, color: 'text-slate-400' });
        } else if (currentHour < 14) {
            slots.push({ title: 'Gestion Finance & AMCI', category: 'Finance', type: 'Medium Intensity', icon: Activity, color: 'text-amber-500' });
            slots.push({ title: 'Pause Récupération', category: 'Mental', type: 'Rest', icon: Coffee, color: 'text-emerald-500' });
        } else if (currentHour < 18) {
            slots.push({ title: 'Séance Renforcement', category: 'Sport', type: 'Physical', icon: Dumbbell, color: 'text-rose-500' });
            slots.push({ title: 'Acquisition Langues', category: 'Languages', type: 'Learning', icon: Brain, color: 'text-purple-500' });
        } else {
            slots.push({ title: 'Méditation & Bible', category: 'Spirit', type: 'Spiritual', icon: Sparkles, color: 'text-amber-500' });
            slots.push({ title: 'Planification J+1', category: 'Admin', type: 'Planning', icon: Clock, color: 'text-slate-400' });
        }

        return slots;
    }, [currentHour]);

    return (
        <div className="glass rounded-[2rem] p-8 border-blue-500/20 bg-blue-500/[0.03] flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-blue-500"><Sparkles size={100} /></div>

            <div className="relative z-10">
                <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-3 mb-1">
                    <Sparkles size={20} className="text-blue-400" /> Planificateur Intelligent
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-8">Slots optimaux basés sur votre rythme</p>

                <div className="space-y-4">
                    {suggestedSlots.map((slot, i) => (
                        <div key={i} className="group p-5 bg-slate-950/80 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 bg-slate-900 rounded-lg ${slot.color}`}>
                                        <slot.icon size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{slot.title}</h4>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{slot.type}</span>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-blue-500/10 rounded-md">
                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">OPTIDATA</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 py-4 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                    Générer Planning Complet
                </button>
            </div>
        </div>
    );
};

export default PlannerHUD;
