import React, { memo, useEffect, useState } from 'react';
import { Dumbbell, Plus, Target, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const FAB_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.045, duration: 0.22, ease: FAB_EASE },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: 8,
    scale: 0.94,
    transition: { delay: (quickActions.length - 1 - i) * 0.03, duration: 0.15 },
  }),
};

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

        {/* Backdrop overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.button
              key="fab-backdrop"
              aria-label="Fermer le menu d'actions rapides"
              className="pointer-events-auto fixed inset-0 bg-[color:var(--overlay)]/70 backdrop-blur-[6px]"
              onClick={() => setIsOpen(false)}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          )}
        </AnimatePresence>

        {/* Action items */}
        <AnimatePresence>
          {isOpen && (
            <div className="pointer-events-auto flex flex-col gap-3">
              {quickActions.map((item, index) => {
                const Icon = item.icon;
                const tone = toneClassNames[item.tone];

                return (
                  <motion.button
                    key={item.action}
                    custom={index}
                    variants={ITEM_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => {
                      onAction(item.action);
                      setIsOpen(false);
                    }}
                    type="button"
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-panel flex w-[min(88vw,20rem)] items-center gap-4 rounded-[1.6rem] px-4 py-3.5 text-left"
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
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--heading)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* FAB trigger button */}
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: FAB_EASE }}
          className={cx(
            uiRecipes.primaryButton,
            'pointer-events-auto h-16 w-16 rounded-full px-0 py-0 text-[#18212d] shadow-premium',
          )}
        >
          {isOpen ? <X size={24} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={3} />}
        </motion.button>
      </div>
    </div>
  );
};

export default memo(QuickActionsFab);
