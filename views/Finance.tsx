
import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Database,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

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
             style={{ animation: 'wave 3s infinite linear', transform: 'translateX(0)' }} />
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
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'deposit'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Courses');
  const [source, setSource] = useState('Bourse AMCI');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalBudget = 3500;
  const remainingAmount = 1070;
  const budgetPercentage = Math.round((remainingAmount / totalBudget) * 100);

  const transactions = [
    { icon: Coffee, title: "Starbucks", amount: "-55 DH", cat: "Plaisir", date: "Il y a 2h", color: "text-orange-500", type: 'expense' },
    { icon: ArrowUpCircle, title: "Dépôt Épargne", amount: "+500 DH", cat: "Économies", date: "Hier", color: "text-emerald-500", type: 'deposit' },
    { icon: ShoppingCart, title: "Marjane Market", amount: "-320 DH", cat: "Courses", date: "Hier", color: "text-blue-500", type: 'expense' },
    { icon: Bus, title: "Tramway", amount: "-12 DH", cat: "Transport", date: "Hier", color: "text-purple-500", type: 'expense' },
  ];

  const handleLogTransaction = () => {
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    // Simulation d'enregistrement
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAddTransaction(false);
      setAmount('');
      setTitle('');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* RESTE À VIVRE */}
        <div className="glass rounded-[1.5rem] p-5 border-emerald-500/20 bg-[#0f172a]/40 shadow-xl flex items-center gap-4">
          <LiquidPurse percentage={budgetPercentage} />
          <div className="flex-1">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Reste à Vivre</p>
            <h2 className="text-2xl font-black text-white tracking-tighter italic leading-none mb-2">
              {remainingAmount.toLocaleString()} <span className="text-[10px] not-italic text-emerald-400">DH</span>
            </h2>
            <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full shadow-[0_0_8px_#10b981]" style={{ width: `${budgetPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* BUDGET BIMESTRIEL */}
        <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Budget Bimestriel</p>
          <div className="flex items-end gap-1.5 mb-2">
            <h2 className="text-2xl font-black text-white tracking-tighter">3,500</h2>
            <span className="text-[10px] font-black text-amber-500 mb-0.5">DH</span>
          </div>
          <div className="w-16 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_#fbbf24]" />
        </div>

        {/* CONSEIL JOURNALIER */}
        <div className="glass rounded-[1.5rem] p-5 border-white/5 bg-[#0f172a]/40 shadow-xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Conseil Journalier</p>
          <div className="flex items-end gap-1 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tighter">250</h2>
            <div className="flex flex-col leading-none mb-1">
               <span className="text-[10px] font-black text-emerald-500">DH /</span>
               <span className="text-[10px] font-black text-emerald-500">Jour</span>
            </div>
          </div>
          <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Sécurité assurée</p>
        </div>

        {/* ÉPARGNE TOTALE */}
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

        {/* NOUVEAU FLUX */}
        <button 
          onClick={() => setShowAddTransaction(true)}
          className="bg-white hover:bg-slate-100 text-slate-950 rounded-[1.5rem] p-5 flex flex-col items-center justify-center transition-all shadow-2xl shadow-white/10 group active:scale-95 border border-white"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
             <Plus size={20} strokeWidth={3} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">Nouveau Flux</span>
        </button>
      </div>

      {/* Charts Row */}
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

      {/* History Section */}
      <div className="glass rounded-[2rem] p-8 border-white/5 bg-[#0f172a]/40">
         <div className="flex justify-between items-center mb-10">
           <h3 className="font-black text-white tracking-tight uppercase text-[10px] flex items-center gap-2 italic">
              <History size={16} className="text-slate-500" /> Historique des mouvements
           </h3>
           <button className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] hover:opacity-80 transition-opacity flex items-center gap-2 italic">
             VOIR TOUT <ChevronRight size={14} />
           </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {transactions.map((item, i) => (
              <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white border border-white/5 group-hover:scale-105 transition-transform`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">{item.cat} • {item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black italic ${item.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.amount}
                  </span>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* TRANSACTION MODAL */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                NOUVEAU <span className="text-amber-500">FLUX</span>
              </h3>
              <button 
                onClick={() => setShowAddTransaction(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Type Switcher */}
              <div className="p-1.5 bg-[#020617] rounded-[1.2rem] border border-white/5 flex gap-2">
                <button 
                  onClick={() => setTransactionType('expense')}
                  className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    transactionType === 'expense' 
                      ? 'bg-slate-800 text-white shadow-xl shadow-black/40 border border-white/5' 
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  DÉPENSE
                </button>
                <button 
                  onClick={() => setTransactionType('deposit')}
                  className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                    transactionType === 'deposit' 
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
                {/* Conditionally render Category or Source based on transactionType */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">
                    {transactionType === 'expense' ? 'Catégorie' : 'Source de dépôt'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                      {transactionType === 'expense' ? <Tag size={18} /> : <Database size={18} />}
                    </div>
                    {transactionType === 'expense' ? (
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
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

                {/* Date Selection */}
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Échéance</label>
                   <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">
                       <CalendarIcon size={18} />
                     </div>
                     <input 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-5 text-[11px] font-black text-white outline-none uppercase tracking-widest"
                     />
                   </div>
                </div>
              </div>
              
              {/* Title Input */}
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
                    placeholder={transactionType === 'expense' ? "Ex: Marjane, Starbucks, Loyer..." : "Ex: Virement Bourse, Bonus..."} 
                    className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-800 shadow-inner" 
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowAddTransaction(false)} 
                className="flex-1 py-5 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors order-2 sm:order-1"
              >
                ANNULER
              </button>
              <button 
                onClick={handleLogTransaction}
                disabled={isSubmitting || !amount}
                className={`flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 text-[#020617] font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[1.5rem] shadow-[0_12px_24px_-8px_rgba(251,191,36,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(251,191,36,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 order-1 sm:order-2 disabled:opacity-30 disabled:pointer-events-none group`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#020617]/20 border-t-[#020617] rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={16} fill="currentColor" className="group-hover:animate-bounce" />
                    LOG TRANSACTION
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
