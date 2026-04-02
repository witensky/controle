import React from 'react';
import { X } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[color:var(--overlay)]/92 backdrop-blur-2xl">
      <div className={`flex min-h-[100dvh] justify-center p-2 sm:p-4 md:p-6 ${centered ? 'items-center' : 'items-start'}`}>
        <div
          className={[
            uiRecipes.modalPanel,
            'flex w-full flex-col overflow-hidden',
            'max-h-[calc(100dvh-1rem)] md:max-h-[calc(100dvh-3rem)]',
            maxWidthClassName,
            panelClassName,
          ].join(' ')}
        >
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

          <div className={['min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8', bodyClassName].join(' ')}>
            {children}
          </div>

          {footer ? (
            <div className="ui-modal-footer shrink-0 px-4 py-4 sm:px-6 md:px-8">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
