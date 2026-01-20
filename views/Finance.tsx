
import React, { useState } from 'react';
import { 
  Plus, 
  Coffee, 
  Bus, 
  ShoppingCart, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  TrendingUp,
  History,
  X,
  CreditCard,
  Banknote,
  Activity,
  Zap,
  Heart,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

const trendData = [
  { day: '01', amount: 150 },
  { day: '05', amount: 320 },
  { day: '10', amount: 210 },
  { day: '15', amount: 450 },
  { day: '20', amount: 180 },
  { day: '25', amount: 600 },
  { day: '30', amount: 280 },
];

const categoryData = [
  { name: 'Courses', value: 1200, color: '#3b82f6' },
  { name: 'Plaisir', value: 450, color: '#f97316' },
  { name: 'Transport', value: 350, color: '#a855f7' },
  { name: 'Études', value: 280, color: '#10b981' },
  { name: 'Divers', value: 150, color: '#64748b' },
];

const Finance: React.FC = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'deposit'>('expense');
  const [expenseNature, setExpenseNature] = useState<'need' | 'want'>('need');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [savingsTotal, setSavingsTotal] = useState(1450); // État pour les économies

  const transactions = [
    { icon: Coffee, title: "Starbucks", amount: "-55 DH", cat: "Plaisir", date: "Il y a 2h", color: "bg-orange-500", type: 'expense' },
    { icon: ArrowUpCircle, title: "Dépôt Épargne", amount: "+500 DH", cat: "Économies", date: "Hier", color: "bg-emerald-500", type: 'deposit' },
    { icon: ShoppingCart, title: "Marjane Market", amount: "-320 DH", cat: "Courses", date: "Hier", color: "bg-blue-500", type: 'expense' },
    { icon: Bus, title: "Tramway", amount: "-12 DH", cat: "Transport", date: "Hier", color: "bg-purple-500", type: 'expense' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      {/* Header Summary - Expanded to 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-[2rem] p-6 bg-amber-500/5 border-amber-500/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget Bimestriel</p>
          <div className="flex items-end gap-2 mb-4">
            <h2 className="text-3xl font-black text-white tracking-tighter">3,500</h2>
            <span className="text-xs font-bold text-amber-500 mb-1">DH</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
             <div className="bg-amber-500 h-full w-[45%]" />
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conseil Journalier</p>
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">250</h2>
            <span className="text-xs font-bold text-emerald-500 mb-1">DH / Jour</span>
          </div>
          <p className="text-[8px] text-slate-500 mt-2 uppercase font-bold">Sécurité financière assurée</p>
        </div>

        {/* ÉCONOMIES / DÉPÔTS CARD */}
        <div className="glass rounded-[2rem] p-6 bg-emerald-500/5 border-emerald-500/20 group hover:bg-emerald-500/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Épargne Totale</p>
            <PiggyBank size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-black text-emerald-500 tracking-tighter">{savingsTotal.toLocaleString()}</h2>
            <span className="text-xs font-bold text-emerald-600 mb-1">DH</span>
          </div>
          <p className="text-[8px] text-emerald-500/60 mt-2 uppercase font-black tracking-widest">+12% ce mois-ci</p>
        </div>

        <button 
          onClick={() => {
            setTransactionType('expense');
            setShowAddTransaction(true);
          }}
          className="bg-white hover:bg-slate-100 text-slate-950 rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all shadow-xl shadow-white/5 group active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-slate-950/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
             <Plus size={24} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle Transaction</span>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-8 border-white/5 overflow-hidden group">
          <h3 className="font-bold text-white tracking-tight uppercase text-xs flex items-center gap-2 mb-8">
            <TrendingUp size={16} className="text-amber-500" />
            Analyse des flux
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} />
                <Line type="monotone" dataKey="amount" stroke="#fbbf24" strokeWidth={4} dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 overflow-hidden">
          <h3 className="font-bold text-white tracking-tight uppercase text-xs flex items-center gap-2 mb-8">
            <PieChartIcon size={16} className="text-blue-500" />
            Répartition par Catégorie
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '600'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
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
      <div className="glass rounded-[2.5rem] p-8 border-white/5">
         <div className="flex justify-between items-center mb-8">
           <h3 className="font-bold text-white tracking-tight uppercase text-xs flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              Historique des Mouvements
           </h3>
           <button 
            onClick={() => setShowFullHistory(true)}
            className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] hover:opacity-80 transition-opacity flex items-center gap-2"
           >
             VOIR TOUT <ChevronRight size={14} />
           </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {transactions.map((item, i) => (
              <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.color}/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} className={item.color.replace('bg', 'text')} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.cat} • {item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${item.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.amount}
                  </span>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Transaction Modal - Expanded for Deposits/Savings */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden">
            
            {/* Header with Type Toggle */}
            <div className="flex flex-col gap-6 mb-10 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                    Flux de <span className={transactionType === 'expense' ? 'text-amber-500' : 'text-emerald-500'}>Trésorerie</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Architecture Financière Personnelle</p>
                </div>
                <button onClick={() => setShowAddTransaction(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                <button 
                  onClick={() => setTransactionType('expense')}
                  className={`py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${transactionType === 'expense' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowDownCircle size={18} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Dépense</span>
                </button>
                <button 
                  onClick={() => setTransactionType('deposit')}
                  className={`py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${transactionType === 'deposit' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowUpCircle size={18} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Dépôt / Épargne</span>
                </button>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
               {/* Amount Input */}
               <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1 italic">MONTANT DE L'OPÉRATION (DH)</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className={`w-full bg-slate-950 border border-white/5 rounded-[2rem] p-8 text-5xl font-black text-white focus:outline-none transition-all shadow-inner ${transactionType === 'expense' ? 'focus:border-amber-500/50' : 'focus:border-emerald-500/50'}`} 
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl tracking-tighter italic">DH</div>
                 </div>
               </div>

               {transactionType === 'expense' ? (
                 <>
                   <div className="grid grid-cols-2 gap-6">
                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1 italic">PRIORITÉ</label>
                       <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                          <button 
                            onClick={() => setExpenseNature('need')}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${expenseNature === 'need' ? 'bg-amber-500/10 text-amber-500 font-black border border-amber-500/20' : 'text-slate-600 hover:text-white'}`}
                          >
                            <Zap size={14} /> <span className="text-[9px] uppercase font-black">Besoin</span>
                          </button>
                          <button 
                            onClick={() => setExpenseNature('want')}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${expenseNature === 'want' ? 'bg-rose-500/10 text-rose-500 font-black border border-rose-500/20' : 'text-slate-600 hover:text-white'}`}
                          >
                            <Heart size={14} /> <span className="text-[9px] uppercase font-black">Envie</span>
                          </button>
                       </div>
                     </div>

                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1 italic">CANAL</label>
                       <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                          <button 
                            onClick={() => setPaymentMethod('card')}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-blue-500/10 text-blue-400 font-black border border-blue-500/20' : 'text-slate-600 hover:text-white'}`}
                          >
                            <CreditCard size={14} /> <span className="text-[9px] uppercase font-black tracking-widest">Carte</span>
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-500 font-black border border-emerald-500/20' : 'text-slate-600 hover:text-white'}`}
                          >
                            <Banknote size={14} /> <span className="text-[9px] uppercase font-black tracking-widest">Cash</span>
                          </button>
                       </div>
                     </div>
                   </div>

                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1 italic">CATÉGORIE ANALYTIQUE</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['Nourriture', 'Transport', 'Droit', 'Santé', 'Loisir', 'Digital'].map(c => (
                          <button key={c} className="bg-slate-950 border border-white/5 rounded-xl py-4 text-[9px] font-black text-slate-500 hover:bg-white/5 hover:text-white uppercase tracking-widest transition-all">{c}</button>
                        ))}
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1 italic">SOURCE DU DÉPÔT</label>
                     <div className="grid grid-cols-2 gap-3">
                        {['BOURSE AMCI', 'VIREMENT FAMILLE', 'RÉCUPÉRATION', 'AUTRE'].map(source => (
                          <button key={source} className="bg-slate-950 border border-white/5 rounded-2xl py-5 text-[10px] font-black text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all uppercase tracking-widest italic">{source}</button>
                        ))}
                     </div>
                   </div>
                   <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Wallet size={20} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">Ce montant sera automatiquement ajouté à votre capital d'épargne globale.</p>
                   </div>
                 </div>
               )}

               <div className="flex gap-4 pt-4">
                 <button onClick={() => setShowAddTransaction(false)} className="flex-1 py-6 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors">ANNULER</button>
                 <button 
                  onClick={() => setShowAddTransaction(false)} 
                  className={`flex-[2] text-slate-950 font-black uppercase tracking-[0.4em] text-[11px] py-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 ${transactionType === 'expense' ? 'bg-white shadow-white/5' : 'bg-emerald-500 shadow-emerald-500/20'}`}
                 >
                   VALIDER LE FLUX
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
