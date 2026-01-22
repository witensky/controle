
import React, { useState } from 'react';
import { BarChart as LucideBarChart, TrendingUp, Download, Target, Heart, Dumbbell, ShieldCheck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, LineChart, Line, CartesianGrid
} from 'recharts';

const dailyData = [
  { time: '06h', score: 95 }, { time: '09h', score: 80 }, { time: '12h', score: 65 },
  { time: '15h', score: 85 }, { time: '18h', score: 90 }, { time: '21h', score: 70 },
];

const balanceData = [
  { category: 'Finance', value: 85 }, { category: 'Études', value: 75 },
  { category: 'Discipline', value: 95 }, { category: 'Mental', value: 80 },
  { category: 'Spirituel', value: 90 }, { category: 'Langues', value: 65 },
];

const studyHoursData = [
  { name: 'Obligations', hours: 45 }, { name: 'Admin', hours: 32 },
  { name: 'Constit', hours: 28 }, { name: 'Anglais', hours: 15 },
];

const Reports: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-4xl font-black text-white italic">ANALYSE <span className="text-amber-500">STRATÉGIQUE</span></h2>
        </div>
        <button onClick={() => window.print()} className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">Export PDF</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 min-h-[450px]">
          <h3 className="text-lg font-black text-white mb-8 uppercase flex items-center gap-3"><TrendingUp size={20} className="text-amber-500" /> Tendance Maîtrise</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" tick={{fill: '#475569', fontSize: 10}} />
                <YAxis tick={{fill: '#475569', fontSize: 10}} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 min-h-[450px]">
          <h3 className="text-lg font-black text-white mb-8 uppercase">Équilibre</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={balanceData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" tick={{fill: '#94a3b8', fontSize: 9, fontWeight: '700'}} />
                <Radar dataKey="value" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-10 border-white/5 bg-[#0f172a]/40 min-h-[400px]">
          <h3 className="text-lg font-black text-white mb-8 uppercase flex items-center gap-3"><Target size={20} className="text-blue-500" /> Investissement</h3>
          <div className="h-[250px] w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
