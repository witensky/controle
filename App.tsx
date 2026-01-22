
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Clock, 
  BookOpen, 
  Languages, 
  ShieldCheck, 
  LogOut,
  X,
  Cross,
  Dumbbell,
  Settings as SettingsIcon,
  Send,
  Loader2,
  Terminal,
  Zap,
  Activity,
  LayoutGrid,
  ChevronRight,
  Menu,
  MessageSquare
} from 'lucide-react';
import { AppView } from './types';
import Dashboard from './views/Dashboard';
import Finance from './views/Finance';
import Discipline from './views/Discipline';
import Studies from './views/Studies';
import LanguagesView from './views/LanguagesView';
import Bible from './views/Bible';
import Auth from './views/Auth';
import Sport from './views/Sport';
import Settings from './views/Settings';
import { GoogleGenAI } from "@google/genai";
import Reports from './views/Reports';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Système J&B LIFEFLOW v4.5 actif. Je suis votre assistant tactique personnel. Comment puis-je optimiser votre performance aujourd\'hui ?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (!currentSession) setView('AUTH');
      setIsLoadingAuth(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) setView(prev => prev === 'AUTH' ? 'DASHBOARD' : prev);
      else if (event === 'SIGNED_OUT') setView('AUTH');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleLogout = async () => {
    if (window.confirm('Fermer le noyau tactique ?')) {
      await supabase.auth.signOut();
      setView('AUTH');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Tu es "J&B LIFEFLOW AI", un assistant expert en productivité, finance et discipline. Ton ton est professionnel, concis et motivant. Tu aides l'utilisateur à naviguer dans son Dashboard et à atteindre ses objectifs.`
        }
      });
      setChatMessages(prev => [...prev, { role: 'ai', text: response.text || "Requête traitée par le noyau." }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Erreur de liaison tactique. Vérifiez votre connexion." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
    return (
      <div className="flex flex-col items-center">
        <div className={`relative ${dim} bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-xl shadow-amber-500/20 rotate-3`}>
          JB
        </div>
        <span className="text-[7px] font-black text-white tracking-[0.3em] uppercase mt-1">LIFEFLOW</span>
      </div>
    );
  };

  if (isLoadingAuth) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;
  if (!session || view === 'AUTH') return <Auth />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col md:flex-row font-outfit relative">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 border-r border-white/5 p-8">
        <div className="mb-12"><Logo size="md" /></div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'FINANCE', icon: Wallet, label: 'Finances' },
            { id: 'DISCIPLINE', icon: Clock, label: 'Missions' },
            { id: 'STUDIES', icon: BookOpen, label: 'Droit' },
            { id: 'SPORT', icon: Dumbbell, label: 'Sport' },
            { id: 'LANGUAGES', icon: Languages, label: 'Langues' },
            { id: 'BIBLE', icon: Cross, label: 'Mental' },
            { id: 'SETTINGS', icon: SettingsIcon, label: 'Settings' },
          ].map((item) => (
            <button key={item.id} onClick={() => setView(item.id as AppView)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === item.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-white/5'}`}>
              <item.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 text-rose-500 text-[10px] font-black uppercase px-4"><LogOut size={18} /> Exit</button>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-[#020617]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-[150] glass border-b border-white/5">
           <Logo size="sm" />
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black">W</div>
           </div>
        </header>

        <div className="px-4 py-6 md:px-12 md:py-10 pb-40 md:pb-12 max-w-6xl mx-auto">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>}>
            <div className="animate-in fade-in duration-500">
              {view === 'DASHBOARD' && <Dashboard onNavigate={(v) => setView(v)} />}
              {view === 'FINANCE' && <Finance />}
              {view === 'DISCIPLINE' && <Discipline />}
              {view === 'STUDIES' && <Studies />}
              {view === 'SPORT' && <Sport />}
              {view === 'LANGUAGES' && <LanguagesView />}
              {view === 'BIBLE' && <Bible />}
              {view === 'SETTINGS' && <Settings />}
              {view === 'REPORTS' && <Reports />}
            </div>
          </Suspense>
        </div>
      </main>

      {/* FLOATING ACTION BUTTON (CHATBOT) */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed z-[450] right-6 bottom-24 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-110 active:scale-95 ${
          isChatOpen ? 'bg-rose-500 rotate-90' : 'bg-amber-500 animate-pulse-glow'
        }`}
      >
        {isChatOpen ? <X size={28} className="text-white" /> : <Zap size={28} className="text-slate-950" />}
      </button>

      {/* BOTTOM NAVIGATION MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] glass border-t border-white/5 h-20 flex items-center justify-around px-2 pb-safe">
        <button onClick={() => setView('FINANCE')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${view === 'FINANCE' ? 'text-amber-500' : 'text-slate-500'}`}>
          <Wallet size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Finances</span>
        </button>
        <button onClick={() => setView('DISCIPLINE')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${view === 'DISCIPLINE' ? 'text-amber-500' : 'text-slate-500'}`}>
          <Clock size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Missions</span>
        </button>
        <div className="relative w-16 h-16 -mt-10">
          <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${view === 'DASHBOARD' ? 'bg-amber-500/30 scale-125' : 'bg-transparent'}`} />
          <button onClick={() => setView('DASHBOARD')} className={`absolute inset-0 rounded-full flex items-center justify-center border-[3.5px] border-[#020617] shadow-2xl transition-all z-10 ${view === 'DASHBOARD' ? 'bg-amber-500 text-slate-950 scale-110 animate-pulse-glow' : 'bg-slate-900 text-white'}`}>
            <LayoutGrid size={24} strokeWidth={3} />
          </button>
        </div>
        <button onClick={() => setView('STUDIES')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${view === 'STUDIES' ? 'text-amber-500' : 'text-slate-500'}`}>
          <BookOpen size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Droit</span>
        </button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-white transition-colors">
          <LayoutGrid size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Plus</span>
        </button>
      </nav>

      {/* MOBILE MORE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-3xl flex flex-col p-8 animate-slide-up">
           <div className="flex justify-between items-center mb-12">
              <Logo size="md" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-full text-white shadow-xl"><X size={24} /></button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'SPORT', icon: Dumbbell, label: 'Sport', color: 'text-rose-500' },
                { id: 'LANGUAGES', icon: Languages, label: 'Langues', color: 'text-blue-500' },
                { id: 'BIBLE', icon: Cross, label: 'Bible & Mental', color: 'text-amber-500' },
                { id: 'SETTINGS', icon: SettingsIcon, label: 'Paramètres', color: 'text-slate-400' },
                { id: 'REPORTS', icon: Activity, label: 'Rapports', color: 'text-emerald-500' },
              ].map((item) => (
                <button key={item.id} onClick={() => { setView(item.id as AppView); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center gap-4 p-8 glass rounded-[2.5rem] border border-white/5 active:scale-95 transition-all">
                  <item.icon size={32} className={item.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
                </button>
              ))}
           </div>
           <button onClick={handleLogout} className="mt-auto w-full py-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] shadow-lg">Déconnexion Noyau</button>
        </div>
      )}

      {/* AI CHAT INTERFACE */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[400] md:inset-auto md:bottom-28 md:right-10 md:w-[420px] md:h-[650px] bg-slate-950/95 backdrop-blur-2xl md:rounded-[3rem] border border-white/10 flex flex-col overflow-hidden animate-slide-up shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
           <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg">
                    <Zap size={20} strokeWidth={3} />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">LIFEFLOW AI</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">En ligne</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="md:hidden text-slate-500 p-2"><X size={28} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-5 rounded-2xl text-[12px] font-bold leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                    ? 'bg-amber-500 text-slate-950 rounded-tr-none' 
                    : 'bg-slate-900 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-slate-900 p-5 rounded-2xl flex gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
           </div>
           
           <div className="p-8 border-t border-white/5 bg-slate-900/20 pb-safe">
              <div className="flex gap-3 bg-slate-950 p-2 rounded-2xl border border-white/10 focus-within:border-amber-500/50 transition-all shadow-inner">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                  className="flex-1 bg-transparent px-4 text-[13px] font-bold text-white outline-none placeholder:text-slate-700" 
                  placeholder="Commandez le noyau..." 
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || isTyping}
                  className="w-12 h-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-30"
                >
                  <Send size={18} strokeWidth={3} />
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
