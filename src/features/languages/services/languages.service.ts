import { offlineRepository } from '@/data/offlineRepository';
import { Word, CreateWordDTO } from '../types';

export class LanguagesService {
    static async getLearnedWords(language: string) {
        return offlineRepository.languages.getLearnedWords(language) as Promise<Word[]>;
    }

    static async markAsLearned(word: CreateWordDTO) {
        return offlineRepository.languages.markAsLearned(word);
    }

    static async generateWords(language: string): Promise<Word[]> {
        return offlineRepository.languages.generateWords(language) as Promise<Word[]>;
    }
}
