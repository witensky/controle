import type { StudyReminder, StudyScheduleSlot } from '@/features/studies/types';

export const STUDY_REMINDER_PRESETS = [
  { id: '30m', label: '30 min avant', offsetMinutes: 30 },
  { id: '1h', label: '1 heure avant', offsetMinutes: 60 },
  { id: '1d', label: '1 jour avant', offsetMinutes: 1440 },
] as const;

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
  { value: 0, label: 'Dimanche', short: 'Dim' },
] as const;

export const buildPresetReminder = (presetId: string) => {
  const preset = STUDY_REMINDER_PRESETS.find((item) => item.id === presetId);
  if (!preset) return null;

  return {
    id: `preset-${preset.id}`,
    type: 'preset' as const,
    label: preset.label,
    offsetMinutes: preset.offsetMinutes,
  };
};

export const dedupeReminders = (reminders: StudyReminder[]) => {
  const map = new Map<number, StudyReminder>();
  reminders.forEach((reminder) => {
    const offset = Number(reminder.offsetMinutes || 0);
    if (!map.has(offset)) {
      map.set(offset, { ...reminder, offsetMinutes: offset });
    }
  });
  return Array.from(map.values()).sort((left, right) => left.offsetMinutes - right.offsetMinutes);
};

export const createDefaultScheduleSlot = (): StudyScheduleSlot => ({
  id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  weekday: 1,
  startTime: '08:00',
  endTime: '10:00',
});

export const getWeekdayMeta = (weekday: number) =>
  WEEKDAY_OPTIONS.find((item) => item.value === weekday) || WEEKDAY_OPTIONS[0];

export const formatWeeklySchedule = (slots: StudyScheduleSlot[]) => {
  if (!slots.length) return 'Aucun horaire defini';

  return [...slots]
    .sort((left, right) => left.weekday - right.weekday || left.startTime.localeCompare(right.startTime))
    .map((slot) => `${getWeekdayMeta(slot.weekday).short} ${slot.startTime}-${slot.endTime}`)
    .join(' • ');
};

const buildOccurrenceDate = (slot: StudyScheduleSlot, fromDate: Date) => {
  const next = new Date(fromDate);
  next.setSeconds(0, 0);
  const dayDiff = (slot.weekday - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + dayDiff);

  const [hours, minutes] = slot.startTime.split(':').map(Number);
  next.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);

  if (next.getTime() <= fromDate.getTime()) {
    next.setDate(next.getDate() + 7);
  }

  return next;
};

export const getNextScheduleOccurrence = (slot: StudyScheduleSlot, fromDate = new Date()) =>
  buildOccurrenceDate(slot, fromDate);

export const getReminderTriggerDate = (slot: StudyScheduleSlot, reminder: StudyReminder, fromDate = new Date()) => {
  const occurrence = getNextScheduleOccurrence(slot, fromDate);
  return new Date(occurrence.getTime() - reminder.offsetMinutes * 60_000);
};
