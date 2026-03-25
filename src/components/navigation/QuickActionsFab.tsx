import React, { useEffect, useState } from 'react';
import { Dumbbell, Plus, Target, Wallet, X } from 'lucide-react';
import { QuickActionType } from '../../lib/quickActions';

interface QuickActionsFabProps {
  onAction: (action: QuickActionType) => void;
}

const quickActions: Array<{
  action: QuickActionType;
  label: string;
  description: string;
  icon: typeof Wallet;
  accentClassName: string;
}> = [
  {
    action: 'add-transaction',
    label: 'Transaction',
    description: 'Nouvelle dépense ou dépôt',
    icon: Wallet,
    accentClassName: 'text-amber-500'
  },
  {
    action: 'add-mission',
    label: 'Mission',
    description: 'Créer un objectif rapide',
    icon: Target,
    accentClassName: 'text-blue-400'
  },
  {
    action: 'start-sport-session',
    label: 'Sport',
    description: 'Démarrer une séance',
    icon: Dumbbell,
    accentClassName: 'text-rose-400'
  }
];

const QuickActionsFab: React.FC<QuickActionsFabProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="app-fab pointer-events-none fixed inset-0 z-[240]">
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] right-4 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        {isOpen && (
          <button
            aria-label="Fermer le menu d'actions rapides"
            className="pointer-events-auto fixed inset-0 bg-[color:var(--overlay)] backdrop-blur-[10px] saturate-75 md:backdrop-blur-[12px]"
            onClick={() => setIsOpen(false)}
            type="button"
          />
        )}

        <div
          className={`pointer-events-auto flex flex-col gap-3 transition-all duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0 pointer-events-none'
          }`}
        >
          {quickActions.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.action}
                onClick={() => {
                  onAction(item.action);
                  setIsOpen(false);
                }}
                type="button"
                className="group glass-panel flex w-[min(88vw,20rem)] items-center gap-4 rounded-[1.75rem] px-4 py-3 text-left shadow-card backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
                style={{
                  transitionDelay: isOpen ? `${index * 35}ms` : '0ms'
                }}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] ${item.accentClassName}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-primary)]">{item.label}</p>
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
          aria-label={isOpen ? "Fermer les actions rapides" : "Ouvrir les actions rapides"}
          className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500 text-slate-950 shadow-[0_16px_45px_rgba(245,158,11,0.35)] transition-all duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'scale-105 rotate-45' : 'hover:scale-[1.03]'
          }`}
        >
          {isOpen ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};

export default QuickActionsFab;
