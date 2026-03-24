import { offlineRepository } from '@/data/offlineRepository';
import { Mission, MissionPriority, MissionCategory, MissionStatus, CreateMissionDTO, UpdateMissionDTO } from '../types';

export class MissionService {

    static async getMissions() {
        return offlineRepository.discipline.getMissions() as Promise<Mission[]>;
    }

    static async createMission(mission: CreateMissionDTO) {
        return offlineRepository.discipline.createMission(mission);
    }

    static async updateMission(id: string, updates: UpdateMissionDTO) {
        return offlineRepository.discipline.updateMission(id, updates);
    }

    static async deleteMission(id: string) {
        return offlineRepository.discipline.deleteMission(id);
    }

    // Helper kept if needed, but DTOs usually handle this before service call or service does it.
    // In strict Clean Architecture, logic like "calculateImpact" could be here.
    // The previous implementation calculated impact in create().
    // Let's rely on the caller passing correct DTO for now or add helper usage if we want default logic.
}
