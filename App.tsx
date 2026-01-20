
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Clock, 
  BookOpen, 
  Languages, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  Cross,
  Dumbbell,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Terminal,
  Zap
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
import { GoogleGenAI, Type } from "@google/genai";
import Reports from './views/Reports';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('AUTH');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // Chatbot Global State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Système J&B Control v3.2 actif. Witensky, je suis votre interface de commandement IA. Prêt pour l’exécution tactique.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Écoute des changements d'état d'authentification Supabase
  useEffect(() => {
    // Fixed: Cast to any to access Supabase auth methods which are missing in types but present in runtime
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) setView('DASHBOARD');
      setIsLoadingAuth(false);
    });

    // Fixed: Cast to any to access Supabase auth methods which are missing in types but present in runtime
    const {
      data: { subscription },
    } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) {
        setView('DASHBOARD');
      } else {
        setView('AUTH');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Fixed: Cast to any to access Supabase auth methods which are missing in types but present in runtime
    await (supabase.auth as any).signOut();
    setView('AUTH');
    setIsChatOpen(false);
  };

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'FINANCE', icon: Wallet, label: 'Finances' },
    { id: 'DISCIPLINE', icon: Clock, label: 'Discipline' },
    { id: 'STUDIES', icon: BookOpen, label: 'Droit' },
    { id: 'SPORT', icon: Dumbbell, label: 'Sport' },
    { id: 'LANGUAGES', icon: Languages, label: 'Langues' },
    { id: 'BIBLE', icon: Cross, label: 'Bible & Mental' },
    { id: 'SETTINGS', icon: SettingsIcon, label: 'Paramètres' },
  ];

  // AI Master System Access Logic
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const navigateViewTool = {
        name: 'navigate_to_view',
        parameters: {
          type: Type.OBJECT,
          description: 'Change la vue actuelle de l’application.',
          properties: {
            targetView: { type: Type.STRING, description: 'DASHBOARD, FINANCE, DISCIPLINE, STUDIES, SPORT, LANGUAGES, BIBLE, SETTINGS' },
          },
          required: ['targetView'],
        },
      };

      const systemCommandTool = {
        name: 'execute_system_command',
        parameters: {
          type: Type.OBJECT,
          description: 'Exécute une commande de modification ou d’ajout de données.',
          properties: {
            action: { type: Type.STRING, description: 'ADD_TASK, LOG_EXPENSE, UPDATE_GOAL' },
            details: { type: Type.STRING, description: 'Description de la commande' }
          },
          required: ['action', 'details'],
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Tu es "J&B MASTER KERNEL", l'intelligence centrale de Witensky. 
          Tu as un accès total : navigation, modification de données, recherche d'informations.
          Ton ton est minimaliste, militaire, et focalisé sur l'excellence.
          Réponds toujours de manière concise.`,
          tools: [{ functionDeclarations: [navigateViewTool, systemCommandTool] }],
        }
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'navigate_to_view') {
            const target = (call.args as any).targetView.toUpperCase() as AppView;
            setView(target);
            setChatMessages(prev => [...prev, { role: 'ai', text: `Déploiement du module ${target}.` }]);
          }
          if (call.name === 'execute_system_command') {
             setChatMessages(prev => [...prev, { role: 'ai', text: `Commande [${(call.args as any).action}] traitée : ${(call.args as any).details}` }]);
          }
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: response.text || "Commande reçue et analysée." }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Liaison satellite interrompue. Vérifiez le noyau." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!session || view === 'AUTH') return <Auth />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row font-outfit relative overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-0 z-[60] md:relative md:flex md:w-64 flex-col bg-slate-900 border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-amber-500/20">J&B</div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight uppercase">Control</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Kernel v3.2</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400"><X size={20} /></button>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setView(item.id as AppView); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${view === item.id ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} className={`${view === item.id ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                <span className="font-bold text-xs tracking-widest uppercase">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-white/5">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"><LogOut size={20} /> Shutdown</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen px-4 py-8 md:px-12 pb-32 md:pb-12 print:p-0">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
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
      </main>

      {/* CHATBOT COMMAND TERMINAL */}
      <div className="fixed bottom-[110px] right-6 md:bottom-10 md:right-10 z-[140] flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[340px] md:w-[480px] h-[500px] bg-[#020617]/98 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] mb-6 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-500 ring-1 ring-white/10 z-[150]">
             <div className="p-6 bg-slate-900/60 flex flex-col border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20"><Terminal size={24} strokeWidth={2.5} /></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">AI COMMAND TERMINAL</h4>
                        <p className="text-[8px] text-emerald-500 font-black uppercase mt-1 tracking-widest">{session?.user?.email?.split('@')[0]} • Session Active</p>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-2.5 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all active:scale-90"><X size={20} /></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/20">
                <div className="space-y-6">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-xs leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-amber-500 text-slate-950 border-none' : 'bg-slate-900/90 text-slate-200 border border-white/5'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                         <Loader2 size={14} className="animate-spin text-amber-500" />
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Analyse du noyau...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
             </div>

             <div className="p-6 bg-slate-900/40 border-t border-white/5">
                <div className="flex gap-3 p-1.5 bg-slate-950 rounded-2xl border border-white/10 shadow-inner">
                  <input 
                    type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                    placeholder="Entrez une commande système..." 
                    className="flex-1 bg-transparent px-5 text-sm font-bold text-white outline-none placeholder:text-slate-800" 
                  />
                  <button onClick={handleSendMessage} disabled={isTyping} className="w-12 h-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-xl shadow-amber-500/10"><Send size={20} strokeWidth={3} /></button>
                </div>
             </div>
          </div>
        )}

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`group w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(251,191,36,0.4)] transition-all duration-500 hover:scale-110 active:scale-90 border-2 ${isChatOpen ? 'bg-[#020617] border-rose-500 rotate-90 shadow-rose-500/20' : 'bg-amber-500 border-white/10 shadow-amber-500/30'}`}
        >
          {isChatOpen ? <X size={32} className="text-rose-500" /> : <Zap size={32} className="text-slate-950 group-hover:animate-pulse" fill="currentColor" />}
        </button>
      </div>

      {!isChatOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass h-20 flex items-center justify-around px-2 z-[90] border-t border-white/10 print:hidden">
          {navItems.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => setView(item.id as AppView)} className={`flex flex-col items-center gap-1 transition-all ${view === item.id ? 'text-amber-500 scale-110' : 'text-slate-500'}`}>
              <item.icon size={22} /><span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
