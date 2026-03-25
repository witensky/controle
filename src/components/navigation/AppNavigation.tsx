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
      <aside className="app-navigation hidden md:flex md:w-56 flex-col border-r border-[color:var(--border)] bg-[color:var(--card)] px-5 py-6 text-[color:var(--text-primary)] backdrop-blur">
        <nav className="flex-1 space-y-2">
          {desktopItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                view === item.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-[color:var(--text-muted)] hover:bg-[color:var(--muted)] hover:text-[color:var(--text-primary)]'
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
          className={`app-bottom-nav md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[200] glass rounded-full h-14 flex items-center justify-between px-2 w-[92%] max-w-[400px] transition-all duration-500 will-change-transform ${
            isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          {mobileItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-all ${
                view === item.id ? 'text-amber-500' : 'text-[color:var(--text-muted)]'
              }`}
            >
              <item.icon size={18} />
              <span className="mt-0.5 text-center text-[8px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}

          <div className="relative mx-1 h-12 w-12 -mt-10 shrink-0">
            <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${view === 'DASHBOARD' ? 'bg-amber-500/30' : 'bg-transparent'}`} />
            <button
              onClick={() => onNavigate('DASHBOARD')}
              className={`absolute inset-0 z-10 flex items-center justify-center rounded-full border-[3px] border-[color:var(--app-bg)] shadow-xl transition-all duration-500 ${
                view === 'DASHBOARD'
                  ? 'bg-amber-500 text-slate-950 scale-105'
                  : 'bg-[color:var(--surface)] text-[color:var(--text-primary)]'
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
                view === item.id ? 'text-amber-500' : 'text-[color:var(--text-muted)]'
              }`}
            >
              <item.icon size={18} />
              <span className="mt-0.5 text-center text-[8px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </>
  );
};

export default AppNavigation;

