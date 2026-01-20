
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
  Heart
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
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [expenseNature, setExpenseNature] = useState<'need' | 'want'>('need');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');

  const transactions = [
    { icon: Coffee, title: "Starbucks", amount: "-55 DH", cat: "Plaisir", date: "Il y a 2h", color: "bg-orange-500" },
    { icon: ShoppingCart, title: "Marjane Market", amount: "-320 DH", cat: "Courses", date: "Hier", color: "bg-blue-500" },
    { icon: Bus, title: "Tramway", amount: "-12 DH", cat: "Transport", date: "Hier", color: "bg-purple-500" },
    { icon: MoreHorizontal, title: "Autres", amount: "-45 DH", cat: "Logistique", date: "22 Mai", color: "bg-slate-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[2rem] p-8 bg-amber-500/5 border-amber-500/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget Total Quinzaine</p>
          <div className="flex items-end gap-2 mb-6">
            <h2 className="text-4xl font-black text-white">3,500</h2>
            <span className="text-sm font-bold text-amber-500 mb-1">DH</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
             <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]" />
             </div>
             <span>45%</span>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conseil Journalier</p>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-black text-white">250</h2>
            <span className="text-sm font-bold text-emerald-500 mb-1">DH / Jour</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Pour tenir jusqu'au 15 du mois prochain.</p>
        </div>

        <div className="flex flex-col gap-4">
           <button 
             onClick={() => setShowAddExpense(true)}
             className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-3xl p-6 flex flex-col items-center justify-center transition-all shadow-xl shadow-amber-500/20 group"
           >
             <div className="w-10 h-10 rounded-full bg-slate-950/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Plus size={24} strokeWidth={3} />
             </div>
             <span className="text-sm font-black uppercase tracking-wider">Ajouter une dépense</span>
           </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-[2rem] p-8 border-white/5 overflow-hidden group">
          <h3 className="font-bold text-white tracking-tight uppercase text-xs flex items-center gap-2 mb-8">
            <TrendingUp size={16} className="text-amber-500" />
            Tendance de Consommation
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

        <div className="glass rounded-[2rem] p-8 border-white/5 overflow-hidden">
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
      <div className="glass rounded-[2rem] p-8 border-white/5">
         <div className="flex justify-between items-center mb-8">
           <h3 className="font-bold text-white tracking-tight uppercase text-xs flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              DERNIÈRES ACTIVITÉS
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
                  <span className="text-sm font-black text-rose-500">{item.amount}</span>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Full History Modal */}
      {showFullHistory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in zoom-in-95">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white uppercase italic">Historique <span className="text-amber-500">Complet</span></h3>
              <button onClick={() => setShowFullHistory(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               {[...transactions, ...transactions, ...transactions].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl ${item.color}/20 flex items-center justify-center`}><item.icon size={18} className={item.color.replace('bg', 'text')} /></div>
                       <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.cat} • {item.date}</p>
                       </div>
                    </div>
                    <span className="text-sm font-black text-rose-500">{item.amount}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal - Updated with Nature and Payment Method */}
      {showAddExpense && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px]" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Journaliser <span className="text-amber-500">un Flux</span></h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Discipline Financière Stricte</p>
              </div>
              <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-8 relative z-10">
               {/* Amount Input */}
               <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">MONTANT (DH)</label>
                 <div className="relative">
                    <input type="number" placeholder="0.00" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-6 text-4xl font-black text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner" />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">DH</div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 {/* Nature of Expense */}
                 <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">NATURE</label>
                   <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                      <button 
                        onClick={() => setExpenseNature('need')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${expenseNature === 'need' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Zap size={14} /> <span className="text-[9px] uppercase tracking-widest">Besoin</span>
                      </button>
                      <button 
                        onClick={() => setExpenseNature('want')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${expenseNature === 'want' ? 'bg-rose-500 text-white font-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Heart size={14} /> <span className="text-[9px] uppercase tracking-widest">Envie</span>
                      </button>
                   </div>
                 </div>

                 {/* Payment Method */}
                 <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">PAIEMENT</label>
                   <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/5 rounded-2xl">
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-blue-500 text-white font-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        <CreditCard size={14} /> <span className="text-[9px] uppercase tracking-widest">Carte</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Banknote size={14} /> <span className="text-[9px] uppercase tracking-widest">Cash</span>
                      </button>
                   </div>
                 </div>
               </div>

               {/* Category Grid */}
               <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">CATÉGORIE</label>
                 <div className="grid grid-cols-3 gap-3">
                    {['Food', 'Transport', 'Study', 'Health', 'Home', 'Logistics'].map(c => (
                      <button key={c} className="bg-slate-950 border border-white/5 rounded-xl py-4 text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-white uppercase tracking-widest transition-colors">{c}</button>
                    ))}
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <button onClick={() => setShowAddExpense(false)} className="flex-1 py-5 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors">ANNULER</button>
                 <button onClick={() => setShowAddExpense(false)} className="flex-[2] bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-2xl shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all">ENREGISTRER</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
