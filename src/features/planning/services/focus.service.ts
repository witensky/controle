import { offlineRepository, type CreateFocusSessionDTO, type FocusSession } from '@/data/offlineRepository';

export type { FocusSession, CreateFocusSessionDTO };

export class FocusService {
    static async getFocusSessions(limit = 10) {
        return offlineRepository.planning.getFocusSessions(limit) as Promise<FocusSession[]>;
    }

    static async createFocusSession(dto: CreateFocusSessionDTO) {
        return offlineRepository.planning.createFocusSession(dto) as Promise<FocusSession>;
    }
}
