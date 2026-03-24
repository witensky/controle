import React, { useEffect, useMemo, useRef } from 'react';
import { useSubjects } from '../../features/studies/hooks/useStudies';
import { emitAppReminder } from '../../lib/appReminders';
import { sendBrowserNotification } from '../../lib/browserNotifications';
import { localStore } from '../../lib/localStorage';
import type { StudyReminder, StudyScheduleSlot } from '../../features/studies/types';
import { getNextScheduleOccurrence, getReminderTriggerDate, getWeekdayMeta } from '../../utils/studyReminders';

const REMINDER_LOG_KEY = 'study_reminder_log';

const scheduleFromLegacyDateTime = (courseDateTime?: string | null): StudyScheduleSlot[] => {
  if (!courseDateTime) return [];
  const date = new Date(courseDateTime);
  if (Number.isNaN(date.getTime())) return [];

  const startHours = String(date.getHours()).padStart(2, '0');
  const startMinutes = String(date.getMinutes()).padStart(2, '0');
  const endDate = new Date(date.getTime() + 60 * 60 * 1000);

  return [{
    id: `legacy-${courseDateTime}`,
    weekday: date.getDay(),
    startTime: `${startHours}:${startMinutes}`,
    endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
  }];
};

const StudyReminderScheduler: React.FC = () => {
  const { data: subjectsRaw } = useSubjects();
  const subjects = subjectsRaw || [];
  const timeoutMap = useRef<Record<string, number>>({});

  const normalizedSubjects = useMemo(
    () => subjects.map((subject) => ({
      ...subject,
      reminders: subject.reminders ?? [],
      courseSchedule: subject.courseSchedule?.length ? subject.courseSchedule : scheduleFromLegacyDateTime(subject.courseDateTime),
    })),
    [subjects],
  );

  useEffect(() => {
    const clearAll = () => {
      Object.values(timeoutMap.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutMap.current = {};
    };

    const scheduleOne = (subjectId: string, subjectName: string, slot: StudyScheduleSlot, reminder: StudyReminder) => {
      const nextOccurrence = getNextScheduleOccurrence(slot, new Date());
      const triggerDate = getReminderTriggerDate(slot, reminder, new Date());
      const reminderKey = `${subjectId}:${slot.id}:${reminder.id}`;
      const timeoutId = timeoutMap.current[reminderKey];

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      const delay = triggerDate.getTime() - Date.now();
      if (delay <= 0) {
        timeoutMap.current[reminderKey] = window.setTimeout(() => scheduleOne(subjectId, subjectName, slot, reminder), 30_000);
        return;
      }

      timeoutMap.current[reminderKey] = window.setTimeout(() => {
        const occurrenceIso = nextOccurrence.toISOString();
        const logKey = `${subjectId}:${slot.id}:${reminder.id}:${occurrenceIso}`;
        const currentLog = localStore.get<Record<string, string>>(REMINDER_LOG_KEY) || {};

        if (!currentLog[logKey]) {
          const weekday = getWeekdayMeta(slot.weekday).label;
          const body = `${reminder.label} • ${weekday} ${slot.startTime}-${slot.endTime}`;
          emitAppReminder({
            id: logKey,
            title: `Cours: ${subjectName}`,
            body,
            tone: 'info',
          });
          sendBrowserNotification({ title: `Cours: ${subjectName}`, body, tag: logKey });
          currentLog[logKey] = new Date().toISOString();
          localStore.set(REMINDER_LOG_KEY, currentLog);
        }

        scheduleOne(subjectId, subjectName, slot, reminder);
      }, delay);
    };

    clearAll();

    normalizedSubjects.forEach((subject) => {
      subject.courseSchedule.forEach((slot) => {
        subject.reminders.forEach((reminder) => {
          if (!reminder.offsetMinutes || reminder.offsetMinutes < 1) return;
          scheduleOne(subject.id, subject.name, slot, reminder);
        });
      });
    });

    return clearAll;
  }, [normalizedSubjects]);

  return null;
};

export default StudyReminderScheduler;
