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

export interface CreateSubjectDTO {
    name: string;
    semester: string;
    professor?: string;
    status: LawSubjectStatus;
    chaptersTotal: number;
    chaptersDone: number;
    examDate?: string;
    ects: number;
    notes?: string;
    courseDateTime?: string;
    courseSchedule?: StudyScheduleSlot[];
    reminders?: StudyReminder[];
    studySessions?: StudySession[];
}

export interface UpdateSubjectDTO extends Partial<CreateSubjectDTO> { }
