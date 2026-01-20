
import React, { useState, useMemo } from 'react';
import { 
  Cross, 
  Book, 
  PenTool, 
  Flame, 
  Calendar,
  CloudSun,
  ChevronRight,
  X,
  CheckCircle2,
  Heart,
  Star,
  ListChecks,
  History
} from 'lucide-react';

const Bible: React.FC = () => {
  const [showJournal, setShowJournal] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [isRead, setIsRead] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [checkedChapters, setCheckedChapters] = useState<string[]>(['Gen 1', 'Gen 2', 'Gen 11']);

  const readingPlan = [
    { id: 'Gen 12', title: 'Abraham : L\'appel divin', chapter: 'Genèse 12' },
    { id: 'Gen 13', title: 'Séparation avec Lot', chapter: 'Genèse 13' },
    { id: 'Gen 15', title: 'L\'alliance inconditionnelle', chapter: 'Genèse 15' },
    { id: 'Gen 17', title: 'Le signe de la circoncision', chapter: 'Genèse 17' },
  ];

  const toggleChapter = (id: string) => {
    setCheckedChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const saveJournal = () => {
    if (journalContent.trim()) {
      setShowJournal(false);
      setJournalContent("");
      // Logic for storing gratitude
    }
  };

  const moodEmojis = [
    { icon: '😔', label: 'Luttant', color: 'text-slate-500' },
    { icon: '😐', label: 'Neutre', color: 'text-blue-400' },
    { icon: '🙂', label: 'En Paix', color: 'text-emerald-400' },
    { icon: '🔥', label: 'Inspiré', color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="w-16 h-16 bg-slate-900 mx-auto rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl rotate-45 hover:rotate-0 transition-all duration-500">
          <Cross size={32} className="text-amber-500 -rotate-45 group-hover:rotate-0 transition-transform" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">LUMIÈRE & <span className="text-amber-500 font-outfit">SAGESSE</span></h2>
        <p className="text-slate-500 text-sm font-black uppercase tracking-widest leading-relaxed italic opacity-80">"Ta parole est une lampe à mes pieds, et une lumière sur mon sentier."</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Reading & Journal Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-amber-500 group-hover:scale-110 transition-transform duration-1000">
              <Book size={200} />
            </div>
            
            <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 bg-amber-500/10 w-fit px-4 py-1.5 rounded-full border border-amber-500/20">MANNE DU JOUR</p>
                  <h3 className="text-3xl font-black text-white tracking-tight italic uppercase">Genèse, Chapitre 12</h3>
                </div>
                <div className="bg-slate-900/80 px-8 py-5 rounded-[2rem] border border-white/10 flex flex-col items-center shadow-xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">PLAN ANNUEL</p>
                  <p className="text-xl font-black text-white">45 <span className="text-slate-600 text-xs">/ 365</span></p>
                </div>
            </div>

            <div className="bg-slate-950/90 p-12 rounded-[2.5rem] border border-white/5 mb-12 leading-relaxed text-xl text-slate-200 font-serif italic relative shadow-inner">
                <span className="absolute -top-4 -left-2 text-8xl text-white/5 font-serif select-none">"</span>
                "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction."
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <button 
                  onClick={() => setIsRead(!isRead)}
                  className={`flex-[3] py-6 font-black uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 text-xs ${
                    isRead ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-white text-slate-950 hover:scale-[1.01] active:scale-95'
                  }`}
                >
                  {isRead ? <CheckCircle2 size={20} /> : <Book size={20} />}
                  {isRead ? 'SÉANCE TERMINÉE' : 'VALIDER LA LECTURE'}
                </button>
                <button 
                  onClick={() => setShowJournal(true)}
                  className="flex-1 py-6 bg-slate-900 rounded-3xl border border-white/10 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-3"
                >
                  <PenTool size={22} />
                  <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Journal</span>
                </button>
            </div>
          </div>

          {/* Reading Plan List */}
          <div className="glass rounded-[3rem] p-10 border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
              <ListChecks size={18} className="text-amber-500" />
              PLAN DE NAVIGATION SPIRITUELLE
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingPlan.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChapter(item.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
                    checkedChapters.includes(item.id) 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-slate-950 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <p className={`text-sm font-black italic tracking-tight uppercase ${checkedChapters.includes(item.id) ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{item.chapter}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    checkedChapters.includes(item.id) ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800 group-hover:border-slate-600'
                  }`}>
                    {checkedChapters.includes(item.id) && <CheckCircle2 size={16} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mental Health Sidebar */}
        <div className="space-y-8">
           <div className="glass rounded-[3rem] p-8 border-white/5 bg-indigo-500/[0.03] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <CloudSun size={24} />
                 </div>
                 <div>
                   <h4 className="font-black text-white uppercase text-[10px] tracking-[0.2em] italic">ÉTAT D'ESPRIT</h4>
                   <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Check-in quotidien</p>
                 </div>
              </div>
              
              <p className="text-xs text-slate-400 mb-8 leading-relaxed font-bold uppercase tracking-tight">Comment vibre ton âme aujourd'hui ?</p>
              
              <div className="grid grid-cols-4 gap-3 mb-8">
                 {moodEmojis.map((mood, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentMood(i)}
                      className={`aspect-square rounded-[1.5rem] flex flex-col items-center justify-center transition-all border shadow-xl relative group ${
                        currentMood === i 
                        ? 'bg-white border-white scale-110 shadow-white/5' 
                        : 'bg-slate-950 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-2xl mb-1">{mood.icon}</span>
                      <span className={`text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity ${currentMood === i ? 'text-slate-950 opacity-100' : 'text-slate-600'}`}>
                        {mood.label}
                      </span>
                    </button>
                 ))}
              </div>
              
              <button 
                onClick={() => setShowJournal(true)}
                className="w-full flex items-center justify-between p-6 bg-slate-950 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group hover:bg-white hover:text-slate-950 transition-all border border-white/5"
              >
                 JOURNAL DE GRATITUDE <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="glass rounded-[3rem] p-8 border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <History size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.2em] italic">ASSIDUITÉ</h4>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">7 derniers jours</p>
                 </div>
              </div>
              
              <div className="flex justify-between gap-2 mb-8">
                 {[1,1,1,0,1,1,1].map((v, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-full h-14 rounded-xl border border-white/5 transition-all relative overflow-hidden ${
                        v ? 'bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-slate-950 opacity-10'
                      }`}>
                        {v === 1 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                      </div>
                      <span className="text-[8px] font-black text-slate-600 uppercase">{['L','M','M','J','V','S','D'][i]}</span>
                    </div>
                 ))}
              </div>
              
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-center">
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] italic">SÉRIE ACTUELLE : 3 JOURS</p>
              </div>
           </div>

           <div className="glass rounded-[3rem] p-8 border-white/5 flex items-center justify-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
              <Flame size={24} className="text-orange-500 group-hover:scale-125 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Mastery Level 14</p>
                <div className="w-32 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="bg-orange-500 h-full w-[65%]" />
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Journaling Modal */}
      {showJournal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-[100px] animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 flex flex-col h-[75vh] shadow-3xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">JOURNAL DE <span className="text-amber-500">GRATITUDE</span></h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Capture les bienfaits invisibles</p>
                </div>
                <button onClick={() => setShowJournal(false)} className="p-4 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 italic text-slate-400 text-sm leading-relaxed">
                  "Se souvenir des bontés passées fortifie la foi pour les défis présents."
                </div>
                <textarea 
                  autoFocus
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Aujourd'hui, je suis reconnaissant pour..."
                  className="flex-1 bg-slate-950/50 rounded-[2.5rem] p-10 text-slate-200 font-serif text-xl leading-relaxed focus:outline-none border border-white/5 focus:border-amber-500/30 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowJournal(false)} className="flex-1 py-6 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">ANNULER</button>
                <button 
                  onClick={saveJournal}
                  className="flex-[2] py-6 bg-amber-500 text-slate-950 font-black uppercase tracking-[0.4em] text-xs rounded-3xl shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  SCELLER LA RÉFLEXION
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
