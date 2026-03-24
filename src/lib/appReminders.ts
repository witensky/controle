export type AppReminderTone = 'info' | 'success' | 'warning';

export interface AppReminderPayload {
  id?: string;
  title: string;
  body: string;
  tone?: AppReminderTone;
}

export const APP_REMINDER_EVENT = 'app:reminder';

export const emitAppReminder = (payload: AppReminderPayload) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AppReminderPayload>(APP_REMINDER_EVENT, {
      detail: payload,
    }),
  );
};
