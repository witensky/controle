
export type AppView = 'AUTH' | 'DASHBOARD' | 'FINANCE' | 'DISCIPLINE' | 'STUDIES' | 'LANGUAGES' | 'BIBLE' | 'SPORT' | 'SETTINGS' | 'REPORTS';

export interface UserStats {
  finance: number;
  studies: number;
  discipline: number;
  mental: number;
  spiritual: number;
  languages: number;
}

export interface SettingsConfig {
  userName: string;
  nextExamDate: string;
  amciRenewalDate: string;
  sportGoalPerWeek: number;
  notifications: {
    bible: boolean;
    studies: boolean;
    finance: boolean;
    sport: boolean;
    discipline: boolean;
  };
  reminders: string; // "06:00"
}

export interface WorkoutSession {
  id: string;
  type: string;
  duration: number;
  intensity: number;
  date: string;
}

export interface DailyActivity {
  id: string;
  text: string;
  timestamp: string;
}

export type LawSubjectStatus = 'A débutER' | 'En cours' | 'Maîtrisé' | 'Révision';

export interface LawSubject {
  id: string;
  name: string;
  semester: string;
  professor?: string;
  examDate?: string;
  ects?: number;
  status: LawSubjectStatus;
  progress: number;
  stressLevel: 'low' | 'medium' | 'high';
  chaptersTotal: number;
  chaptersDone: number;
  notes?: string;
}
