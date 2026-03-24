import { offlineRepository } from '@/data/offlineRepository';
import { JournalEntry, CreateEntryDTO } from '../types';

export class BibleService {
    static async getEntries() {
        return offlineRepository.bible.getEntries() as Promise<JournalEntry[]>;
    }

    static async getProgress() {
        return offlineRepository.bible.getProgress();
    }

    static async toggleChapter(chapterId: string, isChecked: boolean) {
        if (isChecked) {
            await offlineRepository.bible.markChapterUnread(chapterId);
            return;
        }

        await offlineRepository.bible.markChapterRead(chapterId);
    }

    static async markChapterRead(chapterId: string) {
        return offlineRepository.bible.markChapterRead(chapterId);
    }

    static async markChapterUnread(chapterId: string) {
        return offlineRepository.bible.markChapterUnread(chapterId);
    }

    static async createEntry(entry: CreateEntryDTO) {
        return offlineRepository.bible.createEntry(entry);
    }
}
