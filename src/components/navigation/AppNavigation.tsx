import React, { memo } from 'react';
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
import { cx } from '../../theme/recipes';

interface AppNavigationProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  isNavVisible: boolean;
  showMobileUi?: boolean;
}

const desktopItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Resume' },
  { id: 'FINANCE', icon: Wallet, label: 'Finances' },
  { id: 'DISCIPLINE', icon: Clock, label: 'Objectifs' },
  { id: 'STUDIES', icon: BookOpen, label: 'Etudes' },
  { id: 'SPORT', icon: Dumbbell, label: 'Sport' },
  { id: 'LANGUAGES', icon: Languages, label: 'Langues' },
  { id: 'BIBLE', icon: Cross, label: 'Spiritualite' },
  { id: 'SETTINGS', icon: SettingsIcon, label: 'Reglages' },
];

const mobileItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'FINANCE', icon: Wallet, label: 'Finances' },
  { id: 'DISCIPLINE', icon: Clock, label: 'Objectifs' },
  { id: 'STUDIES', icon: BookOpen, label: 'Etudes' },
  { id: 'SETTINGS', icon: SettingsIcon, label: 'Plus' },
];

const navItemBase =
  'ui-focus flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left transition-colors min-h-11';

const AppNavigation: React.FC<AppNavigationProps> = ({ view, onNavigate, isNavVisible, showMobileUi = true }) => {
  return (
    <>
      <aside className="app-navigation hidden border-r border-[color:var(--border)] bg-[color:var(--panel-bg)] px-5 py-6 text-[color:var(--text)] backdrop-blur-xl md:flex md:w-60 md:flex-col">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--tone-primary-text)]">Myflow</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-[-0.05em] text-[color:var(--heading)]">Command Center</h2>
        </div>

        <nav className="flex-1 space-y-2">
          {desktopItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cx(
                  navItemBase,
                  active
                    ? 'border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] text-[color:var(--heading)] shadow-soft'
                    : 'text-[color:var(--text-muted)] hover:border hover:border-[color:var(--border)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]',
                )}
              >
                <span
                  className={cx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                    active
                      ? 'border-[color:var(--tone-warning-border)] bg-[color:var(--accent)] text-[#18212d]'
                      : 'border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-secondary)]',
                  )}
                >
                  <item.icon size={18} />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.22em]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {showMobileUi ? (
        <nav
          className={cx(
            'app-bottom-nav fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[200] flex h-16 w-[92%] max-w-[420px] -translate-x-1/2 items-center justify-between rounded-full border border-[color:var(--border)] bg-[color:var(--panel-bg)] px-2 shadow-premium backdrop-blur-lg transition-all duration-500 md:hidden',
            isNavVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0',
          )}
        >
          {mobileItems.slice(0, 2).map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cx(
                  'ui-focus flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors',
                  active ? 'text-[color:var(--warning)]' : 'text-[color:var(--text-muted)]',
                )}
              >
                <item.icon size={18} />
                <span className="text-center text-[8px] font-black uppercase tracking-[0.18em]">{item.label}</span>
              </button>
            );
          })}

          <div className="relative mx-1 h-12 w-12 -mt-10 shrink-0">
            <div
              className={cx(
                'absolute inset-0 rounded-full blur-xl transition-all duration-500',
                view === 'DASHBOARD' ? 'bg-[color:var(--tone-primary-surface)]' : 'bg-transparent',
              )}
            />
            <button
              onClick={() => onNavigate('DASHBOARD')}
              className={cx(
                'ui-focus absolute inset-0 z-10 flex items-center justify-center rounded-full border-[3px] border-[color:var(--background)] shadow-md transition-all duration-500',
                view === 'DASHBOARD'
                  ? 'bg-[color:var(--accent)] text-[#18212d] scale-105'
                  : 'bg-[color:var(--surface-elevated)] text-[color:var(--text)]',
              )}
            >
              <LayoutGrid size={18} strokeWidth={3} />
            </button>
          </div>

          {mobileItems.slice(2).map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cx(
                  'ui-focus flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors',
                  active ? 'text-[color:var(--warning)]' : 'text-[color:var(--text-muted)]',
                )}
              >
                <item.icon size={18} />
                <span className="text-center text-[8px] font-black uppercase tracking-[0.18em]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}
    </>
  );
};

export default memo(AppNavigation);
