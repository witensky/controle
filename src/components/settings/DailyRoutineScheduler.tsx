import React, { useEffect, useMemo, useRef } from 'react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { emitAppReminder } from '@/lib/appReminders';
import { sendBrowserNotification } from '@/lib/browserNotifications';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

type DailyReminderKind = 'morning-ritual' | 'dashboard-journal';
type ReminderLog = Record<string, string>;

const DEFAULT_JOURNAL_TIME = '20:30';

const normalizeTime = (value?: string | null, fallback = '06:00') => {
  const raw = String(value || '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) return fallback;

  const [hours, minutes] = raw.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return fallback;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const buildReminderKey = (kind: DailyReminderKind, scheduledAt: Date) =>
  `${kind}:${scheduledAt.toISOString().slice(0, 16)}`;

const computeNextOccurrence = (timeValue: string, fromDate = new Date()) => {
  const [hours, minutes] = normalizeTime(timeValue).split(':').map(Number);
  const next = new Date(fromDate);
  next.setHours(hours, minutes, 0, 0);

  if (next.getTime() <= fromDate.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const DailyRoutineScheduler: React.FC = () => {
  const { data: profile } = useProfile();
  const timeoutMap = useRef<Partial<Record<DailyReminderKind, number>>>({});

  const reminderSettings = useMemo(() => {
    const settings = profile?.settings_config || {};
    return {
      ritualReminders: settings.ritualReminders !== false,
      terminalLogging: settings.terminalLogging !== false,
      morningRitualTime: normalizeTime(settings.morningRitualTime, '06:00'),
      journalReminderTime: normalizeTime(settings.eveningRitualTime, DEFAULT_JOURNAL_TIME),
    };
  }, [profile]);

  useEffect(() => {
    const clearAll = () => {
      Object.values(timeoutMap.current).forEach((timeoutId) => {
        if (timeoutId) window.clearTimeout(timeoutId);
      });
      timeoutMap.current = {};
    };

    const readLog = () => localStore.get<ReminderLog>(LOCAL_KEYS.DAILY_ROUTINE_REMINDER_LOG) || {};
    const writeLog = (log: ReminderLog) => localStore.set(LOCAL_KEYS.DAILY_ROUTINE_REMINDER_LOG, log);

    const scheduleReminder = (
      kind: DailyReminderKind,
      enabled: boolean,
      timeValue: string,
      payload: { title: string; body: string },
    ) => {
      const previousTimeout = timeoutMap.current[kind];
      if (previousTimeout) {
        window.clearTimeout(previousTimeout);
        delete timeoutMap.current[kind];
      }

      if (!enabled) return;

      const nextOccurrence = computeNextOccurrence(timeValue);
      const delay = Math.max(1_000, nextOccurrence.getTime() - Date.now());

      timeoutMap.current[kind] = window.setTimeout(() => {
        const log = readLog();
        const reminderKey = buildReminderKey(kind, nextOccurrence);

        if (!log[reminderKey]) {
          emitAppReminder({
            id: reminderKey,
            title: payload.title,
            body: payload.body,
            tone: kind === 'morning-ritual' ? 'success' : 'info',
          });
          sendBrowserNotification({ title: payload.title, body: payload.body, tag: reminderKey });
          log[reminderKey] = new Date().toISOString();
          writeLog(log);
        }

        scheduleReminder(kind, enabled, timeValue, payload);
      }, delay);
    };

    scheduleReminder('morning-ritual', reminderSettings.ritualReminders, reminderSettings.morningRitualTime, {
      title: 'Rituel du matin',
      body: `Il est ${reminderSettings.morningRitualTime}. Lance ton rituel et prepare ta journee.`,
    });

    scheduleReminder('dashboard-journal', reminderSettings.terminalLogging, reminderSettings.journalReminderTime, {
      title: 'Journal de bord',
      body: 'Pense a revoir ton tableau de bord et faire le bilan de la journee.',
    });

    return clearAll;
  }, [reminderSettings]);

  return null;
};

export default DailyRoutineScheduler;
