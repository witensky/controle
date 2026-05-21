import React, { memo } from 'react';
import {
  BookOpen, Clock, Cross, Dumbbell, Languages,
  LayoutDashboard, LayoutGrid, Settings as SettingsIcon, Wallet,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

const NAV_ITEM_BASE = 'ui-focus relative flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left transition-colors min-h-11 overflow-hidden';

const DesktopNavItem = memo(({ item, active, onNavigate }: {
  item: typeof desktopItems[0]; active: boolean; onNavigate: (v: AppView) => void;
}) => (
  <button
    onClick={() => onNavigate(item.id)}
    aria-current={active ? 'page' : undefined}
    className={cx(NAV_ITEM_BASE, active ? 'text-[color:var(--heading)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]')}
  >
    <AnimatePresence>
      {active && (
        <motion.span
          layoutId="desktop-nav-active-bg"
          className="absolute inset-0 rounded-[1.2rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ zIndex: 0 }}
        />
      )}
    </AnimatePresence>
    <span className={cx('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors', active ? 'border-[color:var(--tone-warning-border)] bg-[color:var(--accent)] text-[#18212d]' : 'border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-secondary)]')}>
      <item.icon size={18} />
    </span>
    <span className="relative z-10 text-xs font-black uppercase tracking-[0.22em]">{item.label}</span>
  </button>
));
DesktopNavItem.displayName = 'DesktopNavItem';

const MobileNavItem = memo(({ item, active, onNavigate }: {
  item: typeof mobileItems[0]; active: boolean; onNavigate: (v: AppView) => void;
}) => (
  <button
    onClick={() => onNavigate(item.id)}
    aria-current={active ? 'page' : undefined}
    className={cx('ui-focus flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors', active ? 'text-[color:var(--warning)]' : 'text-[color:var(--text-muted)]')}
  >
    <item.icon size={18} />
    <span className="text-center text-[8px] font-black uppercase tracking-[0.18em]">{item.label}</span>
  </button>
));
MobileNavItem.displayName = 'MobileNavItem';

const AppNavigation: React.FC<AppNavigationProps> = ({ view, onNavigate, isNavVisible, showMobileUi = true }) => {
  return (
    <>
      <aside className="app-navigation hidden border-r border-[color:var(--border)] bg-[color:var(--panel-bg)] px-5 py-6 text-[color:var(--text)] backdrop-blur-xl md:flex md:w-60 md:flex-col">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--tone-primary-text)]">Myflow</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-[-0.05em] text-[color:var(--heading)]">Command Center</h2>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Navigation principale">
          {desktopItems.map((item) => (
            <DesktopNavItem key={item.id} item={item} active={view === item.id} onNavigate={onNavigate} />
          ))}
        </nav>
      </aside>

      {showMobileUi ? (
        <motion.nav
          aria-label="Navigation mobile"
          className="app-bottom-nav fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[200] flex h-16 w-[92%] max-w-[420px] -translate-x-1/2 items-center justify-between rounded-full border border-[color:var(--border)] bg-[color:var(--panel-bg)] px-2 shadow-premium backdrop-blur-lg md:hidden"
          animate={{ y: isNavVisible ? 0 : 80, opacity: isNavVisible ? 1 : 0, pointerEvents: isNavVisible ? 'auto' : 'none' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          initial={false}
        >
          {mobileItems.slice(0, 2).map((item) => (
            <MobileNavItem key={item.id} item={item} active={view === item.id} onNavigate={onNavigate} />
          ))}

          <div className="relative mx-1 -mt-10 h-12 w-12 shrink-0">
            <AnimatePresence>
              {view === 'DASHBOARD' && (
                <motion.div
                  key="dashboard-glow"
                  className="absolute inset-0 rounded-full bg-[color:var(--tone-primary-surface)]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.4 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ filter: 'blur(10px)', zIndex: 0 }}
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => onNavigate('DASHBOARD')}
              aria-current={view === 'DASHBOARD' ? 'page' : undefined}
              aria-label="Dashboard"
              className={cx('ui-focus absolute inset-0 z-10 flex items-center justify-center rounded-full border-[3px] border-[color:var(--background)] shadow-md transition-all duration-300', view === 'DASHBOARD' ? 'scale-105 bg-[color:var(--accent)] text-[#18212d]' : 'bg-[color:var(--surface-elevated)] text-[color:var(--text)]')}
            >
              <LayoutGrid size={18} strokeWidth={3} />
            </button>
          </div>

          {mobileItems.slice(2).map((item) => (
            <MobileNavItem key={item.id} item={item} active={view === item.id} onNavigate={onNavigate} />
          ))}
        </motion.nav>
      ) : null}
    </>
  );
};

export default memo(AppNavigation);
