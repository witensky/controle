export type AppView = 'DASHBOARD' | 'FINANCE' | 'DISCIPLINE' | 'STUDIES' | 'LANGUAGES' | 'BIBLE' | 'SPORT' | 'SETTINGS' | 'DATA_CENTER' | 'REPORTS' | 'PROFILE' | 'ABOUT_APP';

// Mission Types migrated to src/features/discipline/types.ts

export type LawSubjectStatus = 'En cours' | 'Termine' | 'En attente' | 'Echec' | 'Rattrapage';

export interface StudyScheduleSlot {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface StudyReminder {
  id: string;
  type: 'preset' | 'custom';
  label: string;
  offsetMinutes: number;
  customDateTime?: string | null;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  levelReached: number;
}

export interface LawSubject {
  id: string;
  user_id: string;
  name: string;
  semester: string;
  professor: string | null;
  status: LawSubjectStatus;
  chaptersTotal: number;
  chaptersDone: number;
  examDate: string | null;
  ects: number;
  notes: string | null;
  courseDateTime: string | null;
  courseSchedule: StudyScheduleSlot[];
  reminders: StudyReminder[];
  studySessions: StudySession[];
  progress: number;
  stressLevel: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface UserStats {
  finance: number;
  studies: number;
  discipline: number;
  mental: number;
  spiritual: number;
  languages: number;
  xp: number;
  rank: string;
}

// --- SPORT TYPES ---
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  weight_goal?: number;
}

export interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  routine_id: string;
  routine_name: string;
  total_volume: number;
  duration: number;
  date: string;
  notes?: string;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  weight: number;
  body_fat?: number;
  muscle_mass?: number;
  date: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  category: 'strength' | 'weight' | 'endurance';
}
