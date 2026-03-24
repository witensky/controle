import React from 'react';
import {
  BookOpen,
  Clock,
  Cross,
  Dumbbell,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  Settings as SettingsIcon,
  Wallet,
} from 'lucide-react';
import { AppView } from '../../types';

interface AppNavigationProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  isNavVisible: boolean;
  showMobileUi?: boolean;
}

const desktopItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Résumé' },
  { id: 'FINANCE', icon: Wallet, label: 'Finances' },
  { id: 'DISCIPLINE', icon: Clock, label: 'Objectifs' },
  { id: 'STUDIES', icon: BookOpen, label: 'Études' },
  { id: 'SPORT', icon: Dumbbell, label: 'Sport' },
  { id: 'LANGUAGES', icon: Languages, label: 'Langues' },
  { id: 'BIBLE', icon: Cross, label: 'Spiritualité' },
  { id: 'SETTINGS', icon: SettingsIcon, label: 'Réglages' },
];

const mobileItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'FINANCE', icon: Wallet, label: 'Finances' },
  { id: 'DISCIPLINE', icon: Clock, label: 'Objectifs' },
  { id: 'STUDIES', icon: BookOpen, label: 'Études' },
  { id: 'SETTINGS', icon: SettingsIcon, label: 'Plus' },
];

const AppNavigation: React.FC<AppNavigationProps> = ({ view, onNavigate, isNavVisible, showMobileUi = true }) => {
  return (
    <>
      <aside className="app-navigation hidden md:flex md:w-56 flex-col bg-slate-900 border-r border-white/5 px-5 py-6">
        <nav className="flex-1 space-y-2">
          {desktopItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                view === item.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {showMobileUi ? (
        <nav
          className={`app-bottom-nav md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[200] glass border border-white/10 rounded-full h-14 flex items-center justify-between px-2 w-[92%] max-w-[400px] transition-all duration-500 will-change-transform ${
            isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          {mobileItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-all ${
                view === item.id ? 'text-amber-500' : 'text-slate-500'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-center">{item.label}</span>
            </button>
          ))}

          <div className="relative w-12 h-12 -mt-10 shrink-0 mx-1">
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${view === 'DASHBOARD' ? 'bg-amber-500/30' : 'bg-transparent'}`} />
            <button
              onClick={() => onNavigate('DASHBOARD')}
              className={`absolute inset-0 rounded-full flex items-center justify-center border-[3px] border-[#020617] shadow-xl transition-all duration-500 z-10 ${
                view === 'DASHBOARD' ? 'bg-amber-500 text-slate-950 scale-105' : 'bg-slate-900 text-white'
              }`}
            >
              <LayoutGrid size={18} strokeWidth={3} />
            </button>
          </div>

          {mobileItems.slice(2).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-all ${
                view === item.id ? 'text-amber-500' : 'text-slate-500'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-center">{item.label}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </>
  );
};

export default AppNavigation;
