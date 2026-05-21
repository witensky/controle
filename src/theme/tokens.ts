export type ToneKey = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const chartPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;

export const chartToneByIntent = {
  primary: 'var(--chart-1)',
  info: 'var(--chart-2)',
  warning: 'var(--chart-3)',
  danger: 'var(--chart-4)',
  accent: 'var(--chart-5)',
  success: 'var(--chart-6)',
} as const;

export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-[0.875rem]',
  lg: 'rounded-[1.25rem]',
  xl: 'rounded-[1.75rem]',
  full: 'rounded-full',
} as const;

export type RadiusKey = keyof typeof radius;

export const toneClassNames: Record<
  ToneKey,
  {
    chip: string;
    shell: string;
    text: string;
    icon: string;
    progress: string;
  }
> = {
  primary: {
    chip: 'ui-chip-primary',
    shell: 'border-[color:var(--tone-primary-border)] bg-[color:var(--tone-primary-surface)]',
    text: 'text-[color:var(--tone-primary-text)]',
    icon: 'text-[color:var(--tone-primary-text)]',
    progress: 'bg-[color:var(--primary)]',
  },
  success: {
    chip: 'ui-chip-success',
    shell: 'border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)]',
    text: 'text-[color:var(--tone-success-text)]',
    icon: 'text-[color:var(--tone-success-text)]',
    progress: 'bg-[color:var(--success)]',
  },
  warning: {
    chip: 'ui-chip-warning',
    shell: 'border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)]',
    text: 'text-[color:var(--tone-warning-text)]',
    icon: 'text-[color:var(--tone-warning-text)]',
    progress: 'bg-[color:var(--warning)]',
  },
  danger: {
    chip: 'ui-chip-danger',
    shell: 'border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)]',
    text: 'text-[color:var(--tone-danger-text)]',
    icon: 'text-[color:var(--tone-danger-text)]',
    progress: 'bg-[color:var(--danger)]',
  },
  info: {
    chip: 'ui-chip-info',
    shell: 'border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)]',
    text: 'text-[color:var(--tone-info-text)]',
    icon: 'text-[color:var(--tone-info-text)]',
    progress: 'bg-[color:var(--info)]',
  },
};

export const dashboardToneTokens = {
  rose: {
    card: 'dashboard-card-shell dashboard-card-rose',
    iconShell: 'bg-[color:var(--tone-danger-surface)] border-[color:var(--tone-danger-border)] dark:bg-rose-500/12 dark:border-rose-400/20',
    icon: 'text-[color:var(--tone-danger-text)]',
    accent: 'bg-[color:var(--danger)]',
    spark: 'var(--chart-4)',
  },
  amber: {
    card: 'dashboard-card-shell dashboard-card-amber',
    iconShell: 'bg-[color:var(--tone-warning-surface)] border-[color:var(--tone-warning-border)] dark:bg-amber-500/12 dark:border-amber-400/20',
    icon: 'text-[color:var(--tone-warning-text)]',
    accent: 'bg-[color:var(--warning)]',
    spark: 'var(--chart-3)',
  },
  emerald: {
    card: 'dashboard-card-shell dashboard-card-emerald',
    iconShell: 'bg-[color:var(--tone-success-surface)] border-[color:var(--tone-success-border)] dark:bg-emerald-500/12 dark:border-emerald-400/20',
    icon: 'text-[color:var(--tone-success-text)]',
    accent: 'bg-[color:var(--success)]',
    spark: 'var(--chart-1)',
  },
  blue: {
    card: 'dashboard-card-shell dashboard-card-blue',
    iconShell: 'bg-[color:var(--tone-info-surface)] border-[color:var(--tone-info-border)] dark:bg-blue-500/12 dark:border-blue-400/20',
    icon: 'text-[color:var(--tone-info-text)]',
    accent: 'bg-[color:var(--info)]',
    spark: 'var(--chart-2)',
  },
} as const;
