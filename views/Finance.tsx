
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, ShoppingCart, History, X, Banknote, ArrowUpCircle, Wallet, Tag, MessageSquare, Edit3, Trash2, Search, Loader2, Sparkles, AlertCircle, Calendar, TrendingDown, Target, ArrowRight, ShieldCheck, Save, Settings2, LineChart as LucideLineChart, FileDown, ArrowDownCircle, PieChart as LucidePieChart, Calculator, TrendingUp, Layers, PiggyBank, Pencil, BarChart3, Brain
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

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
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAudit, setAiAudit] = useState<string | null>(null);
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
      }
    } catch (err) {
      handleSupabaseError(err, 'fetchData');
    } finally {
      setLoading(false);
    }
  };

  const getAIFinanceAudit = async () => {
    setAiAuditLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const recentExpenses = transactions
        .filter(t => t.type === 'expense')
        .slice(0, 10)
        .map(t => `${t.title}: ${t.amount}DH (${t.category})`)
        .join(', ');

      const prompt = `Analyse mes dépenses récentes: ${recentExpenses}. 
      Budget total: ${totalBudget}DH. 
      Identifie une anomalie ou un conseil d'épargne ultra-concret en 1 phrase. Sois sec et efficace.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiAudit(response.text || "Analyse indisponible.");
    } catch (error) {
      setAiAudit("Erreur de liaison analytique.");
    } finally {
      setAiAuditLoading(false);
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
      setAmount(''); setTitle('');
    } catch (err) {
      handleSupabaseError(err, 'handleSaveTransaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
      
      {/* AI FINANCE AUDIT WIDGET */}
      <div className="glass rounded-[2rem] p-6 border-indigo-500/20 bg-indigo-500/[0.03] shadow-lg border-l-4 border-l-indigo-500">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <Brain size={16} className="text-indigo-400" />
               <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em] italic">AUDITEUR DE FLUX IA</h3>
            </div>
            <button 
               onClick={getAIFinanceAudit}
               disabled={aiAuditLoading}
               className="text-[8px] font-black uppercase text-indigo-400 hover:text-white transition-colors flex items-center gap-1"
            >
               {aiAuditLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
               Lancer Audit
            </button>
         </div>
         <p className="text-xs text-slate-400 italic font-medium">
            {aiAudit || "En attente d'analyse du registre."}
         </p>
      </div>

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
            </div>
        </div>

        <div className="flex flex-col gap-4">
           <button onClick={() => setShowBudgetModal(true)} className="flex-1 glass rounded-[2.5rem] p-8 border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500 hover:text-slate-950 transition-all group flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-slate-950 transition-all">
                <Target size={32} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-white group-hover:text-slate-950 uppercase italic text-sm">GÉRER BUDGETS</h4>
           </button>
           <button onClick={() => setShowModal(true)} className="flex-1 glass rounded-[2.5rem] p-8 border-white/10 bg-white/5 hover:bg-white hover:text-slate-950 transition-all group flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white group-hover:bg-slate-950 transition-all">
                <Plus size={32} strokeWidth={3} />
              </div>
              <h4 className="font-black text-white group-hover:text-slate-950 uppercase italic text-sm">NOUVEAU FLUX</h4>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Finance;
