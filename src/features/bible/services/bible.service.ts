import { offlineRepository } from '@/data/offlineRepository';
import { Bookmark, CreateBookmarkDTO, CreateEntryDTO, JournalEntry } from '../types';

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

    static async getBookmarks() {
        return offlineRepository.bible.getBookmarks() as Promise<Bookmark[]>;
    }

    static async createBookmark(bookmark: CreateBookmarkDTO) {
        return offlineRepository.bible.createBookmark(bookmark);
    }

    static async deleteBookmark(bookmarkId: string) {
        return offlineRepository.bible.deleteBookmark(bookmarkId);
    }

    static async updateBookmark(bookmarkId: string, bookmark: CreateBookmarkDTO) {
        return offlineRepository.bible.updateBookmark(bookmarkId, bookmark);
    }
}
