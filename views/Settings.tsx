
import React, { useState } from 'react';
import { 
  X, Save, CheckCircle2, Palette, Eye, Cpu, Download, Landmark, Banknote, CalendarDays, Coins, Layers, ToggleLeft, Globe, HardDrive, Clock, BellRing, AlertCircle, ShieldAlert, Bell, Timer
} from 'lucide-react';

const Settings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  
  const [accentColor, setAccentColor] = useState('amber');
  const [uiDensity, setUiDensity] = useState('Balanced');
  const [glowIntensity, setGlowIntensity] = useState(60);
  const [ghostMode, setGhostMode] = useState(false);

  const [activeModules, setActiveModules] = useState({
    finance: true, studies: true, discipline: true, sport: true, languages: true, bible: true
  });

  const [amciMonthly, setAmciMonthly] = useState(3500);
  const [nextAmciDate, setNextAmciDate] = useState('2024-11-10');
  const [lastAmountReceived, setLastAmountReceived] = useState(3500);

  // Nouvel état pour les notifications et alertes
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [expenseThreshold, setExpenseThreshold] = useState(50);
  const [deadlineAlertTime, setDeadlineAlertTime] = useState('24h');
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleModule = (module: keyof typeof activeModules) => {
    setActiveModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const handleExport = () => {
    const data = { accentColor, activeModules, amciMonthly, nextAmciDate, alerts: { expenseThreshold, deadlineAlertTime } };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jb-control-backup.json';
    a.click();
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Cpu size={16} /></div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Kernel Engine v3.2</span>
           </div>
           <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">COMMAND <span className="text-amber-500 font-outfit">CORE</span></h2>
        </div>
        <div className="flex gap-4">
           <button onClick={handleExport} className="p-5 bg-white/5 border border-white/5 text-slate-400 rounded-2xl hover:text-white transition-all"><Download size={20} /></button>
           <button 
            onClick={handleSave}
            className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-3xl ${
              saved ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30' : 'bg-white text-slate-950 hover:scale-105 active:scale-95'
            }`}
           >
             {saved ? <CheckCircle2 size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
             {saved ? 'SYSTÈME SYNCHRONISÉ' : 'DÉPLOYER CONFIGURATION'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section Bourse */}
        <div className="lg:col-span-3 glass rounded-[3rem] p-10 border-white/5 space-y-10 bg-emerald-500/[0.02]">
           <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-4">
               <Landmark size={22} className="text-emerald-500" /> Gestion Bourse AMCI
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">ALLOCATION MENSUELLE (DH)</label>
                <div className="relative">
                   <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={20} />
                   <input type="number" value={amciMonthly} onChange={(e) => setAmciMonthly(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-black text-white outline-none focus:border-emerald-500/50" />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">DATE PROCHAINE RÉCEPTION</label>
                <div className="relative">
                   <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500/50" size={20} />
                   <input type="date" value={nextAmciDate} onChange={(e) => setNextAmciDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-black text-white outline-none focus:border-amber-500/50 uppercase" />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">DERNIÈRE QUANTITÉ REÇUE</label>
                <div className="relative">
                   <Coins className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500/50" size={20} />
                   <input type="number" value={lastAmountReceived} onChange={(e) => setLastAmountReceived(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-black text-white outline-none focus:border-blue-500/50" />
                </div>
             </div>
          </div>
        </div>

        {/* NOUVELLE SECTION : Alertes et Notifications */}
        <div className="lg:col-span-3 glass rounded-[3rem] p-10 border-rose-500/20 space-y-10 bg-rose-500/[0.02]">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-4">
               <BellRing size={22} className="text-rose-500 animate-pulse" /> Notifications & Alertes Tactiques
            </h3>
            <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Alertes Système</span>
              <button onClick={() => setAlertsEnabled(!alertsEnabled)} className={`w-12 h-6 rounded-full transition-all relative ${alertsEnabled ? 'bg-rose-500' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alertsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-rose-500" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">SEUIL DÉPASSEMENT FINANCIER</label>
                </div>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500/50 font-black text-xs">DH</div>
                   <input 
                    type="number" 
                    value={expenseThreshold} 
                    onChange={(e) => setExpenseThreshold(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-black text-white outline-none focus:border-rose-500/50 transition-all" 
                    placeholder="Ex: 50"
                   />
                   <p className="text-[8px] text-slate-600 mt-2 uppercase font-bold px-1 italic">Alerter si une dépense dépasse le budget journalier de {expenseThreshold} DH</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Timer size={14} className="text-amber-500" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">RAPPEL ÉCHÉANCE MISSIONS</label>
                </div>
                <div className="relative">
                   <select 
                    value={deadlineAlertTime} 
                    onChange={(e) => setDeadlineAlertTime(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black text-white outline-none appearance-none focus:border-amber-500/50"
                   >
                     <option value="6h">6 HEURES AVANT</option>
                     <option value="12h">12 HEURES AVANT</option>
                     <option value="24h">24 HEURES AVANT (CONSEILLÉ)</option>
                     <option value="48h">48 HEURES AVANT</option>
                   </select>
                   <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                     <Bell size={16} />
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5 group hover:border-rose-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${criticalAlerts ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20' : 'bg-slate-900 text-slate-500'}`}><ShieldAlert size={18} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ALERTES CRITIQUES</p>
                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Interruption IA en cas de risque</p>
                  </div>
                </div>
                <button onClick={() => setCriticalAlerts(!criticalAlerts)} className={`w-12 h-7 rounded-full transition-all relative ${criticalAlerts ? 'bg-rose-500' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${criticalAlerts ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-white/5 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-4">
               <Palette size={22} className="text-purple-500" /> Engine Graphique
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">DENSITÉ DE L'INTERFACE</label>
                <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-white/5">
                   {['Compact', 'Balanced', 'Immersive'].map(d => (
                     <button key={d} onClick={() => setUiDensity(d)} className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${uiDensity === d ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{d}</button>
                   ))}
                </div>
             </div>
             <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-white/5 group hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${ghostMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}><Eye size={18} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MODE GHOST</p>
                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Masquage des flux financiers</p>
                  </div>
                </div>
                <button onClick={() => setGhostMode(!ghostMode)} className={`w-12 h-7 rounded-full transition-all relative ${ghostMode ? 'bg-amber-500' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${ghostMode ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 border-white/5 space-y-8">
          <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-4">
             <Layers size={22} className="text-blue-500" /> Architecture Modules
          </h3>
          <div className="space-y-3">
             {Object.entries(activeModules).map(([key, value]) => (
                <button key={key} onClick={() => toggleModule(key as any)} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${value ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-950 border-white/5 opacity-40'}`}>
                  <span className="text-xs font-black text-white uppercase tracking-widest">{key}</span>
                  {value ? <ToggleLeft className="text-blue-500 rotate-180" size={24} /> : <ToggleLeft className="text-slate-700" size={24} />}
                </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Version Kernel', val: '3.2.0-STABLE', icon: Cpu },
           { label: 'Status Stockage', val: '1.2 MB / 5.0 MB', icon: HardDrive },
           { label: 'Dernière Sync', val: 'Maintenant', icon: Clock },
           { label: 'Region Kernel', val: `FR / DH`, icon: Globe },
         ].map((info, i) => (
           <div key={i} className="p-6 bg-[#020617] rounded-3xl border border-white/5 flex items-center gap-4">
              <info.icon size={16} className="text-slate-700" />
              <div>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{info.label}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{info.val}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Settings;
