
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
  ChevronRight,
  Wallet,
  BookOpen,
  Dumbbell,
  Languages,
  Cross
} from 'lucide-react';

const Settings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  
  // Profile & General
  const [name, setName] = useState('Witensky');
  const [intensity, setIntensity] = useState('Extrême');
  
  // Finance Configuration (The Balance)
  const [amciBudget, setAmciBudget] = useState(3500);
  const [dailyLimit, setDailyLimit] = useState(250);
  
  // Module Goals
  const [studyHoursGoal, setStudyHoursGoal] = useState(35);
  const [vocabMonthlyGoal, setVocabMonthlyGoal] = useState(30);
  const [weightGoal, setWeightGoal] = useState(80);
  const [bibleChaptersGoal, setBibleChaptersGoal] = useState(1);

  // System
  const [examDate, setExamDate] = useState('2024-06-15');
  const [amciDate, setAmciDate] = useState('2024-06-10');
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
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Command & Control Center</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">PANNEAU DE <span className="text-amber-500 font-outfit">CONTRÔLE</span></h2>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${
            saved ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-white text-slate-950 hover:scale-105 active:scale-95 shadow-white/5'
          }`}
        >
          {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {saved ? 'SYNC TERMINÉE' : 'APPLIQUER TOUT'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. CONFIGURATION FINANCIÈRE (LA BALANCE) */}
        <div className="glass rounded-[2.5rem] p-10 border-amber-500/20 bg-amber-500/[0.02]">
          <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Wallet size={20} /></div>
             Gestion de la Balance
          </h3>
          <div className="space-y-8">
            <div className="p-6 bg-slate-950 border border-white/5 rounded-3xl group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block italic">BUDGET TOTAL BIMESTRIEL (DH)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={amciBudget} 
                  onChange={(e) => setAmciBudget(Number(e.target.value))}
                  className="bg-transparent border-none text-3xl font-black text-white focus:outline-none w-full" 
                />
                <span className="text-amber-500 font-black">DH</span>
              </div>
            </div>
            <div className="p-6 bg-slate-950 border border-white/5 rounded-3xl group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block italic">LIMITE DE DÉPENSE QUOTIDIENNE (DH)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  value={dailyLimit} 
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="bg-transparent border-none text-3xl font-black text-white focus:outline-none w-full" 
                />
                <span className="text-amber-500 font-black">DH</span>
              </div>
              <p className="text-[8px] text-slate-500 mt-4 uppercase font-bold tracking-wider">Le système enverra une alerte si cette limite est franchie.</p>
            </div>
          </div>
        </div>

        {/* 2. OBJECTIFS DES MODULES */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
          <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Target size={20} /></div>
             Objectifs Spécifiques
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><BookOpen size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Heures d'étude / Sem.</p>
                  <p className="text-lg font-black text-white">{studyHoursGoal}h</p>
                </div>
              </div>
              <input type="range" min="10" max="60" value={studyHoursGoal} onChange={(e) => setStudyHoursGoal(Number(e.target.value))} className="accent-blue-500 w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Languages size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mots de vocabulaire / Mois</p>
                  <p className="text-lg font-black text-white">{vocabMonthlyGoal} mots</p>
                </div>
              </div>
              <input type="range" min="5" max="100" value={vocabMonthlyGoal} onChange={(e) => setVocabMonthlyGoal(Number(e.target.value))} className="accent-orange-500 w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><Dumbbell size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Poids Cible (kg)</p>
                  <p className="text-lg font-black text-white">{weightGoal} kg</p>
                </div>
              </div>
              <input type="number" value={weightGoal} onChange={(e) => setWeightGoal(Number(e.target.value))} className="bg-transparent border border-white/10 rounded-lg w-16 text-center text-sm font-black text-white py-1 focus:outline-none focus:border-rose-500" />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"><Cross size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chapitres Bible / Jour</p>
                  <p className="text-lg font-black text-white">{bibleChaptersGoal}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1,2,3,5].map(n => (
                  <button key={n} onClick={() => setBibleChaptersGoal(n)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${bibleChaptersGoal === n ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-500'}`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. PERFORMANCE ET DATES CLÉS */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
          <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Calendar size={20} /></div>
             Échéances & Intensité
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-slate-950 border border-white/5 rounded-3xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">PROCHAIN EXAMEN CRITIQUE</label>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-transparent border-none text-xl font-black text-white focus:outline-none uppercase" 
              />
            </div>
            <div className="p-6 bg-slate-950 border border-white/5 rounded-3xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">BOURSE AMCI PROCHAINE</label>
              <input 
                type="date" 
                value={amciDate}
                onChange={(e) => setAmciDate(e.target.value)}
                className="w-full bg-transparent border-none text-xl font-black text-white focus:outline-none uppercase" 
              />
            </div>
            <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-4 block">MODALITÉ DE DISCIPLINE</label>
               <div className="grid grid-cols-3 gap-3 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                  {['Normal', 'Rigoureux', 'Extrême'].map(level => (
                    <button 
                      key={level} 
                      onClick={() => setIntensity(level)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        intensity === level 
                        ? 'bg-amber-500 text-slate-950 shadow-lg' 
                        : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* 4. PRÉFÉRENCES SYSTÈME */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5">
           <h3 className="text-lg font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"><Palette size={20} /></div>
             Environnement & UI
           </h3>
           <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1">LANGUE</label>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1">THÈME</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none">
                    <option>OLED Deep Black</option>
                    <option>Slate Midnight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1">MODE FOCUS</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                  {['Souple', 'Stricte'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setFocusMode(m)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${focusMode === m ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-slate-600 mt-4 italic uppercase font-bold tracking-widest">Le mode Stricte interdit l'accès aux réseaux sociaux via l'appareil si activé.</p>
              </div>
           </div>
        </div>

        {/* 5. SÉCURITÉ ET DATA */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-10 border-white/5">
           <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-8">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Database size={20} /></div>
                  Sauvegarde & Export
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-white/5 group hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <Download className="text-emerald-500 group-hover:text-slate-950" size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Exporter Historique (.CSV)</span>
                    </div>
                    <ChevronRight className="text-slate-800 group-hover:text-slate-950" size={16} />
                  </button>
                  <button className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-white/5 group hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <Save className="text-blue-500 group-hover:text-slate-950" size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Backup Cloud (Google)</span>
                    </div>
                    <ChevronRight className="text-slate-800 group-hover:text-slate-950" size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 bg-rose-500/[0.03] border border-rose-500/20 rounded-[2rem]">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
                    <ShieldCheck size={14} /> ZONE DE DANGER CRITIQUE
                 </p>
                 <div className="space-y-4">
                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                       <Trash2 size={16} /> RÉINITIALISER TOUS LES LOGS
                    </button>
                    <p className="text-[8px] text-slate-600 text-center uppercase tracking-wider font-bold">Action irréversible. Toutes tes victoires et échecs seront effacés.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <div className="text-center p-6 bg-slate-950 rounded-[2rem] border border-white/5">
         <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">J&B, a management app built by Jose Doret Witensky</p>
      </div>
    </div>
  );
};

export default Settings;
