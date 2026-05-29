import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx, uiRecipes } from '../../theme/recipes';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClassName?: string;
  bodyClassName?: string;
  panelClassName?: string;
  centered?: boolean;
}

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 18, scale: 0.972 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.982 },
};

const TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
const EXIT_TRANSITION = { duration: 0.16, ease: [0.4, 0, 1, 1] as const };

const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerActions,
  footer,
  children,
  maxWidthClassName = 'max-w-4xl',
  bodyClassName = '',
  panelClassName = '',
  centered = false,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const [portalNode, setPortalNode] = useState<Element | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('modal-root') || document.body);
  }, []);

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-overlay"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={EXIT_TRANSITION}
          className="fixed inset-0 z-[300] bg-[color:var(--overlay)]/90 backdrop-blur-2xl after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-[color:var(--overlay)]/20 after:pointer-events-none"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={TRANSITION}
            className={`flex min-h-[100dvh] justify-center p-2 sm:p-4 md:p-6 ${centered ? 'items-center' : 'items-start'}`}
          >
            <div
              className={[
                uiRecipes.modalPanel,
                'flex w-full flex-col overflow-hidden',
                'max-h-[calc(100dvh-1rem)] md:max-h-[calc(100dvh-3rem)]',
                maxWidthClassName,
                panelClassName,
              ].join(' ')}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="ui-modal-header shrink-0 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      {icon ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--tone-primary-border)] bg-[color:var(--tone-primary-surface)] text-[color:var(--tone-primary-text)]">
                          {icon}
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-[color:var(--heading)] sm:text-2xl md:text-3xl">
                          {title}
                        </h2>
                        {subtitle ? (
                          <p className="mt-2 max-w-2xl text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)] sm:text-[11px]">
                            {subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {headerActions}
                    <button
                      type="button"
                      onClick={onClose}
                      className={cx(uiRecipes.ghostButton, 'h-12 w-12 rounded-full px-0 py-0')}
                      aria-label="Fermer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Body ── */}
              <div
                className={[
                  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8',
                  bodyClassName,
                ].join(' ')}
              >
                {children}
              </div>

              {/* ── Footer ── */}
              {footer ? (
                <div className="ui-modal-footer shrink-0 px-4 py-4 sm:px-6 md:px-8">
                  {footer}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!portalNode) return <>{modalContent}</>;
  return createPortal(modalContent, portalNode);
};

export default ModalShell;
