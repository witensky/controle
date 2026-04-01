import React, { useEffect, useState } from 'react';
import { Dumbbell, Plus, Target, Wallet, X } from 'lucide-react';
import { QuickActionType } from '../../lib/quickActions';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';

interface QuickActionsFabProps {
  onAction: (action: QuickActionType) => void;
}

const quickActions: Array<{
  action: QuickActionType;
  label: string;
  description: string;
  icon: typeof Wallet;
  tone: 'warning' | 'info' | 'danger';
}> = [
  {
    action: 'add-transaction',
    label: 'Transaction',
    description: 'Nouvelle depense ou depot',
    icon: Wallet,
    tone: 'warning',
  },
  {
    action: 'add-mission',
    label: 'Mission',
    description: 'Creer un objectif rapide',
    icon: Target,
    tone: 'info',
  },
  {
    action: 'start-sport-session',
    label: 'Sport',
    description: 'Demarrer une seance',
    icon: Dumbbell,
    tone: 'danger',
  },
];

const QuickActionsFab: React.FC<QuickActionsFabProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="app-fab pointer-events-none fixed inset-0 z-[240]">
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] right-4 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        {isOpen ? (
          <button
            aria-label="Fermer le menu d'actions rapides"
            className="pointer-events-auto fixed inset-0 bg-[color:var(--overlay)] backdrop-blur-[10px] saturate-75 md:backdrop-blur-[12px]"
            onClick={() => setIsOpen(false)}
            type="button"
          />
        ) : null}

        <div
          className={cx(
            'pointer-events-auto flex flex-col gap-3 transition-all duration-300 ease-out motion-reduce:transition-none',
            isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0',
          )}
        >
          {quickActions.map((item, index) => {
            const Icon = item.icon;
            const tone = toneClassNames[item.tone];

            return (
              <button
                key={item.action}
                onClick={() => {
                  onAction(item.action);
                  setIsOpen(false);
                }}
                type="button"
                className="group glass-panel flex w-[min(88vw,20rem)] items-center gap-4 rounded-[1.6rem] px-4 py-3.5 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
                style={{ transitionDelay: isOpen ? `${index * 35}ms` : '0ms' }}
              >
                <div
                  className={cx(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-[color:var(--surface-muted)]',
                    tone.shell,
                    tone.icon,
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--heading)]">{item.label}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
          className={cx(
            uiRecipes.primaryButton,
            'pointer-events-auto h-16 w-16 rounded-full px-0 py-0 text-[#18212d] shadow-premium',
            isOpen ? 'scale-105 rotate-45' : 'hover:scale-[1.03]',
          )}
        >
          {isOpen ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

export default QuickActionsFab;
