import { offlineRepository } from '@/data/offlineRepository';
import { WorkoutRoutine, WorkoutLog, BodyMetric, FitnessGoal, CreateRoutineDTO, CreateLogDTO, CreateMetricDTO } from '../types';

export class SportService {
    static async getSportData() {
        return offlineRepository.sport.getSportData() as Promise<{
            routines: WorkoutRoutine[];
            logs: WorkoutLog[];
            metrics: BodyMetric[];
            goals: FitnessGoal[];
        }>;
    }

    static async saveRoutine(routine: CreateRoutineDTO, id?: string) {
        return offlineRepository.sport.saveRoutine(routine, id);
    }

    static async deleteRoutine(id: string) {
        return offlineRepository.sport.deleteRoutine(id);
    }

    static async saveLog(log: CreateLogDTO) {
        return offlineRepository.sport.saveLog(log);
    }

    static async addMetric(metric: CreateMetricDTO) {
        return offlineRepository.sport.addMetric(metric);
    }

    static async upsertGoal(goal: Omit<FitnessGoal, 'id' | 'user_id' | 'created_at'> & { id?: string }) {
        return offlineRepository.sport.upsertGoal(goal);
    }

    static async deleteGoal(id: string) {
        return offlineRepository.sport.deleteGoal(id);
    }

    static computeStreak(logs: WorkoutLog[]): number {
        if (!logs.length) return 0;
        const days = new Set(logs.map(l => l.date));
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (days.has(key)) { streak++; } else if (i > 0) { break; }
        }
        return streak;
    }

    static getWeeklyStats(logs: WorkoutLog[]) {
        const now = new Date();
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const thisWeek = logs.filter(l => new Date(l.date) >= weekAgo);
        const lastWeek = logs.filter(l => new Date(l.date) >= twoWeeksAgo && new Date(l.date) < weekAgo);

        return {
            sessions: thisWeek.length,
            volume: thisWeek.reduce((a, b) => a + (b.total_volume || 0), 0),
            lastWeekVolume: lastWeek.reduce((a, b) => a + (b.total_volume || 0), 0),
            avgDuration: thisWeek.length ? Math.round(thisWeek.reduce((a, b) => a + (b.duration || 0), 0) / thisWeek.length) : 0
        };
    }
}
