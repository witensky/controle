import { AppView } from '../types';

export type QuickActionType = 'add-transaction' | 'add-mission' | 'start-sport-session';

export const QUICK_ACTION_EVENT = 'jb:quick-action';
const QUICK_ACTION_QUEUE_KEY = 'jb:queued-quick-action';

export const quickActionTargetView: Record<QuickActionType, AppView> = {
  'add-transaction': 'FINANCE',
  'add-mission': 'DISCIPLINE',
  'start-sport-session': 'SPORT'
};

export const queueQuickAction = (action: QuickActionType) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(QUICK_ACTION_QUEUE_KEY, action);
  } catch (error) {
    console.error('Unable to queue quick action', error);
  }
};

export const consumeQueuedQuickAction = (expectedAction?: QuickActionType) => {
  if (typeof window === 'undefined') return null;

  try {
    const queuedAction = window.sessionStorage.getItem(QUICK_ACTION_QUEUE_KEY) as QuickActionType | null;

    if (!queuedAction) return null;
    if (expectedAction && queuedAction !== expectedAction) return null;

    window.sessionStorage.removeItem(QUICK_ACTION_QUEUE_KEY);
    return queuedAction;
  } catch (error) {
    console.error('Unable to consume queued quick action', error);
    return null;
  }
};

export const dispatchQuickAction = (action: QuickActionType) => {
  window.dispatchEvent(new CustomEvent(QUICK_ACTION_EVENT, { detail: { action } }));
};
