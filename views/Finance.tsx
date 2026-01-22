
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, ShoppingCart, History, X, Banknote, ArrowUpCircle, Wallet, Tag, MessageSquare, Edit3, Trash2, Search, Loader2, Sparkles, AlertCircle, Calendar, TrendingDown, Target, ArrowRight, ShieldCheck, Save, Settings2, LineChart as LucideLineChart, FileDown, ArrowDownCircle, PieChart as LucidePieChart, Calculator, TrendingUp, Layers, PiggyBank, Pencil, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface Transaction {
  id: string;
  user_id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  type: 'expense' | 'deposit';
  comment?: string;
  source?: string;
}

interface CategoryBudget {
  category: string;
  limit: number;
}

interface SavingsItem {
  id: string;
  amount: number;
  reason: string;
  date: string;
}

const Finance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'table' | 'forecast'>('summary');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [savingsList, setSavingsList] = useState<SavingsItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  
  // Form State
  const [type, setType] = useState<'expense' | 'deposit'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryValue, setCategoryValue] = useState('Courses');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Savings Form State
  const [newSavingsAmount, setNewSavingsAmount] = useState('');
  const [newSavingsReason, setNewSavingsReason] = useState('');
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);

  const [totalBudget, setTotalBudget] = useState(3500);
  const [nextAmciDate, setNextAmciDate] = useState('2024-11-10');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txRes, profileRes] = await Promise.all([
        supabase.from('finance_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('profiles').select('category_budgets, amci_monthly_amount, next_amci_date, savings_list').eq('id', user.id).single()
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (profileRes.data?.amci_monthly_amount) setTotalBudget(Number(profileRes.data.amci_monthly_amount));
      if (profileRes.data?.next_amci_date) setNextAmciDate(profileRes.data.next_amci_date);
      if (profileRes.data?.savings_list) setSavingsList(profileRes.data.savings_list);
      
      if (profileRes.data?.category_budgets) {
        setBudgets(profileRes.data.category_budgets);
      } else {
        const defaults = [
          { category: 'Courses', limit: 1200 },
          { category: 'Plaisir', limit: 500 },
          { category: 'Transport', limit: 300 },
          { category: 'Loyers', limit: 1000 },
        ];
        setBudgets(defaults);
      }
    } catch (err) {
      handleSupabaseError(err, 'fetchData');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const amciStats = useMemo(() => {
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date <= today)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const remaining = totalBudget - expenses;
    const progress = (expenses / totalBudget) * 100;
    
    const targetDate = new Date(nextAmciDate);
    const now = new Date();
    const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const dailyBudget = Math.max(0, Math.round(remaining / daysLeft));

    return { 
      spent: expenses, 
      remaining, 
      progress, 
      daysLeft, 
      dailyBudget,
      isOver: progress > 90
    };
  }, [transactions, totalBudget, nextAmciDate, today]);

  const stats = useMemo(() => {
    const pastAndPresent = transactions.filter(t => t.date <= today);
    const future = transactions.filter(t => t.date > today);
    const expenses = pastAndPresent.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const todaySpent = transactions.filter(t => t.type === 'expense' && t.date === today).reduce((acc, t) => acc + t.amount, 0);
    const futureExpenses = future.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const remaining = totalBudget - expenses;
    const projectedRemaining = totalBudget - expenses - futureExpenses;
    const totalSavings = savingsList.reduce((acc, s) => acc + s.amount, 0);
    return { expenses, todaySpent, remaining, projectedRemaining, futureExpenses, futureCount: future.length, totalSavings };
  }, [transactions, today, totalBudget, savingsList]);

  const budgetAnalysis = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions
        .filter(t => t.category === b.category && t.type === 'expense' && t.date <= today)
        .reduce((acc, t) => acc + t.amount, 0);
      const future = transactions
        .filter(t => t.category === b.category && t.type === 'expense' && t.date > today)
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...b, spent, future, remaining: b.limit - spent };
    });
  }, [budgets, transactions, today]);

  const handleSaveTransaction = async () => {
    if (!amount || !title) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const payload = { user_id: user.id, type, amount: Number(amount), title, category: type === 'expense' ? categoryValue : 'Dépôt', date, comment };
      const { error } = await supabase.from('finance_transactions').insert([payload]);
      if (error) throw error;
      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      handleSupabaseError(err, 'handleSaveTransaction');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudgets = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('profiles').update({ category_budgets: budgets }).eq('id', user.id);
      if (error) throw error;
      setShowBudgetModal(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSavings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('profiles').update({ savings_list: savingsList }).eq('id', user.id);
      if (error) throw error;
      setShowSavingsModal(false);
      setEditingSavingsId(null);
      setNewSavingsAmount('');
      setNewSavingsReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSaving = () => {
    if (!newSavingsAmount || !newSavingsReason) return;
    const newItem: SavingsItem = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(newSavingsAmount),
      reason: newSavingsReason,
      date: new Date().toISOString().split('T')[0]
    };
    setSavingsList(prev => [...prev, newItem]);
    setNewSavingsAmount('');
    setNewSavingsReason('');
  };

  const handleUpdateSaving = (id: string, amount: number, reason: string) => {
    setSavingsList(prev => prev.map(s => s.id === id ? { ...s, amount, reason } : s));
  };

  const handleDeleteSaving = (id: string) => {
    setSavingsList(prev => prev.filter(s => s.id !== id));
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    setBudgets(prev => [...prev, { category: newCatName.trim(), limit: 0 }]);
    setNewCatName('');
    setShowAddCat(false);
  };

  const resetForm = () => {
    setAmount(''); setTitle(''); setDate(new Date().toISOString().split('T')[0]); setComment('');
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">FINANCE <span className="text-amber-500 font-outfit">UNIT</span></h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">DÉPLOIEMENT DES FLUX & ACCUMULATION AMCI</p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          {[
            { id: 'summary', label: 'Synthèse', icon: Sparkles },
            { id: 'forecast', label: 'Provisions', icon: Calculator },
            { id: 'table', label: 'Registre', icon: History }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as any)} className={`flex items-center gap-3 px-6 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === tab.id ? 'bg-white text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AMCI ACCUMULATION WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden group shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-amber-500 group-hover:scale-110 transition-transform duration-1000">
               <Banknote size={200} />
            </div>
            
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="80" className="stroke-slate-900 fill-none" strokeWidth="12" />
                  <circle 
                    cx="50%" cy="50%" r="80" 
                    className={`fill-none transition-all duration-1000 ${amciStats.isOver ? 'stroke-rose-500' : 'stroke-amber-500'}`} 
                    strokeWidth="12" 
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - amciStats.progress / 100)}`}
                    strokeLinecap="round"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white italic">{Math.round(amciStats.progress)}%</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Brûlé</span>
               </div>
            </div>

            <div className="flex-1 space-y-6 relative z-10">
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">ACCUMULATION <span className="text-amber-500">AMCI</span></h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Reste disponible</p>
                     <p className="text-xl font-black text-white italic">{amciStats.remaining.toLocaleString()} DH</p>
                  </div>
                  <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner border-l-amber-500/30">
                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Quota / Jour</p>
                     <p className="text-xl font-black text-white italic">{amciStats.dailyBudget} <span className="text-xs text-emerald-500">DH</span></p>
                  </div>
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Calendar size={14} className="text-amber-500" /> RESET DANS {amciStats.daysLeft} JOURS ({nextAmciDate})
               </p>
            </div>
        </div>

        <div className="flex flex-col gap-4">
           {/* BUDGET MODAL TRIGGER */}
           <button onClick={() => setShowBudgetModal(true)} className="flex-1 glass rounded-[2.5rem] p-8 border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500 hover:text-slate-950 transition-all group flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-slate-950 transition-all">
                <Target size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-black text-white group-hover:text-slate-950 uppercase italic text-sm">GÉRER BUDGETS</h4>
                <p className="text-[8px] text-slate-500 group-hover:text-slate-900 uppercase font-black tracking-widest mt-1">PLANIFIER LES VECTEURS</p>
              </div>
           </button>
           <button onClick={() => setShowModal(true)} className="flex-1 glass rounded-[2.5rem] p-8 border-white/10 bg-white/5 hover:bg-white hover:text-slate-950 transition-all group flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white group-hover:bg-slate-950 transition-all">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-black text-white group-hover:text-slate-950 uppercase italic text-sm">NOUVEAU FLUX</h4>
                <p className="text-[8px] text-slate-500 group-hover:text-slate-900 uppercase font-black tracking-widest mt-1">DÉCLARER OPÉRATION</p>
              </div>
           </button>
        </div>
      </div>

      {/* QUICK STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-[2rem] p-8 border-rose-500/20 bg-rose-500/[0.03] shadow-xl animate-pulse-glow">
           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 italic flex items-center gap-2">
             <ArrowDownCircle size={14} /> Dépenses Jour
           </p>
           <h2 className="text-3xl font-black text-white tracking-tighter">{stats.todaySpent.toLocaleString()} DH</h2>
           <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">CONTRÔLE TACTIQUE</p>
        </div>
        <div className="glass rounded-[2rem] p-8 border-amber-500/10 bg-[#0f172a]/40">
           <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 italic">Provisions Totales</p>
           <h2 className="text-3xl font-black text-white tracking-tighter">{stats.futureExpenses.toLocaleString()} DH</h2>
           <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">{stats.futureCount} OPÉRATIONS EN ATTENTE</p>
        </div>
        <div className="glass rounded-[2rem] p-8 border-emerald-500/10 bg-[#0f172a]/40">
           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 italic">Solde Sécurité</p>
           <h2 className="text-3xl font-black text-white tracking-tighter">{stats.projectedRemaining.toLocaleString()} DH</h2>
           <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">POST-PROVISIONS</p>
        </div>

        {/* SAVINGS WIDGET */}
        <div 
           onClick={() => setShowSavingsModal(true)} 
           className="glass rounded-[2rem] p-8 border-blue-500/20 bg-blue-500/[0.03] shadow-xl cursor-pointer hover:scale-105 transition-all group overflow-hidden relative"
        >
           <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-500 group-hover:scale-125 transition-transform duration-1000">
              <PiggyBank size={100} />
           </div>
           <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 italic flex items-center gap-2">
             <PiggyBank size={14} /> Épargne Tactique
           </p>
           <h2 className="text-3xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
              {stats.totalSavings.toLocaleString()} <span className="text-xs text-slate-500">DH</span>
           </h2>
           <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic">RÉSERVE SÉCURISÉE</p>
        </div>
      </div>

      {/* SAVINGS MANAGER MODAL */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-3xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">GESTION DES <span className="text-blue-500">RÉSERVES D'ÉPARGNE</span></h3>
                 <button onClick={() => setShowSavingsModal(false)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 {/* Left: Current Savings List */}
                 <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                    {savingsList.length === 0 ? (
                      <div className="py-20 text-center opacity-20 border border-dashed border-white/10 rounded-3xl">
                         <PiggyBank size={48} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Aucune réserve scellée</p>
                      </div>
                    ) : (
                      savingsList.map((s) => (
                        <div key={s.id} className="glass rounded-[2rem] p-8 border border-white/5 bg-slate-950/60 group hover:border-blue-500/20 transition-all shadow-xl">
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{s.date}</span>
                              <div className="flex gap-2">
                                 <button onClick={() => { 
                                    setEditingSavingsId(s.id); 
                                    setNewSavingsAmount(s.amount.toString()); 
                                    setNewSavingsReason(s.reason);
                                 }} className="p-2 text-slate-700 hover:text-blue-400 transition-colors"><Edit3 size={14}/></button>
                                 <button onClick={() => handleDeleteSaving(s.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                              </div>
                           </div>
                           <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{s.reason}</h4>
                           <p className="text-2xl font-black text-blue-500 italic mt-4">{s.amount.toLocaleString()} DH</p>
                        </div>
                      ))
                    )}
                 </div>

                 {/* Right: Add/Edit Form */}
                 <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0b1121] flex flex-col justify-between">
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic mb-6">OPÉRATION DE RÉSERVE</h4>
                       
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">VOLUME DH</label>
                          <input 
                             type="number" value={newSavingsAmount} onChange={e => setNewSavingsAmount(e.target.value)}
                             placeholder="0.00"
                             className="w-full bg-slate-950 border border-white/10 rounded-2xl py-6 px-8 text-3xl font-black text-white focus:border-blue-500 outline-none text-center italic"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">MOTIF TACTIQUE</label>
                          <input 
                             type="text" value={newSavingsReason} onChange={e => setNewSavingsReason(e.target.value)}
                             placeholder="NOM DE LA RÉSERVE..."
                             className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white outline-none focus:border-blue-500/30 uppercase"
                          />
                       </div>
                    </div>

                    <div className="mt-10 space-y-4">
                       {editingSavingsId ? (
                          <div className="flex gap-4">
                             <button 
                                onClick={() => {
                                   handleUpdateSaving(editingSavingsId, Number(newSavingsAmount), newSavingsReason);
                                   setEditingSavingsId(null);
                                   setNewSavingsAmount('');
                                   setNewSavingsReason('');
                                }}
                                className="flex-1 py-6 bg-blue-500 text-slate-950 font-black uppercase rounded-3xl text-xs tracking-widest"
                             >METTRE À JOUR</button>
                             <button onClick={() => { setEditingSavingsId(null); setNewSavingsAmount(''); setNewSavingsReason(''); }} className="px-8 bg-slate-900 text-slate-500 rounded-3xl font-black uppercase text-[10px]">ANNULER</button>
                          </div>
                       ) : (
                          <button 
                             onClick={handleAddSaving}
                             disabled={!newSavingsAmount || !newSavingsReason}
                             className="w-full py-6 bg-white/5 text-blue-400 border border-blue-500/20 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-blue-500 hover:text-slate-950 transition-all disabled:opacity-30"
                          >INTÉGRER À LA RÉSERVE</button>
                       )}
                    </div>
                 </div>
              </div>

              <div className="flex gap-6 items-center border-t border-white/5 pt-10">
                 <button onClick={handleSaveSavings} disabled={saving} className="flex-1 py-7 bg-blue-500 text-slate-950 font-black uppercase rounded-3xl shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[12px] tracking-[0.4em] flex items-center justify-center gap-4">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={22} strokeWidth={3} />} SCELLER L'ÉPARGNE GLOBALE
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* BUDGET MANAGER MODAL (CONFORM TO SCREENSHOT) */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-3xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">CENTRE DE <span className="text-emerald-500">CONTRÔLE BUDGÉTAIRE</span></h3>
                 <button onClick={() => setShowBudgetModal(false)} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-h-[480px] overflow-y-auto pr-4 custom-scrollbar">
                 {budgets.map((b, i) => (
                   <div key={i} className="glass rounded-[2.5rem] p-8 border border-white/5 bg-slate-950/60 group hover:border-emerald-500/20 transition-all shadow-xl">
                      <div className="flex justify-between items-center mb-8">
                         <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">{b.category}</h4>
                         <Edit3 size={18} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span>ALLOCATION ACTUELLE</span>
                            <span className="text-white font-black italic">{b.limit} DH</span>
                         </div>
                         <input 
                            type="number" 
                            value={b.limit} 
                            onChange={(e) => setBudgets(prev => prev.map(old => old.category === b.category ? {...old, limit: Number(e.target.value)} : old))}
                            className="w-full bg-[#0b1121] border border-white/10 rounded-2xl py-5 px-8 text-emerald-500 text-xl font-black italic outline-none focus:border-emerald-500/50 shadow-inner" 
                         />
                      </div>
                   </div>
                 ))}

                 {showAddCat ? (
                   <div className="glass rounded-[2.5rem] p-8 border border-emerald-500/40 bg-emerald-500/[0.02] flex flex-col justify-center gap-4">
                      <input 
                        type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} 
                        placeholder="NOM DU VECTEUR..."
                        className="bg-slate-950 border border-white/10 rounded-xl p-4 text-xs font-black text-white uppercase outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleCreateCategory} className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase">Confirmer</button>
                        <button onClick={() => setShowAddCat(false)} className="px-4 py-3 bg-slate-900 text-slate-500 font-black rounded-xl text-[10px] uppercase">Annuler</button>
                      </div>
                   </div>
                 ) : (
                    <div className="glass rounded-[2.5rem] border border-dashed border-white/10 flex items-center justify-center p-12 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setShowAddCat(true)}>
                       <Plus size={32} />
                    </div>
                 )}
              </div>

              <div className="flex gap-6 items-center">
                 <button onClick={handleSaveBudgets} disabled={saving} className="flex-1 py-7 bg-emerald-500 text-slate-950 font-black uppercase rounded-3xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[12px] tracking-[0.4em] flex items-center justify-center gap-4">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={22} strokeWidth={3} />} SCELLER LES OBJECTIFS
                 </button>
                 <button onClick={() => setShowAddCat(true)} className="px-10 py-7 bg-[#1e293b]/40 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:text-white hover:bg-[#1e293b] transition-all border border-white/5">CRÉER VECTEUR</button>
              </div>
           </div>
        </div>
      )}

      {/* SUMMARY CHARTS */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8">
           <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                 <LucidePieChart size={18} className="text-rose-500" /> RÉPARTITION CONSOMMATION PAR VECTEUR
              </h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetAnalysis}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                       <XAxis dataKey="category" tick={{fill: '#475569', fontSize: 9, fontWeight: 900}} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                       <Bar dataKey="spent" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                 <LucideLineChart size={18} className="text-blue-500" /> VOLUMÉTRIE DES FLUX RÉCENTS
              </h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={transactions.slice(0, 10).reverse().map(t => ({ name: t.date, amount: t.amount }))}>
                       <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 8}} />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none', borderRadius: '15px'}} />
                       <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fill="url(#colorAmt)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* PROVISIONS VIEW (FORECAST) - TABLE & CHARTS PER REQUEST */}
      {viewMode === 'forecast' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
           {/* Analytic Table Section */}
           <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                    <Calculator size={18} className="text-blue-500" /> REGISTRE ANALYTIQUE DES PROVISIONS
                 </h3>
                 <div className="px-6 py-2 bg-slate-950 rounded-full border border-white/5 text-[10px] font-black text-emerald-500 italic">
                    SOLDE SÉCURITÉ PROJETÉ : {stats.projectedRemaining.toLocaleString()} DH
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-separate border-spacing-y-4">
                   <thead>
                     <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                       <th className="px-8 pb-4">Échéance</th>
                       <th className="px-8 pb-4">Titre / Flux</th>
                       <th className="px-8 pb-4">Catégorie</th>
                       <th className="px-8 pb-4 text-right">Volume</th>
                       <th className="px-8 pb-4 text-center">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {transactions.filter(t => t.date > today).length === 0 ? (
                       <tr>
                         <td colSpan={5} className="py-24 text-center">
                            <Calculator size={48} className="mx-auto text-slate-800 mb-6 opacity-20" />
                            <p className="text-[10px] font-black text-slate-700 uppercase italic tracking-widest">Aucune provision scellée dans le registre</p>
                         </td>
                       </tr>
                     ) : (
                       transactions.filter(t => t.date > today).map(t => (
                         <tr key={t.id} className="bg-[#020617]/60 hover:bg-white/[0.04] transition-all rounded-3xl group border-l-4 border-blue-500">
                            <td className="px-8 py-6 rounded-l-[1.5rem] font-black text-xs text-slate-500 italic">{t.date}</td>
                            <td className="px-8 py-6 text-sm font-black text-white uppercase italic tracking-tight">{t.title}</td>
                            <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category}</td>
                            <td className="px-8 py-6 text-right font-black italic text-lg text-blue-500">
                              -{t.amount.toLocaleString()} DH
                            </td>
                            <td className="px-8 py-6 rounded-r-[1.5rem] text-center">
                               <button onClick={async () => { if(confirm('Neutraliser cette provision ?')) { await supabase.from('finance_transactions').delete().eq('id', t.id); fetchData(); } }} className="opacity-0 group-hover:opacity-100 p-3 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                            </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
              </div>
           </div>

           {/* Analytical Control Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <LucidePieChart size={18} className="text-blue-500" /> RÉPARTITION CERCLE (PROVISIONS)
                 </h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={budgetAnalysis.filter(b => b.future > 0).map(b => ({ name: b.category, value: b.future }))}
                             cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                          >
                             {budgetAnalysis.filter(b => b.future > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'][index % 5]} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass rounded-[3rem] p-10 border-white/5 bg-[#0f172a]/40 shadow-2xl">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 italic flex items-center gap-3">
                    <BarChart3 size={18} className="text-blue-500" /> CONTRÔLE BARRE (VOLUMES FUTURS)
                 </h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={budgetAnalysis.filter(b => b.future > 0).map(b => ({ name: b.category, value: b.future }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="name" tick={{fill: '#475569', fontSize: 9, fontWeight: 900}} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#020617', border: 'none', borderRadius: '20px'}} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REGISTRE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 overflow-hidden animate-in slide-in-from-right-8">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">REGISTRE ANALYTIQUE DES FLUX PASSÉS</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-[8px] font-black text-slate-500 uppercase">DEPOT</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> <span className="text-[8px] font-black text-slate-500 uppercase">DEPENSE</span></div>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                    <th className="px-8 pb-4">Date</th>
                    <th className="px-8 pb-4">Flux / Vecteur</th>
                    <th className="px-8 pb-4">Catégorie</th>
                    <th className="px-8 pb-4 text-right">Volume</th>
                    <th className="px-8 pb-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.date <= today).map(t => (
                    <tr key={t.id} className="bg-[#020617]/60 hover:bg-white/[0.04] transition-all rounded-3xl group">
                       <td className="px-8 py-6 rounded-l-[1.5rem] font-black text-xs text-slate-500 italic">{t.date}</td>
                       <td className="px-8 py-6 text-sm font-black text-white uppercase italic tracking-tight">{t.title}</td>
                       <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category}</td>
                       <td className={`px-8 py-6 text-right font-black italic text-lg ${t.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {t.type === 'deposit' ? '+' : '-'}{t.amount.toLocaleString()} DH
                       </td>
                       <td className="px-8 py-6 rounded-r-[1.5rem] text-center">
                          <button onClick={async () => { if(confirm('Annuler ce flux passé ?')) { await supabase.from('finance_transactions').delete().eq('id', t.id); fetchData(); } }} className="opacity-0 group-hover:opacity-100 p-3 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* MODAL TRANSACTION */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
           <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-3xl">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-white uppercase italic">SÉCURISER UN <span className="text-amber-500">FLUX</span></h3>
                 <button onClick={() => setShowModal(false)} className="p-4 text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-950 rounded-2xl border border-white/5">
                    <button onClick={() => setType('expense')} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-rose-500 text-slate-950 shadow-lg' : 'text-slate-600'}`}>DÉPENSE</button>
                    <button onClick={() => setType('deposit')} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'deposit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-600'}`}>DÉPÔT</button>
                 </div>

                 <div className="space-y-4">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00 DH" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-6 px-8 text-4xl font-black text-white focus:border-amber-500 outline-none placeholder:text-slate-800 transition-all text-center italic shadow-inner" />
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="TITRE DE L'OPÉRATION" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/30 placeholder:text-slate-800 transition-all uppercase tracking-widest" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">VECTEUR</label>
                       <select value={categoryValue} onChange={e => setCategoryValue(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black text-white uppercase outline-none focus:border-amber-500/30">
                          {type === 'expense' ? (
                            <>
                              {budgets.map(b => <option key={b.category} value={b.category}>{b.category.toUpperCase()}</option>)}
                              <option value="Admin">ADMIN</option>
                              <option value="Santé">SANTÉ</option>
                              <option value="Loyer">LOYER</option>
                            </>
                          ) : (
                            <>
                              <option value="AMCI">AMCI</option>
                              <option value="Don">DON</option>
                              <option value="Autres">AUTRES</option>
                            </>
                          )}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">DATE D'EXÉCUTION</label>
                       <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black text-white outline-none focus:border-amber-500/30 uppercase" />
                    </div>
                 </div>

                 <button onClick={handleSaveTransaction} disabled={saving || !amount || !title} className="w-full py-6 bg-amber-500 text-slate-950 rounded-3xl font-black uppercase tracking-[0.4em] text-xs shadow-3xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30">
                    {saving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} strokeWidth={3} />}
                    {date > today ? 'SCELLER PROVISION' : "COMMANDER L'OPÉRATION"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
