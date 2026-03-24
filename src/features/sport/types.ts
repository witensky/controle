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
    tags?: string[];
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export interface WorkoutLog {
    id: string;
    user_id: string;
    routine_id: string;
    routine_name: string;
    total_volume: number;
    duration: number;
    date: string;
    exercises_data?: Record<string, { weight: number; reps: number }[]>;
    notes?: string;
    xp_earned?: number;
}

export interface BodyMetric {
    id: string;
    user_id: string;
    weight: number;
    body_fat?: number;
    muscle_mass?: number;
    note?: string;
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
    category: string;
}

export interface CreateRoutineDTO {
    name: string;
    exercises: Exercise[];
    tags?: string[];
    notes?: string;
}

export interface CreateLogDTO {
    routine_id: string;
    routine_name: string;
    total_volume: number;
    duration: number;
    date: string;
    exercises_data?: Record<string, { weight: number; reps: number }[]>;
    notes?: string;
}

export interface CreateMetricDTO {
    weight: number;
    body_fat?: number;
    muscle_mass?: number;
    note?: string;
    date: string;
}
