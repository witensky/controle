
import React, { useState, useEffect } from 'react';
import { 
  Save, CheckCircle2, Cpu, Download, Landmark, Banknote, CalendarDays, Coins, Loader2, AlertCircle, Sparkles, ShieldCheck, Zap, Activity, BrainCircuit, Bell, Database, FileJson, HardDrive, History, Lock, MessageSquare, Radio, RefreshCw, Server, Settings2, Share2, Timer, Trash2, UserCheck, Volume2, BarChart3
} from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Existing States
  const [amciMonthly, setAmciMonthly] = useState(3500);
  const [nextAmciDate, setNextAmciDate] = useState('2024-11-10');
  const [userName, setUserName] = useState('');
  const [aiAutonomousMode, setAiAutonomousMode] = useState(true);

  // New Tactical Options (30 options)
  const [options, setOptions] = useState({
    // Protocole de Mission
    defaultMissionDuration: 25,
    autoStartNextMission: false,
    strictFocusMode: true,
    breakDuration: 5,
    longBreakFrequency: 4,
    archiveCompletedDelay: 24, // hours
    enablePriorityBoost: true,
    taskLimitDaily: 12,
    autoCategorization: true,
    energyThresholdWarning: 3,

    // Configuration Analytique
    reportGenerationDay: 'Dimanche',
    precisionLevel: 'High',
    enableAuditLogs: true,
    dataRetentionMonths: 12,
    autoExportCSV: false,
    syncFrequency: 15, // minutes
    calculateImpactScore: true,
    trackIdleTime: false,
    performanceGoal: 85,
    benchmarkComparison: true,

    // Communication & Alertes
    systemVolume: 50,
    notificationLevel: 'Critical Only',
    hapticFeedback: true,
    statusReportFrequency: 'Weekly',
    enableVoiceFeedback: false,
    alertOnBudgetOverrun: true,
    ritualReminders: true,
    morningRitualTime: '06:00',
    eveningRitualTime: '22:00',
    terminalLogging: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUserName(data.username || '');
        setAmciMonthly(Number(data.amci_monthly_amount) || 3500);
        setNextAmciDate(data.next_amci_date || '2024-11-10');
        if (data.settings_config) {
          setOptions(prev => ({ ...prev, ...data.settings_config }));
        }
      }
    } catch (err) {
      handleSupabaseError(err, 'fetchProfile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: userName,
          amci_monthly_amount: amciMonthly,
          next_amci_date: nextAmciDate,
          settings_config: options,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Erreur de déploiement configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateOption = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
       onClick={onClick}
       className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-blue-500' : 'bg-slate-800'}`}
    >
       <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Cpu size={16} /></div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Configuration du Noyau</span>
           </div>
           <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">COMMAND <span className="text-amber-500 font-outfit">CORE</span></h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-3xl ${
            saved ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30' : 'bg-white text-slate-950 hover:scale-105 active:scale-95'
          }`}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? 'CONFIG SAUVEGARDÉE' : 'DÉPLOYER CONFIGURATION'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IA GOVERNANCE (Existing) */}
        <div className="glass rounded-[3rem] p-10 border-blue-500/20 bg-blue-500/[0.03] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-blue-500 group-hover:scale-125 transition-transform duration-1000">
              <BrainCircuit size={180} />
           </div>
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-4">
                    <Sparkles size={22} className="text-blue-400" /> Gouvernance IA
                 </h3>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Niveau 5 - Accès Total</span>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="flex items-center justify-between p-6 bg-slate-950/80 border border-white/5 rounded-[1.8rem]">
                    <div className="flex items-center gap-4">
                       <Zap size={18} className="text-amber-500" />
                       <div>
                          <p className="text-[10px] font-black text-white uppercase italic">Mode Autonome</p>
                          <p className="text-[8px] text-slate-500 uppercase font-black">Autoriser l'IA à suggérer & éditer</p>
                       </div>
                    </div>
                    <Toggle active={aiAutonomousMode} onClick={() => setAiAutonomousMode(!aiAutonomousMode)} />
                 </div>
                 <div className="p-6 border border-dashed border-white/10 rounded-[1.8rem] space-y-4">
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                       L'intelligence artificielle Gemini Pro a reçu l'autorisation de sceller des missions, gérer les flux financiers AMCI et réviser les configurations du noyau en temps réel.
                    </p>
                    <button className="w-full py-4 bg-white/5 text-blue-400 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2">
                       <Activity size={14} /> Lancer Audit d'Optimisation IA
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Bourse AMCI (Existing) */}
        <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40">
           <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
              <Landmark size={22} className="text-emerald-500" /> Bourse AMCI
           </h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">ALLOCATION MENSUELLE (DH)</label>
                 <input type="number" value={amciMonthly} onChange={(e) => setAmciMonthly(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-6 text-xl font-black text-white outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">DATE PROCHAINE RÉCEPTION</label>
                 <input type="date" value={nextAmciDate} onChange={(e) => setNextAmciDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-6 text-sm font-black text-white outline-none focus:border-amber-500/50 uppercase" />
              </div>
           </div>
        </div>

        {/* --- NEW CATEGORY: PROTOCOLE DE MISSION --- */}
        <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40">
           <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
              <Timer size={22} className="text-amber-500" /> Protocole de Mission
           </h3>
           <div className="space-y-4">
              {[
                { label: 'Démarrage Auto Mission Suivante', key: 'autoStartNextMission', type: 'toggle' },
                { label: 'Mode Focus Strict (Blocage Nav)', key: 'strictFocusMode', type: 'toggle' },
                { label: 'Auto-Catégorisation IA', key: 'autoCategorization', type: 'toggle' },
                { label: 'Boost Priorité Automatique', key: 'enablePriorityBoost', type: 'toggle' },
              ].map(opt => (
                <div key={opt.key} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-white/5">
                   <span className="text-[10px] font-black text-slate-300 uppercase">{opt.label}</span>
                   <Toggle active={(options as any)[opt.key]} onClick={() => updateOption(opt.key, !(options as any)[opt.key])} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Durée Mission (Min)</label>
                    <input type="number" value={options.defaultMissionDuration} onChange={e => updateOption('defaultMissionDuration', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Pause (Min)</label>
                    <input type="number" value={options.breakDuration} onChange={e => updateOption('breakDuration', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Limite Missions/Jour</label>
                    <input type="number" value={options.taskLimitDaily} onChange={e => updateOption('taskLimitDaily', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Seuil Alerte Énergie</label>
                    <input type="number" value={options.energyThresholdWarning} onChange={e => updateOption('energyThresholdWarning', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
              </div>
           </div>
        </div>

        {/* --- NEW CATEGORY: CONFIGURATION ANALYTIQUE --- */}
        <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40">
           <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
              <BarChart3 size={22} className="text-indigo-500" /> Configuration Analytique
           </h3>
           <div className="space-y-4">
              {[
                { label: 'Journalisation Audit Logs', key: 'enableAuditLogs', type: 'toggle' },
                { label: 'Auto-Export CSV Mensuel', key: 'autoExportCSV', type: 'toggle' },
                { label: 'Calcul Score d\'Impact Proactif', key: 'calculateImpactScore', type: 'toggle' },
                { label: 'Comparaison Benchmark Récidive', key: 'benchmarkComparison', type: 'toggle' },
              ].map(opt => (
                <div key={opt.key} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-white/5">
                   <span className="text-[10px] font-black text-slate-300 uppercase">{opt.label}</span>
                   <Toggle active={(options as any)[opt.key]} onClick={() => updateOption(opt.key, !(options as any)[opt.key])} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Fréquence Sync (Min)</label>
                    <input type="number" value={options.syncFrequency} onChange={e => updateOption('syncFrequency', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Rétention (Mois)</label>
                    <input type="number" value={options.dataRetentionMonths} onChange={e => updateOption('dataRetentionMonths', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Objectif Perf (%)</label>
                    <input type="number" value={options.performanceGoal} onChange={e => updateOption('performanceGoal', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-600 uppercase italic">Jour Rapport</label>
                    <select value={options.reportGenerationDay} onChange={e => updateOption('reportGenerationDay', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-[10px] text-white uppercase">
                       {['Lundi', 'Mercredi', 'Vendredi', 'Dimanche'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* --- NEW CATEGORY: COMMUNICATION & ALERTES --- */}
        <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 lg:col-span-2">
           <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
              <Radio size={22} className="text-rose-500" /> Communication & Alertes Système
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 {[
                   { label: 'Retour Haptique Tactique', key: 'hapticFeedback', type: 'toggle' },
                   { label: 'Rappels de Rituels (Sun/Moon)', key: 'ritualReminders', type: 'toggle' },
                   { label: 'Alerte Dépassement Budget', key: 'alertOnBudgetOverrun', type: 'toggle' },
                   { label: 'Logging Terminal AI', key: 'terminalLogging', type: 'toggle' },
                 ].map(opt => (
                   <div key={opt.key} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-300 uppercase">{opt.label}</span>
                      <Toggle active={(options as any)[opt.key]} onClick={() => updateOption(opt.key, !(options as any)[opt.key])} />
                   </div>
                 ))}
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic ml-1">Volume Système ({options.systemVolume}%)</label>
                    <input type="range" min="0" max="100" value={options.systemVolume} onChange={e => updateOption('systemVolume', e.target.value)} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-600 uppercase italic">Rituel Matin</label>
                       <input type="time" value={options.morningRitualTime} onChange={e => updateOption('morningRitualTime', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-600 uppercase italic">Rituel Soir</label>
                       <input type="time" value={options.eveningRitualTime} onChange={e => updateOption('eveningRitualTime', e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic ml-1">Niveau de Notification</label>
                    <select value={options.notificationLevel} onChange={e => updateOption('notificationLevel', e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-[10px] font-black text-white uppercase outline-none">
                       {['Silent', 'Critical Only', 'Balanced', 'Full Tactical'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Profil Utilisateur (Existing) */}
        <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 lg:col-span-2">
           <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-4">
              <ShieldCheck size={22} className="text-amber-500" /> Profil Utilisateur
           </h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">NOM D'OPÉRATEUR</label>
                 <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Witensky..." className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-6 text-xl font-black text-white outline-none focus:border-blue-500/50" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
