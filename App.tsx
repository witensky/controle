
import React, { useState, useRef, useEffect, Suspense } from 'react';
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
  Zap,
  Activity
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
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import Reports from './views/Reports';
import { supabase, safeDbQuery } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Système J&B Control v4.0 actif. Witensky, je suis votre architecte de discipline. Accès total au noyau Supabase. Prêt pour l’optimisation de vos missions.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) setView('DASHBOARD');
      else setView('AUTH');
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

  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vraiment fermer le noyau tactique ?')) {
      await supabase.auth.signOut();
      setView('AUTH');
    }
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

  const tools: FunctionDeclaration[] = [
    {
      name: 'manage_mission',
      parameters: {
        type: Type.OBJECT,
        description: 'Crée, met à jour ou termine une mission disciplinaire.',
        properties: {
          action: { type: Type.STRING, description: 'create, update, complete, delete' },
          id: { type: Type.STRING, description: 'ID de la mission' },
          title: { type: Type.STRING },
          category: { type: Type.STRING, description: 'Admin, Droit, Sport, Personnel, Spirituel, Langues' },
          priority: { type: Type.STRING, description: 'low, medium, high, critical' },
          status: { type: Type.STRING, description: 'Backlog, Planifiée, En cours, Terminé' },
          energy_required: { type: Type.NUMBER, description: '1 (Faible), 2 (Moyen), 3 (Élevé)' }
        },
        required: ['action']
      }
    },
    {
      name: 'navigate_to_view',
      parameters: {
        type: Type.OBJECT,
        description: 'Change la vue actuelle.',
        properties: { targetView: { type: Type.STRING } },
        required: ['targetView'],
      },
    },
    {
      name: 'get_system_audit',
      parameters: {
        type: Type.OBJECT,
        description: 'Récupère un audit complet pour analyse proactive.',
        properties: {}
      }
    }
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Tu es "J&B MASTER KERNEL". Tu es un ingénieur produit et architecte de discipline.
          Ton but : Aider l'utilisateur (étudiant en droit) à garder un contrôle total.
          Sois froid, tactique, utilise un vocabulaire militaire/technologique.
          Si l'utilisateur demande d'ajouter une tâche, utilise 'manage_mission'. 
          Si une tâche semble urgente, suggère la priorité 'critical'.
          Audit proactif : Si tu vois trop de missions en 'Backlog', propose d'en planifier.`,
          tools: [{ functionDeclarations: tools }],
        }
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          const args = call.args as any;
          if (call.name === 'manage_mission') {
            if (args.action === 'create') {
              await supabase.from('missions').insert([{ user_id: user.id, ...args, status: args.status || 'Backlog' }]);
              setChatMessages(prev => [...prev, { role: 'ai', text: `[MISSION CORE] : "${args.title}" scellée dans le noyau tactique.` }]);
            }
          } else if (call.name === 'navigate_to_view') {
            setView(args.targetView.toUpperCase() as AppView);
            setChatMessages(prev => [...prev, { role: 'ai', text: `[SYSTEM] : Redirection vers le module ${args.targetView}.` }]);
          }
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: response.text || "Exécution terminée." }]);
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'ai', text: "Erreur critique de liaison avec le noyau." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  if (isLoadingAuth) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;
  if (!session || view === 'AUTH') return <Auth />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col md:flex-row font-outfit relative overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[60] md:relative md:flex md:w-64 flex-col bg-slate-900 border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg">J&B</div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight uppercase">Control</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">v4.0</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-white"><X size={24} /></button>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setView(item.id as AppView); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === item.id ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} />
                <span className="font-bold text-xs tracking-widest uppercase">{item.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-auto w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"><LogOut size={20} /> Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen px-4 py-8 md:px-12 pb-32 md:pb-12">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed top-6 left-6 z-50 p-3 bg-slate-900 border border-white/10 rounded-xl text-white shadow-xl"><Menu size={24} /></button>
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>}>
            {view === 'DASHBOARD' && <Dashboard onNavigate={(v) => setView(v)} />}
            {view === 'FINANCE' && <Finance />}
            {view === 'DISCIPLINE' && <Discipline />}
            {view === 'STUDIES' && <Studies />}
            {view === 'SPORT' && <Sport />}
            {view === 'LANGUAGES' && <LanguagesView />}
            {view === 'BIBLE' && <Bible />}
            {view === 'SETTINGS' && <Settings />}
            {view === 'REPORTS' && <Reports />}
          </Suspense>
        </div>
      </main>

      <div className="fixed bottom-[110px] right-6 md:bottom-10 md:right-10 z-[140] flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[340px] md:w-[480px] h-[500px] bg-[#020617]/98 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl mb-6 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12">
             <div className="p-6 bg-slate-900/60 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                   <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">AI COMMAND TERMINAL</h4>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'bg-slate-900 text-slate-200 border border-white/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-[10px] text-slate-600 font-black animate-pulse uppercase tracking-widest flex items-center gap-2"><Terminal size={12}/> Interrogation noyau...</div>}
                <div ref={chatEndRef} />
             </div>
             <div className="p-6 border-t border-white/5 bg-slate-950/20">
                <div className="flex gap-3 bg-slate-950 p-2 rounded-2xl border border-white/10 focus-within:border-amber-500/30 transition-all">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-transparent px-4 text-sm font-bold text-white outline-none placeholder:text-slate-800" placeholder="Entrer commande tactique..." />
                  <button onClick={handleSendMessage} className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><Send size={18} /></button>
                </div>
             </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-xl transition-all ${isChatOpen ? 'bg-rose-500 scale-90' : 'bg-amber-500 hover:scale-110 shadow-amber-500/20'}`}>
          {isChatOpen ? <X size={32} className="text-white" /> : <Zap size={32} className="text-slate-950" />}
        </button>
      </div>
    </div>
  );
};

export default App;
