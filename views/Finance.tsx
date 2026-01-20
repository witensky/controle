
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Coffee, 
  Bus, 
  ShoppingCart, 
  ChevronRight,
  PieChart as PieChartIcon,
  TrendingUp,
  History,
  X,
  CreditCard,
  Banknote,
  ArrowUpCircle,
  Wallet,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Tag,
  PenLine,
  ChevronDown,
  Zap,
  Search,
  ArrowLeft,
  Edit3,
  Trash2,
  Filter,
  Download,
  Database,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

interface Transaction {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  type: 'expense' | 'deposit';
  comment?: string;
  source?: string;
}

const initialTransactions: Transaction[] = [
  { id: '1', date: '2024-10-14', title: "Starbucks", amount: 55, category: "Plaisir", type: 'expense', comment: 'Café de révision intensif' },
  { id: '2', date: '2024-10-13', title: "Virement Bourse AMCI", amount: 3500, category: "Bourse", type: 'deposit', source: 'Bourse AMCI' },
  { id: '3', date: '2024-10-13', title: "Marjane Market", amount: 320, category: "Courses", type: 'expense', comment: 'Ravitaillement semaine' },
  { id: '4', date: '2024-10-12', title: "Tramway", amount: 12, category: "Transport", type: 'expense' },
];

const trendData = [
  { day: '05', amount: 150 },
  { day: '10', amount: 220 },
  { day: '15', amount: 350 },
  { day: '20', amount: 180 },
  { day: '25', amount: 550 },
  { day: '30', amount: 280 },
];

const categoryData = [
  { name: 'Courses', value: 1200, color: '#3b82f6' },
  { name: 'Plaisir', value: 450, color: '#f97316' },
  { name: 'Transport', value: 350, color: '#a855f7' },
  { name: 'Études', value: 280, color: '#10b981' },
  { name: 'Divers', value: 150, color: '#64748b' },
];

