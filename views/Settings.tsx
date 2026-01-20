
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Save,
  Clock,
  Zap,
  CheckCircle2,
  Globe,
  Palette,
  Target,
  Database,
  Trash2,
  Download,
  /* Added missing ChevronRight icon import */
  ChevronRight
} from 'lucide-react';

const Settings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('Witensky');
  const [examDate, setExamDate] = useState('2024-06-15');
  const [amciDate, setAmciDate] = useState('2024-06-10');
  const [intensity, setIntensity] = useState('Extrême');
  const [lang, setLang] = useState('Français');
  const [theme, setTheme] = useState('OLED Deep Black');
  const [focusMode, setFocusMode] = useState('Stricte');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <SettingsIcon className="text-slate-500" size={18} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">System Configuration</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">PARAMÈTRES <span className="text-amber-500 font-outfit">SYSTÈME</span></h2>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${
            saved ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-white text-slate-950 hover:scale-105 active:scale-95 shadow-white/5'
          }`}
        >
          {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {saved ? 'ENREGISTRÉ' : 'SAUVEGARDER'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
          <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><User size={20} /></div>
             Profil Performance
          </h3>
          <div className="space-y-8">
            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Nom Complet</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-none text-xl font-black text-white focus:outline-none" 
              />
            </div>
            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Objectif Moyenne Académique</label>
              <select className="w-full bg-transparent border-none text-xl font-black text-white focus:outline-none appearance-none cursor-pointer">
                <option className="bg-slate-900">14/20 - Satisfaisant</option>
                <option className="bg-slate-900">16/20 - Excellent</option>
                <option className="bg-slate-900" selected>18/20 - Majeur de Promo</option>
              </select>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">NIVEAU D'INTENSITÉ DISCIPLINE</label>
               <div className="grid grid-cols-3 gap-3 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                  {['Normal', 'Rigoureux', 'Extrême'].map(level => (
                    <button 
                      key={level} 
                      onClick={() => setIntensity(level)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                        intensity === level 
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                        : 'bg-transparent border-transparent text-slate-500 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Adjustments & Dates */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
          <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Calendar size={20} /></div>
             Ajustements Temporels
          </h3>
          <div className="space-y-8">
            <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 group">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block group-hover:text-blue-500 transition-colors">DATE PROCHAIN EXAMEN</label>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-black text-white focus:outline-none uppercase italic" 
              />
            </div>
            <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 group">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block group-hover:text-blue-500 transition-colors">RENOUVELLEMENT BOURSE AMCI</label>
              <input 
                type="date" 
                value={amciDate}
                onChange={(e) => setAmciDate(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-black text-white focus:outline-none uppercase italic" 
              />
            </div>
            <div className="p-8 bg-slate-950 border border-white/5 rounded-[2rem] flex flex-col gap-6">
              <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">ENTRAÎNEMENT SPORTIF</label>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">FRÉQUENCE</p>
                    <span className="text-xl font-black text-white">5j / Semaine</span>
                 </div>
                 <div className="w-px h-10 bg-white/5" />
                 <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1 text-right">HEURE FOCUS</p>
                    <span className="text-xl font-black text-white">17:30</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Interface & UX Preferences */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
           <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Palette size={20} /></div>
             Préférences Système
           </h3>
           <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1 flex items-center gap-2">
                  <Globe size={14} /> LANGUE DE L'INTERFACE
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                  {['Français', 'English'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => setLang(l)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-orange-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1 flex items-center gap-2">
                   <Palette size={14} /> THÈME VISUEL
                </label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option className="bg-slate-900">OLED Deep Black</option>
                  <option className="bg-slate-900">Slate Midnight Blue</option>
                  <option className="bg-slate-900">Carbon Gray</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1 flex items-center gap-2">
                   <Target size={14} /> MODE FOCUS DISCIPLINE
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                  {['Flexible', 'Stricte'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setFocusMode(m)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${focusMode === m ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-slate-600 mt-3 italic uppercase tracking-wider font-bold">Le mode Stricte verrouille certaines fonctions si les objectifs du jour ne sont pas validés.</p>
              </div>
           </div>
        </div>

        {/* NEW: Data & Security */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Database size={20} /></div>
                Gestion des Données
              </h3>
              <div className="space-y-6">
                 <button className="w-full flex items-center justify-between p-6 bg-slate-950/50 rounded-2xl border border-white/5 group hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                       <Download className="text-emerald-500 group-hover:text-slate-950" size={20} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-950">Exporter l'historique complet (.CSV)</span>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-slate-950" size={16} />
                 </button>
                 
                 <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] space-y-4">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <ShieldCheck size={14} /> ZONE DE DANGER
                    </p>
                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-600/10">
                       <Trash2 size={16} /> Réinitialiser tous les scores
                    </button>
                    <p className="text-[8px] text-slate-600 text-center uppercase tracking-wider font-bold">Cette action est irréversible. Toutes tes statistiques seront remises à zéro.</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-white/5 text-center">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Version du Système : J&B-CORE-2.5.0</p>
           </div>
        </div>

        {/* Notifications (Keep existing but refined) */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5">
           <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><Bell size={20} /></div>
             NOTIFICATIONS & RAPPELS
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Prière & Bible", time: "06:15", active: true },
                { label: "Session d'Études", time: "09:00", active: true },
                { label: "Focus Sport", time: "17:30", active: true },
                { label: "Bilan Financier", time: "20:00", active: false },
                { label: "Apprentissage Langue", time: "11:00", active: true },
                { label: "Clôture Journée", time: "22:00", active: true },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-white/5 group hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`w-2.5 h-2.5 rounded-full ${notif.active ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                     <div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{notif.label}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black mt-1">
                           <Clock size={12} /> {notif.time}
                        </div>
                     </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${notif.active ? 'bg-emerald-500/20' : 'bg-slate-950'}`}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${notif.active ? 'right-1 bg-emerald-500' : 'left-1 bg-slate-700'}`} />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
