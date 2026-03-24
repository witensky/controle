import { Capacitor } from '@capacitor/core';

export type BrowserNotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export const isBrowserNotificationSupported = () => {
  if (typeof window === 'undefined') return false;
  // Capacitor WebView support is inconsistent; we treat "web" as the reliable target.
  if (Capacitor.getPlatform() !== 'web') return false;
  return 'Notification' in window;
};

export const requestBrowserNotificationPermission = async (): Promise<BrowserNotificationPermission> => {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  const permission = window.Notification.permission;
  if (permission === 'granted' || permission === 'denied') return permission;

  try {
    const next = await window.Notification.requestPermission();
    if (next === 'granted' || next === 'denied' || next === 'default') return next;
    return 'default';
  } catch {
    return 'default';
  }
};

export const sendBrowserNotification = (payload: { title: string; body?: string; tag?: string }) => {
  if (!isBrowserNotificationSupported()) return false;
  if (window.Notification.permission !== 'granted') return false;

  try {
    // Avoid spamming while the user is already in the app.
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return false;

    new window.Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      silent: true,
      renotify: false,
    });
    return true;
  } catch {
    return false;
  }
};

