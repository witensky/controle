import { offlineRepository } from '@/data/offlineRepository';
import { LawSubject, CreateSubjectDTO, UpdateSubjectDTO } from '../types';

export class StudiesService {

    private static calculateStats(dto: CreateSubjectDTO | UpdateSubjectDTO) {
        const total = Math.max(1, Number(dto.chaptersTotal || 10));
        const done = Math.max(0, Number(dto.chaptersDone || 0));
        const progress = Math.min(100, Math.round((done / total) * 100));
        const stressLevel = progress < 30 ? 'high' : progress < 70 ? 'medium' : 'low';
        return { progress, stressLevel };
    }

    static async getSubjects() {
        return offlineRepository.studies.getSubjects() as Promise<LawSubject[]>;
    }

    static async createSubject(subject: CreateSubjectDTO) {
        return offlineRepository.studies.createSubject(subject);
    }

    static async updateSubject(id: string, updates: UpdateSubjectDTO) {
        return offlineRepository.studies.updateSubject(id, updates);
    }

    static async deleteSubject(id: string) {
        return offlineRepository.studies.deleteSubject(id);
    }
}
