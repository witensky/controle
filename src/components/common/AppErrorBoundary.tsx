import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { uiRecipes } from '../../theme/recipes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would go to a monitoring service (Sentry, etc.)
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className={`${uiRecipes.cardElevated} flex max-w-md flex-col items-center gap-5 p-8 text-center`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)]">
              <AlertTriangle size={24} className="text-[color:var(--tone-danger-text)]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black uppercase italic tracking-tight text-[color:var(--heading)]">
                Erreur inattendue
              </h2>
              <p className="text-xs text-[color:var(--text-muted)]">
                Un problème est survenu dans cette section. Tes données sont protégées.
              </p>
              {this.state.error?.message ? (
                <p className="mt-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 font-mono text-[10px] text-[color:var(--text-secondary)]">
                  {this.state.error.message}
                </p>
              ) : null}
            </div>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-[1.15rem] bg-[color:var(--primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--primary-foreground)] transition-all hover:bg-[color:var(--primary-hover)] active:scale-[0.97]"
            >
              <RefreshCw size={15} />
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
