export const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const uiRecipes = {
  panel: 'ui-panel rounded-[2rem] sm:rounded-[2.25rem]',
  card: 'ui-card rounded-[1.5rem] sm:rounded-[1.75rem]',
  cardMuted: 'ui-card-muted rounded-[1.35rem] sm:rounded-[1.5rem]',
  cardElevated: 'ui-card-elevated rounded-[1.75rem] sm:rounded-[2rem]',
  cardHeader: 'flex items-start justify-between gap-3',
  iconBadge: 'ui-icon-badge flex items-center justify-center rounded-2xl',
  emptyState: 'ui-empty-state rounded-[1.5rem] px-5 py-8 text-center',
  sectionCard: 'ui-section-card rounded-[1.75rem] sm:rounded-[2rem]',
  emptyPanel: 'ui-empty-panel rounded-[1.5rem] px-5 py-8 text-center',
  searchBar: 'ui-searchbar ui-focus w-full min-h-14 rounded-[1.35rem] px-4 py-4 text-sm font-bold',
  primaryCta:
    'ui-primary-cta ui-focus inline-flex min-h-14 items-center justify-center rounded-[1.35rem] px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-50',
  actionIcon:
    'ui-action-icon ui-focus inline-flex h-11 w-11 items-center justify-center rounded-[1rem] p-0 disabled:cursor-not-allowed disabled:opacity-50',
  compactItemCard: 'ui-module-card rounded-[1.9rem]',
  compactItemPanel: 'ui-module-card-panel rounded-[1.35rem]',
  compactMetricStrip: 'ui-module-card-strip rounded-[1.2rem]',
  compactActionIcon:
    'ui-action-icon ui-focus inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] p-0 disabled:cursor-not-allowed disabled:opacity-50',
  statusBadge: 'ui-item-badge inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em]',
  primaryButton:
    'ui-primary-button ui-focus inline-flex min-h-11 items-center justify-center rounded-[1.15rem] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-50',
  secondaryButton:
    'ui-secondary-button ui-focus inline-flex min-h-11 items-center justify-center rounded-[1.15rem] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-50',
  ghostButton:
    'ui-ghost-button ui-focus inline-flex min-h-11 items-center justify-center rounded-[1.15rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-50',
  metricCard: 'ui-card rounded-[1.35rem] px-4 py-4 sm:px-5 sm:py-5',
  modalPanel: 'ui-modal-panel rounded-[2rem] sm:rounded-[2.25rem]',
  formSection: 'ui-form-section rounded-[1.5rem] p-4 sm:p-5',
  fieldLabel: 'ui-form-label ml-1 text-[10px] font-black uppercase tracking-[0.22em]',
  modalBadge: 'ui-modal-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.26em]',
  chip: 'ui-chip inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]',
  field:
    'ui-field ui-focus w-full min-h-12 rounded-[1.15rem] px-4 py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
} as const;
