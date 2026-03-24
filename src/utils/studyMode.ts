import type { StudySession } from '@/features/studies/types';

export const STUDY_LEVELS = [
  { level: 1, minMinutes: 0, nextMinutes: 10, label: 'Echauffement' },
  { level: 2, minMinutes: 10, nextMinutes: 30, label: 'Lancement' },
  { level: 3, minMinutes: 30, nextMinutes: 60, label: 'Profondeur' },
  { level: 4, minMinutes: 60, nextMinutes: 90, label: 'Maitrise' },
  { level: 5, minMinutes: 90, nextMinutes: null, label: 'Elite' },
] as const;

export const formatStudyTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getStudyLevelMeta = (elapsedSeconds: number) => {
  const minutes = elapsedSeconds / 60;
  const current = [...STUDY_LEVELS].reverse().find((item) => minutes >= item.minMinutes) || STUDY_LEVELS[0];

  if (current.nextMinutes === null) {
    return {
      ...current,
      progressPercent: 100,
      nextLabel: 'Niveau max',
    };
  }

  const range = current.nextMinutes - current.minMinutes;
  const progress = ((minutes - current.minMinutes) / Math.max(range, 1)) * 100;

  return {
    ...current,
    progressPercent: Math.max(0, Math.min(100, progress)),
    nextLabel: `${current.nextMinutes} min`,
  };
};

export const sumStudySeconds = (sessions: StudySession[]) =>
  sessions.reduce((total, session) => total + Math.max(0, session.durationSeconds || 0), 0);
