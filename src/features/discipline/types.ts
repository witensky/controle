export type MissionStatus = 'Backlog' | 'Planifiée' | 'En cours' | 'Terminé' | 'Reporté' | 'Abandonné';
export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';
export type MissionCategory = 'Admin' | 'Droit' | 'Sport' | 'Personnel' | 'Spirituel' | 'Langues';
export type MissionRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

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
    recurrence?: MissionRecurrence;
    recurrence_end_date?: string;
    parent_mission_id?: string;
}

export interface MissionFilters {
    category: MissionCategory | 'All';
    status?: MissionStatus;
}

export interface CreateMissionDTO {
    title: string;
    category: MissionCategory;
    priority: MissionPriority;
    description?: string;
    deadline?: string;
    energy_required: 1 | 2 | 3;
    status: MissionStatus;
    impact_score: number;
    planned_date: string;
    estimated_duration?: number;
    actual_duration?: number;
    recurrence?: MissionRecurrence;
    recurrence_end_date?: string;
    parent_mission_id?: string;
}

export interface UpdateMissionDTO extends Partial<CreateMissionDTO> {
    feedback_difficulty?: 'facile' | 'normal' | 'difficile';
    feedback_energy_after?: number;
    completed_at?: string;
}
