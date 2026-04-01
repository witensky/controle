import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BellRing, PencilLine } from 'lucide-react';
import ModalShell from './ModalShell';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';

type DialogTone = 'default' | 'danger' | 'warning';

type AlertOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: DialogTone;
};

type ConfirmOptions = AlertOptions & {
  cancelLabel?: string;
};

type PromptOptions = ConfirmOptions & {
  initialValue?: string;
  placeholder?: string;
};

type DialogState =
  | ({ kind: 'alert' } & AlertOptions)
  | ({ kind: 'confirm' } & ConfirmOptions)
  | ({ kind: 'prompt' } & PromptOptions);

type AppDialogContextValue = {
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showPrompt: (options: PromptOptions) => Promise<string | null>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

const TONE_META: Record<DialogTone, { icon: React.ReactNode; button: string; buttonTone?: keyof typeof toneClassNames }> = {
  default: {
    icon: <BellRing size={18} className="text-[color:var(--tone-info-text)]" />,
    button: uiRecipes.secondaryButton,
    buttonTone: 'info',
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-[color:var(--tone-warning-text)]" />,
    button: uiRecipes.primaryButton,
    buttonTone: 'warning',
  },
  danger: {
    icon: <AlertTriangle size={18} className="text-[color:var(--tone-danger-text)]" />,
    button: uiRecipes.primaryButton,
    buttonTone: 'danger',
  },
};

export const AppDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const resolverRef = useRef<((value: unknown) => void) | null>(null);

  const closeDialog = (value?: unknown) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
    setPromptValue('');
  };

  const contextValue = useMemo<AppDialogContextValue>(
    () => ({
      showAlert: (options) =>
        new Promise<void>((resolve) => {
          resolverRef.current = () => resolve();
          setDialog({ kind: 'alert', tone: 'default', confirmLabel: 'Compris', ...options });
        }),
      showConfirm: (options) =>
        new Promise<boolean>((resolve) => {
          resolverRef.current = (value) => resolve(Boolean(value));
          setDialog({ kind: 'confirm', tone: 'warning', confirmLabel: 'Confirmer', cancelLabel: 'Annuler', ...options });
        }),
      showPrompt: (options) =>
        new Promise<string | null>((resolve) => {
          resolverRef.current = (value) => resolve(typeof value === 'string' ? value : null);
          setPromptValue(options.initialValue || '');
          setDialog({ kind: 'prompt', tone: 'default', confirmLabel: 'Valider', cancelLabel: 'Annuler', ...options });
        }),
    }),
    [],
  );

  const tone = TONE_META[dialog?.tone || 'default'];

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}

      <ModalShell
        isOpen={Boolean(dialog)}
        onClose={() => closeDialog(dialog?.kind === 'confirm' ? false : dialog?.kind === 'prompt' ? null : undefined)}
        title={dialog?.title || ''}
        subtitle={dialog?.kind === 'prompt' ? 'Saisie requise' : 'Confirmation'}
        icon={tone.icon}
        maxWidthClassName="max-w-lg"
        centered
        footer={
          dialog ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {dialog.kind !== 'alert' ? (
                <button
                  type="button"
                  onClick={() => closeDialog(dialog.kind === 'confirm' ? false : null)}
                  className={uiRecipes.ghostButton}
                >
                  {dialog.cancelLabel || 'Annuler'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => closeDialog(dialog.kind === 'prompt' ? promptValue.trim() || null : true)}
                className={cx(
                  tone.button,
                  tone.buttonTone === 'danger' ? 'border-[color:var(--tone-danger-border)] bg-[color:var(--danger)] text-white hover:brightness-105' : '',
                  tone.buttonTone === 'info' ? 'border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] hover:border-[color:var(--tone-info-border)] hover:bg-[color:var(--tone-info-surface)]' : '',
                )}
              >
                {dialog.confirmLabel || 'Valider'}
              </button>
            </div>
          ) : null
        }
      >
        {dialog ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">{dialog.message}</p>

            {dialog.kind === 'prompt' ? (
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Nouveau texte
                </label>
                <div className="relative">
                  <PencilLine size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                  <input
                    autoFocus
                    value={promptValue}
                    onChange={(event) => setPromptValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        closeDialog(promptValue.trim() || null);
                      }
                    }}
                    placeholder={dialog.placeholder || 'Saisir une valeur'}
                    className={cx(uiRecipes.field, 'py-4 pl-11 pr-4')}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </ModalShell>
    </AppDialogContext.Provider>
  );
};

export const useAppDialog = () => {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
};
