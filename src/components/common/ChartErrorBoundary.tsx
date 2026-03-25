import React from 'react';

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  minHeightClassName?: string;
  resetKey?: string | number | boolean | null;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ChartErrorBoundary caught a chart render error:', error);
  }

  componentDidUpdate(prevProps: ChartErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Graphique indisponible',
        fallbackMessage = "L'affichage du graphique a été désactivé pour éviter un crash de l'application.",
        minHeightClassName = 'min-h-[120px]',
      } = this.props;

      return (
        <div className={`flex w-full items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] px-5 py-6 text-center shadow-card ${minHeightClassName}`}>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">{fallbackTitle}</p>
            <p className="max-w-sm text-sm leading-6 text-[color:var(--text-secondary)]">{fallbackMessage}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
