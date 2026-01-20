
import React, { useState } from 'react';
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
  Settings as SettingsIcon
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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('AUTH');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('AUTH');
  };

  if (view === 'AUTH') {
    return <Auth onLogin={handleLogin} />;
  }

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row font-outfit">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-950">J&B</div>
          <span className="font-bold tracking-tighter text-lg uppercase italic">Discipline</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-50 md:relative md:flex md:w-64 flex-col bg-slate-900 border-r border-white/5 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-amber-500/20">J&B</div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight uppercase">Control</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rigueur & Discipline</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as AppView);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${view === item.id 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} className={`${view === item.id ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                <span className="font-medium text-sm tracking-wide uppercase">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-medium text-sm"
            >
              <LogOut size={20} />
              <span className="uppercase tracking-wide">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen px-4 py-8 md:px-10 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {view === 'DASHBOARD' && <Dashboard onNavigate={(v) => setView(v)} />}
          {view === 'FINANCE' && <Finance />}
          {view === 'DISCIPLINE' && <Discipline />}
          {view === 'STUDIES' && <Studies />}
          {view === 'SPORT' && <Sport />}
          {view === 'LANGUAGES' && <LanguagesView />}
          {view === 'BIBLE' && <Bible />}
          {view === 'SETTINGS' && <Settings />}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Quick Access) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass h-20 flex items-center justify-around px-2 z-40 border-t border-white/10">
        {navItems.slice(0, 5).map((item) => (
           <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`flex flex-col items-center gap-1 transition-all ${view === item.id ? 'text-amber-500 scale-110' : 'text-slate-500'}`}
          >
            <item.icon size={22} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