const LiquidPurse: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div className="relative w-12 h-16 bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden shadow-inner shrink-0">
      <div 
        className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out bg-emerald-500/50"
        style={{ height: `${percentage}%` }}
      >
        <div className="absolute -top-3 left-0 w-[200%] h-6 bg-emerald-400/30 animate-wave opacity-50" 
             style={{ animation: 'wave 3s infinite linear' }} />
      </div>
      <div className="absolute top-1.5 left-1.5 w-0.5 h-4 bg-white/10 rounded-full blur-[0.5px]" />
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const Finance: React.FC = () => {
  const [viewMode, setViewMode] = useState<'summary' | 'table'>('summary');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [type, setType] = useState<'expense' | 'deposit'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Courses');
  const [src, setSrc] = useState('Bourse AMCI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');

  const totalBudget = 3500;
  
  const financialStats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const deposits = transactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + t.amount, 0);
    const remaining = totalBudget - expenses;
    const percentage = Math.max(0, Math.min(100, Math.round((remaining / totalBudget) * 100)));
    return { expenses, deposits, remaining, percentage };
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (t?: Transaction) => {
    if (t) {
      setEditingTransaction(t);
      setType(t.type);
      setAmount(t.amount.toString());
      setTitle(t.title);
      setCat(t.category);
      setSrc(t.source || 'Bourse AMCI');
      setDate(t.date);
      setComment(t.comment || '');
    } else {
      setEditingTransaction(null);
      setType('expense');
      setAmount('');
      setTitle('');
      setCat('Courses');
      setSrc('Bourse AMCI');
      setDate(new Date().toISOString().split('T')[0]);
      setComment('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!amount || !title) return;
    const newTransaction: Transaction = {
      id: editingTransaction ? editingTransaction.id : Date.now().toString(),
      type,
      amount: Number(amount),
      title,
      category: type === 'expense' ? cat : 'Dépôt',
      source: type === 'deposit' ? src : undefined,
      date,
      comment
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? newTransaction : t));
    } else {
      setTransactions([...transactions, newTransaction]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette transaction ?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            {viewMode === 'summary' ? 'FINANCE' : 'REGISTRE'} <span className="text-amber-500">CONTROL</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">
            {viewMode === 'summary' ? 'Architecture du Capital' : 'Analyse Granulaire des Flux'}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setViewMode(viewMode === 'summary' ? 'table' : 'summary')}
            className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all"
          >
            {viewMode === 'summary' ? <History size={16} /> : <ArrowLeft size={16} />}
            {viewMode === 'summary' ? 'Gestion Détaillée' : 'Retour Synthèse'}
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Nouveau Flux
          </button>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <>
          {/* Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass rounded-[1.5rem] p-5 border-emerald-500/20 bg-[#0f172a]/40 shadow-xl flex items-center gap-4">
              <LiquidPurse percentage={financialStats.percentage} />
              <div className="flex-1">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Reste à Vivre</p>
                <h2 className="text-2xl font-black text-white tracking-tighter italic leading-none mb-2">
                  {financialStats.remaining.toLocaleString()} <span className="text-[10px] not-italic text-emerald-400">DH</span>
                </h2>
                <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full shadow-[0_0_8px_#10b981]" style={{ width: `${financialStats.percentage}%` }} />
                </div>
              </div>
            </div>

            <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Dépenses Mois</p>
              <div className="flex items-end gap-1.5 mb-2">
                <h2 className="text-2xl font-black text-rose-500 tracking-tighter">{financialStats.expenses.toLocaleString()}</h2>
                <span className="text-[10px] font-black text-rose-600 mb-0.5">DH</span>
              </div>
              <div className="w-16 h-1 bg-rose-500/30 rounded-full" />
            </div>

            <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Conseil Journalier</p>
              <div className="flex items-end gap-1 mb-1">
                <h2 className="text-2xl font-black text-white tracking-tighter">250</h2>
                <div className="flex flex-col leading-none mb-1">
                   <span className="text-[10px] font-black text-emerald-500">DH /</span>
                   <span className="text-[10px] font-black text-emerald-500">Jour</span>
                </div>
              </div>
              <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest italic">Sécurité assurée</p>
            </div>

            <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
               <div className="flex justify-between items-start mb-1">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Épargne Totale</p>
                 <Banknote size={12} className="text-emerald-500/50" />
               </div>
               <div className="flex items-end gap-1 mb-2">
                  <h2 className="text-2xl font-black text-emerald-400 tracking-tighter">1,450</h2>
                  <span className="text-[10px] font-black text-emerald-500 mb-0.5">DH</span>
               </div>
               <p className="text-[8px] text-emerald-500 uppercase font-black tracking-widest">+12% ce mois-ci</p>
            </div>

            <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Dépôts Période</p>
              <div className="flex items-end gap-1.5 mb-2">
                <h2 className="text-2xl font-black text-emerald-500 tracking-tighter">{financialStats.deposits.toLocaleString()}</h2>
                <span className="text-[10px] font-black text-emerald-600 mb-0.5">DH</span>
              </div>
              <div className="w-16 h-1 bg-emerald-500/30 rounded-full" />
            </div>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8 border-white/5 bg-[#0f172a]/60 shadow-2xl">
              <h3 className="font-black text-white tracking-tight uppercase text-[10px] flex items-center gap-3 mb-10 italic">
                <TrendingUp size={16} className="text-amber-500" /> Analyse des flux
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} />
                    <Line type="monotone" dataKey="amount" stroke="#fbbf24" strokeWidth={4} dot={{ r: 5, fill: '#fbbf24', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-8 border-white/5 bg-[#0f172a]/60 shadow-2xl">
              <h3 className="font-black text-white tracking-tight uppercase text-[10px] flex items-center gap-3 mb-10 italic">
                <PieChartIcon size={16} className="text-blue-500" /> Répartition par catégorie
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} width={80} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#020617', border: 'none', borderRadius: '12px'}} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Table View */
        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-[#0f172a]/40 space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full md:w-96 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={20} />
               <input 
                 type="text" 
                 placeholder="Rechercher une transaction..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-white outline-none focus:border-amber-500/30 transition-all shadow-inner"
               />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                  <Filter size={16} /> Filtrer
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                  <Download size={16} /> Exporter CSV
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                  <th className="px-6 pb-2">Échéance</th>
                  <th className="px-6 pb-2">Description</th>
                  <th className="px-6 pb-2">Catégorie / Source</th>
                  <th className="px-6 pb-2 text-right">Montant</th>
                  <th className="px-6 pb-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="group bg-[#020617]/40 hover:bg-white/[0.03] transition-all rounded-2xl">
                    <td className="px-6 py-5 rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {t.type === 'deposit' ? <ArrowUpCircle size={20} /> : <ShoppingCart size={20} />}
                        </div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white tracking-tight">{t.title}</span>
                        {t.comment && <span className="text-[9px] text-slate-500 font-bold uppercase italic tracking-widest">{t.comment}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-4 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.type === 'expense' ? t.category : (t.source || 'Dépôt')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`text-base font-black italic ${t.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'deposit' ? '+' : '-'}{t.amount.toLocaleString()} <span className="text-[10px] not-italic">DH</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 rounded-r-2xl text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(t)} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-500 hover:text-amber-500 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2 leading-none">
                {editingTransaction ? 'MODIFIER' : 'NOUVEAU'} <span className="text-amber-500">FLUX</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-6">
              {/* Type Switcher */}
              <div className="p-1.5 bg-[#020617] rounded-[1.2rem] border border-white/5 flex gap-2">
                <button 
                  onClick={() => setType('expense')}
                  className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    type === 'expense' 
                      ? 'bg-slate-800 text-white shadow-xl shadow-black/40 border border-white/5' 
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  DÉPENSE
                </button>
                <button 
                  onClick={() => setType('deposit')}
                  className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    type === 'deposit' 
                      ? 'bg-emerald-500 text-[#020617] shadow-xl shadow-emerald-500/20' 
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  DÉPÔT
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Montant (DH)</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors">
                    <Banknote size={24} />
                  </div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-[#020617] border border-white/5 rounded-[1.5rem] py-8 pl-16 pr-8 text-4xl font-black text-white focus:border-amber-500/30 outline-none transition-all placeholder:text-slate-900 shadow-inner" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">
                    {type === 'expense' ? 'Catégorie' : 'Source de dépôt'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                      {type === 'expense' ? <Tag size={18} /> : <Database size={18} />}
                    </div>
                    {type === 'expense' ? (
                      <select 
                        value={cat}
                        onChange={(e) => setCat(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-10 text-xs font-black text-white outline-none focus:border-blue-500/30 transition-all appearance-none shadow-inner"
                      >
                        <option>Courses</option>
                        <option>Plaisir</option>
                        <option>Transport</option>
                        <option>Études</option>
                        <option>Loyers</option>
                        <option>Santé</option>
                        <option>Divers</option>
                      </select>
                    ) : (
                      <select 
                        value={src}
                        onChange={(e) => setSrc(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-10 text-xs font-black text-white outline-none focus:border-emerald-500/30 transition-all appearance-none shadow-inner"
                      >
                        <option>Bourse AMCI</option>
                        <option>Salaire / Job</option>
                        <option>Cadeau / Famille</option>
                        <option>Remboursement</option>
                        <option>Vente d'actifs</option>
                        <option>Dividendes</option>
                        <option>Économies antérieures</option>
                      </select>
                    )}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Date de transaction</label>
                   <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">
                       <CalendarIcon size={18} />
                     </div>
                     <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-5 text-[11px] font-black text-white outline-none uppercase tracking-widest shadow-inner"
                     />
                   </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Titre de la transaction</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors">
                    <PenLine size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === 'expense' ? "Ex: Marjane, Starbucks, Loyer..." : "Ex: Virement Bourse, Bonus..."} 
                    className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800 shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Commentaire / Notes</label>
                <div className="relative group">
                  <div className="absolute left-5 top-6 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <MessageSquare size={18} />
                  </div>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Précisez la nature de ce flux..." 
                    rows={3}
                    className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-800 shadow-inner resize-none" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-5 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors order-2 sm:order-1"
              >
                ANNULER
              </button>
              <button 
                onClick={handleSave}
                disabled={!amount || !title}
                className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 text-[#020617] font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[1.5rem] shadow-[0_12px_24px_-8px_rgba(251,191,36,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(251,191,36,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 order-1 sm:order-2 disabled:opacity-30 disabled:pointer-events-none group"
              >
                <Zap size={16} fill="currentColor" className="group-hover:animate-bounce" />
                {editingTransaction ? 'METTRE À JOUR' : 'LOG TRANSACTION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
