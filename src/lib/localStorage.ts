/**
 * localStore — lightweight localStorage utility with JSON serialization.
 * Used to cache Supabase data locally for offline fallback.
 */

const PREFIX = 'jb_';

export const localStore = {
    get<T>(key: string): T | null {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    },

    set<T>(key: string, data: T): void {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(data));
        } catch (e) {
            // localStorage might be full or disabled — fail silently
            console.warn('[localStore] Could not save to localStorage:', e);
        }
    },

    remove(key: string): void {
        try {
            localStorage.removeItem(PREFIX + key);
        } catch { }
    },
};

// Named keys to avoid typos
export const LOCAL_KEYS = {
    TRANSACTIONS: 'transactions',
    BUDGETS: 'budgets',
    SAVINGS: 'savings',
    FINANCE_DISMISSED_ALERTS: 'finance_dismissed_alerts',
    FINANCE_IMPACT_TIP_DISMISSED_AT: 'finance_impact_tip_dismissed_at',
    DASHBOARD_DISMISSED_TIP: 'dashboard_dismissed_tip',
    DAILY_ROUTINE_REMINDER_LOG: 'daily_routine_reminder_log',
    MISSIONS: 'missions',
    SUBJECTS: 'subjects',
    PROFILE: 'profile',
    LEARNED_WORDS: 'learned_words',
    SPORT: 'sport_data',
    BIBLE_ENTRIES: 'bible_entries',
    BIBLE_PROGRESS: 'bible_progress',
} as const;
