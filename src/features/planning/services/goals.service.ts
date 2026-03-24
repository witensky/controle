import { offlineRepository, type CreateGoalDTO, type WeeklyGoal } from '@/data/offlineRepository';

export type { WeeklyGoal, CreateGoalDTO };

export class GoalsService {
    static async getWeeklyGoals() {
        return offlineRepository.planning.getWeeklyGoals() as Promise<WeeklyGoal[]>;
    }

    static async createGoal(dto: CreateGoalDTO) {
        return offlineRepository.planning.createGoal(dto) as Promise<WeeklyGoal>;
    }

    static async updateGoalProgress(id: string, current_count: number) {
        return offlineRepository.planning.updateGoalProgress(id, current_count) as Promise<WeeklyGoal>;
    }
}
