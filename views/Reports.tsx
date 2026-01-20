
import React, { useState } from 'react';
import { 
  BarChart as LucideBarChart, 
  TrendingUp, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Target,
  FileText,
  Activity,
  Heart,
  Dumbbell
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, LineChart, Line, CartesianGrid
} from 'recharts';

const dailyData = [
  { time: '06h', score: 95, tasks: 4 },
  { time: '09h', score: 80, tasks: 3 },
  { time: '12h', score: 65, tasks: 1 },
  { time: '15h', score: 85, tasks: 5 },
  { time: '18h', score: 90, tasks: 6 },
  { time: '21h', score: 70, tasks: 2 },
];

const monthlyData = [
  { day: '01', score: 72 }, { day: '05', score: 85 }, { day: '10', score: 65 },
  { day: '15', score: 92 }, { day: '20', score: 78 }, { day: '25', score: 88 },
  { day: '30', score: 95 },
];

const yearlyData = [
  { month: 'Jan', score: 65 }, { month: 'Fév', score: 72 }, { month: 'Mar', score: 80 },
  { month: 'Avr', score: 78 }, { month: 'Mai', score: 91 }, { month: 'Juin', score: 88 },
];

const balanceData = [
  { category: 'Finance', value: 85, fullMark: 100 },
  { category: 'Études', value: 75, fullMark: 100 },
  { category: 'Discipline', value: 95, fullMark: 100 },
  { category: 'Mental', value: 80, fullMark: 100 },
  { category: 'Spirituel', value: 90, fullMark: 100 },
  { category: 'Langues', value: 65, fullMark: 100 },
];

const studyHoursData = [
  { name: 'Obligations', hours: 45 },
  { name: 'Admin', hours: 32 },
  { name: 'Constit', hours: 28 },
  { name: 'Anglais', hours: 15 },
  { name: 'Bible', hours: 10 },
];

const expenseNatureData = [
  { name: 'Besoins Vitaux', value: 65, color: '#10b981' },
  { name: 'Envies / Plaisir', value: 25, color: '#f59e0b' },
  { name: 'Imprévus', value: 10, color: '#ef4444' },
];

const sportPerformanceData = [
  { week: 'S1', weight: 75, max: 80 },
  { week: 'S2', weight: 76.5, max: 85 },
  { week: 'S3', weight: 77, max: 85 },
  { week: 'S4', weight: 78.5, max: 90 },
];

const disciplineConsistency = [
  { label: 'Matinale', success: 95, fail: 5 },
  { label: 'Etudes', success: 75, fail: 25 },
  { label: 'Finances', success: 85, fail: 15 },
  { label: 'Sport', success: 70, fail: 30 },
];

const Reports: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const handleExportPDF = () => {
    window.print();
  };

  const currentData = timeframe === 'daily' ? dailyData : timeframe === 'monthly' ? monthlyData : yearlyData;
  const dataKey = timeframe === 'daily' ? 'time' : timeframe === 'monthly' ? 'day' : 'month';

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LucideBarChart className="text-amber-500" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Master Analytics</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Analyse <span className="text-amber-500 font-outfit">Haut Niveau</span></h2>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-1">
            {(['daily', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === t ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'daily' ? 'Jour' : t === 'monthly' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-3 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* PDF Header (Print Only) */}
      <div className="hidden print:block text-slate-950 p-8 border-b-4 border-slate-950 mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">J&B DISCIPLINE CORE</h1>
            <p className="text-xl font-bold mt-2 uppercase tracking-widest">Rapport Stratégique de Performance</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">DATE: {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-sm font-bold">SUJET: WITENSKY</p>
          </div>
        </div>
      </div>

      {/* Primary Row: Master Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* GRAPH 1: Global Score Area */}
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 print:bg-white print:text-black">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3 print:text-black">
            <TrendingUp size={20} className="text-amber-500" /> 
            1. Tendance Maîtrise Globale
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey={dataKey} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} domain={[0, 100]} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                <Area type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Balance Radar */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 flex flex-col print:bg-white">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase print:text-black">2. Équilibre de Vie</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={balanceData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} />
                <Radar name="Maîtrise" dataKey="value" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Specific Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* GRAPH 3: Study Bar Chart - Adjusted margins and width for label clarity */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 print:bg-white">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3 print:text-black">
            <Target size={20} className="text-blue-500" /> 
            3. Investissement Études (Heures)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} 
                />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Expense Pie Chart */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 print:bg-white">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3 print:text-black">
            <Heart size={20} className="text-rose-500" /> 
            4. Nature des Dépenses (%)
          </h3>
          <div className="h-[250px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseNatureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseNatureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-10">
               {expenseNatureData.map(d => (
                 <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tertiary Row: Physical & Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GRAPH 5: Sport Line Chart */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 print:bg-white">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3 print:text-black">
            <Dumbbell size={20} className="text-emerald-500" /> 
            5. Progression Force & Poids
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sportPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} dot={{r: 6}} />
                <Line type="monotone" dataKey="max" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 6: Discipline Stacked Bar */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 print:bg-white">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3 print:text-black">
            <ShieldCheck size={20} className="text-amber-500" /> 
            6. Ratio de Succès Discipline
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disciplineConsistency}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="success" stackId="a" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                <Bar dataKey="fail" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest mt-4">Vert: Victoires | Rouge: Échecs</p>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-slate-500 text-[10px] text-center mt-20 border-t pt-8">
        RAPPORT GÉNÉRÉ PAR LE SYSTÈME J&B CONTROL. AUCUNE MODIFICATION MANUELLE AUTORISÉE.
        <br/>L'EXCELLENCE EST UNE HABITUDE, PAS UN ACTE.
      </div>
    </div>
  );
};

export default Reports;
