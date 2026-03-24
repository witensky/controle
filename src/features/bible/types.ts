export interface JournalEntry {
    id: string;
    user_id: string;
    content: string;
    tags: string[];
    mood: number | null;
    created_at: string;
}

export interface ReadingItem {
    id: string;
    title: string;
    chapter: string;
    verse: string;
}

export interface CreateEntryDTO {
    content: string;
    tags: string[];
    mood: number | null;
}

export interface Bookmark {
    id: string;
    user_id: string;
    verse: string;
    note?: string;
    created_at: string;
}

export interface ReadingPlan {
    id: string;
    title: string;
    progress: number;
    total_days: number;
    current_day: number;
}

export interface CreateBookmarkDTO {
    verse: string;
    note?: string;
}

export interface CreatePlanDTO {
    title: string;
    total_days: number;
}
