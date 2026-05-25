import React, { memo } from 'react';
import {
  BookOpen,
  Clock,
  Cross,
  Database,
  Dumbbell,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Settings as SettingsIcon,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const desktopGroups: Array<{
  title: string;
  items: typeof desktopItems;
}> = [
  {
    title: 'Pilotage',
    items: desktopItems.slice(0, 3),
  },
  {
    title: 'Progression',
    items: desktopItems.slice(3, 7),
  },
  {
    title: 'Systeme',
    items: desktopItems.slice(7),
  },
];

const mobileItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'FINANCE', icon: Wallet, label: 'Finances' },
  { id: 'DISCIPLINE', icon: Clock, label: 'Objectifs' },
  { id: 'STUDIES', icon: BookOpen, label: 'Etudes' },
  { id: 'SETTINGS', icon: SettingsIcon, label: 'Plus' },
];

const NAV_ITEM_BASE =
  'ui-focus group relative flex w-full items-center gap-3 rounded-[1.05rem] px-3.5 py-2.5 text-left transition-colors min-h-11 overflow-hidden';

// ── Desktop sidebar item ──────────────────────────────────────────────────────
const DesktopNavItem = memo(({
  item,
  active,
  onNavigate,
}: {
  item: typeof desktopItems[0];
  active: boolean;
  onNavigate: (v: AppView) => void;
}) => (
  <button
    key={item.id}
    onClick={() => onNavigate(item.id)}
    aria-current={active ? 'page' : undefined}
    className={cx(
      NAV_ITEM_BASE,
      active
        ? 'text-[color:var(--heading)]'
        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]',
    )}
  >
    {/* Animated background for active state */}
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

    <span
      className={cx(
        'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border transition-colors',
        active
          ? 'border-[color:var(--tone-warning-border)] bg-[color:var(--accent)] text-[#18212d]'
          : 'border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] group-hover:border-[color:var(--border-strong)] group-hover:text-[color:var(--text)]',
      )}
    >
      <item.icon size={18} />
    </span>
    <span className="relative z-10 text-xs font-black uppercase tracking-[0.22em]">{item.label}</span>
  </button>
));
DesktopNavItem.displayName = 'DesktopNavItem';

// ── Mobile bottom nav item ────────────────────────────────────────────────────
const MobileNavItem = memo(({
  item,
  active,
  onNavigate,
}: {
  item: typeof mobileItems[0];
  active: boolean;
  onNavigate: (v: AppView) => void;
}) => (
  <button
    onClick={() => onNavigate(item.id)}
    aria-current={active ? 'page' : undefined}
    className={cx(
      'ui-focus relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors',
      active ? 'text-[color:var(--heading)]' : 'text-[color:var(--text-muted)]',
    )}
  >
    {active ? (
      <motion.span
        layoutId="mobile-nav-active-bg"
        className="absolute inset-x-1 inset-y-1 rounded-full border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)]"
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    ) : null}
    <item.icon className="relative z-10" size={18} />
    <span className="relative z-10 text-center text-[8px] font-black uppercase tracking-[0.18em]">{item.label}</span>
  </button>
));
MobileNavItem.displayName = 'MobileNavItem';

// ── Main component ────────────────────────────────────────────────────────────
const AppNavigation: React.FC<AppNavigationProps> = ({ view, onNavigate, isNavVisible, showMobileUi = true }) => {
  const todayLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="app-navigation hidden border-r border-[color:var(--border)] bg-[color:var(--panel-bg)] px-4 py-5 text-[color:var(--text)] backdrop-blur-xl md:flex md:w-72 md:flex-col">
        <div className="mb-5 rounded-[1.35rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] text-[color:var(--accent)]">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--tone-primary-text)]">Myflow</p>
              <h2 className="text-lg font-black uppercase italic leading-5 text-[color:var(--heading)]">Command Center</h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[0.9rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-muted)] px-3 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Session</p>
              <p className="mt-1 text-xs font-black text-[color:var(--heading)]">{todayLabel}</p>
            </div>
            <div className="rounded-[0.9rem] border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] px-3 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[color:var(--tone-success-text)]">Mode</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-black text-[color:var(--tone-success-text)]">
                <ShieldCheck size={13} />
                Local
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto pr-1" aria-label="Navigation principale">
          {desktopGroups.map((group) => (
            <section key={group.title} className="space-y-1.5">
              <p className="px-3 text-[8px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                {group.title}
              </p>
              {group.items.map((item) => (
                <DesktopNavItem
                  key={item.id}
                  item={item}
                  active={view === item.id}
                  onNavigate={onNavigate}
                />
              ))}
            </section>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => onNavigate('DATA_CENTER')}
          className="ui-focus mt-5 flex items-center gap-3 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3.5 py-3 text-left text-[color:var(--text-secondary)] transition-colors hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[color:var(--surface)]">
            <Database size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-[9px] font-black uppercase tracking-[0.2em]">Centre donnees</span>
            <span className="mt-0.5 block truncate text-[11px] font-semibold text-[color:var(--text-muted)]">Sauvegarde et entretien local</span>
          </span>
        </button>
      </aside>

      {/* Mobile bottom navigation */}
      {showMobileUi ? (
        <motion.nav
          aria-label="Navigation mobile"
          className="app-bottom-nav fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-1/2 z-[200] flex h-16 w-[92%] max-w-[430px] -translate-x-1/2 items-center justify-between rounded-full border border-[color:var(--border)] bg-[color:var(--panel-bg)] px-2 shadow-premium backdrop-blur-lg md:hidden"
          animate={{
            y: isNavVisible ? 0 : 80,
            opacity: isNavVisible ? 1 : 0,
            pointerEvents: isNavVisible ? 'auto' : 'none',
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          initial={false}
        >
          {mobileItems.slice(0, 2).map((item) => (
            <MobileNavItem
              key={item.id}
              item={item}
              active={view === item.id}
              onNavigate={onNavigate}
            />
          ))}

          {/* Central Dashboard button */}
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
              className={cx(
                'ui-focus absolute inset-0 z-10 flex items-center justify-center rounded-full border-[3px] border-[color:var(--background)] shadow-md transition-all duration-300',
                view === 'DASHBOARD'
                  ? 'scale-105 bg-[color:var(--accent)] text-[#18212d]'
                  : 'bg-[color:var(--surface-elevated)] text-[color:var(--text)]',
              )}
            >
              <LayoutGrid size={18} strokeWidth={3} />
            </button>
          </div>

          {mobileItems.slice(2).map((item) => (
            <MobileNavItem
              key={item.id}
              item={item}
              active={view === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </motion.nav>
      ) : null}
    </>
  );
};

export default memo(AppNavigation);
