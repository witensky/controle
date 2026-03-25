
export type AppView = 'AUTH' | 'DASHBOARD' | 'FINANCE' | 'DISCIPLINE' | 'STUDIES' | 'LANGUAGES' | 'BIBLE' | 'SPORT' | 'SETTINGS' | 'REPORTS';

export type MissionStatus = 'Backlog' | 'Planifiée' | 'En cours' | 'Terminé' | 'Reporté' | 'Abandonné';
export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';
export type MissionCategory = 'Admin' | 'Droit' | 'Sport' | 'Personnel' | 'Spirituel' | 'Langues';

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: MissionCategory;
  priority: MissionPriority;
  status: MissionStatus;
  deadline?: string;
  planned_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  energy_required: 1 | 2 | 3;
  feedback_difficulty?: 'facile' | 'normal' | 'difficile';
  feedback_energy_after?: number;
  impact_score: number;
  created_at: string;
  completed_at?: string;
}

export type LawSubjectStatus = 'En cours' | 'Terminé' | 'En attente' | 'Échec' | 'Rattrapage';

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
