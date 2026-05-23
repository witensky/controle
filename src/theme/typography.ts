/**
 * Unified typography scale.
 *
 * BEFORE: text-[10px] font-black uppercase tracking-[0.28em] was copy-pasted 40+ times
 * AFTER:  import { text } from '@/theme/typography' and use text.eyebrow
 *
 * Usage:
 *   <p className={text.eyebrow}>Label</p>
 *   <h2 className={text.heading}>Title</h2>
 */

export const text = {
  /** Section labels, metric eyebrows, badges — ALL CAPS, small, spaced */
  eyebrow: 'text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]',

  /** Slightly larger eyebrow for modal/card headers */
  eyebrowLg: 'text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]',

  /** Standard form labels, nav items */
  label: 'text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)]',

  /** Body copy — readable, not screaming */
  body: 'text-sm font-medium text-[color:var(--text)]',
  bodySm: 'text-xs font-medium text-[color:var(--text-secondary)]',

  /** Big italic heading — hero numbers, view titles */
  heading: 'text-2xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',
  headingLg: 'text-3xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',
  headingSm: 'text-xl font-black uppercase italic tracking-tight text-[color:var(--heading)]',

  /** KPI / metric values */
  metricXl: 'text-[1.9rem] font-black italic leading-none tracking-[-0.04em] text-[color:var(--heading)]',
  metricLg: 'text-[1.5rem] font-black italic leading-none tracking-[-0.04em] text-[color:var(--heading)]',
  metricMd: 'text-xl font-black italic leading-none tracking-tight text-[color:var(--heading)]',

  /** Helper text, hints, timestamps */
  muted: 'text-xs text-[color:var(--text-muted)]',
  mutedSm: 'text-[10px] text-[color:var(--text-muted)]',
} as const;

export type TextVariant = keyof typeof text;
