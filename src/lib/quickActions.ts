import { AppView } from '../types';

export type QuickActionType = 'add-transaction' | 'add-mission' | 'start-sport-session';

export const QUICK_ACTION_EVENT = 'jb:quick-action';

export const quickActionTargetView: Record<QuickActionType, AppView> = {
  'add-transaction': 'FINANCE',
  'add-mission': 'DISCIPLINE',
  'start-sport-session': 'SPORT'
};

export const dispatchQuickAction = (action: QuickActionType) => {
  window.dispatchEvent(new CustomEvent(QUICK_ACTION_EVENT, { detail: { action } }));
};
