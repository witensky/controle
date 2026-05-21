export const text = {
  eyebrow: 'text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]',
  eyebrowLg: 'text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]',
  label: 'text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)]',
  body: 'text-sm font-medium text-[color:var(--text)]',
  bodySm: 'text-xs font-medium text-[color:var(--text-secondary)]',
  heading: 'text-2xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',
  headingLg: 'text-3xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',
  headingSm: 'text-xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',
  metricXl: 'text-[1.9rem] font-black italic leading-none tracking-[-0.04em] text-[color:var(--heading)]',
  metricLg: 'text-[1.5rem] font-black italic leading-none tracking-[-0.04em] text-[color:var(--heading)]',
  metricMd: 'text-xl font-black italic leading-none tracking-tight text-[color:var(--heading)]',
  muted: 'text-xs text-[color:var(--text-muted)]',
  mutedSm: 'text-[10px] text-[color:var(--text-muted)]',
} as const;

export type TextVariant = keyof typeof text;
