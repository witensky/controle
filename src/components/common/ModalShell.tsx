import React from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[300] bg-slate-950/96 backdrop-blur-2xl">
      <div className={`flex min-h-[100dvh] justify-center p-2 sm:p-4 md:p-6 ${centered ? 'items-center' : 'items-start'}`}>
        <div
          className={[
            'flex w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1121] shadow-[0_30px_80px_rgba(2,6,23,0.65)]',
            'max-h-[calc(100dvh-1rem)] md:max-h-[calc(100dvh-3rem)]',
            maxWidthClassName,
            panelClassName,
          ].join(' ')}
        >
          <div className="shrink-0 border-b border-white/5 bg-slate-900/55 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  {icon ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white">
                      {icon}
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <h2 className="text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl md:text-3xl">
                      {title}
                    </h2>
                    {subtitle ? (
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 sm:text-[11px]">
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
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
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
            <div className="shrink-0 border-t border-white/5 bg-[#09101f]/92 px-4 py-4 sm:px-6 md:px-8">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
