import { LOCAL_KEYS, localStore } from '@/lib/localStorage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BibleService } from '../services/bible.service';
import { CreateBookmarkDTO } from '../types';

export const useBibleEntries = () => {
    return useQuery({
        queryKey: ['bible', 'entries'],
        queryFn: async () => {
            const data = await BibleService.getEntries();
            localStore.set(LOCAL_KEYS.BIBLE_ENTRIES, data);
            return data;
        },
        placeholderData: localStore.get<any[]>(LOCAL_KEYS.BIBLE_ENTRIES) ?? undefined,
    });
};

export const useBibleProgress = () => {
    return useQuery({
        queryKey: ['bible', 'progress'],
        queryFn: async () => {
            const data = await BibleService.getProgress();
            localStore.set(LOCAL_KEYS.BIBLE_PROGRESS, data);
            return data;
        },
        placeholderData: localStore.get<string[]>(LOCAL_KEYS.BIBLE_PROGRESS) ?? undefined,
    });
};

export const useBookmarks = () => {
    return useQuery({
        queryKey: ['bible', 'bookmarks'],
        queryFn: async () => {
            const data = await BibleService.getBookmarks();
            localStore.set(LOCAL_KEYS.BIBLE_BOOKMARKS, data);
            return data;
        },
        placeholderData: localStore.get<any[]>(LOCAL_KEYS.BIBLE_BOOKMARKS) ?? undefined,
    });
};

export const useMarkChapterRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BibleService.markChapterRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'progress'] });
        },
    });
};

export const useMarkChapterUnread = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BibleService.markChapterUnread,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'progress'] });
        },
    });
};

export const useCreateEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BibleService.createEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'entries'] });
        },
    });
};

export const useCreateBookmark = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BibleService.createBookmark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'bookmarks'] });
        },
    });
};

export const useDeleteBookmark = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: BibleService.deleteBookmark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'bookmarks'] });
        },
    });
};

export const useUpdateBookmark = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookmarkId, bookmark }: { bookmarkId: string; bookmark: CreateBookmarkDTO }) =>
            BibleService.updateBookmark(bookmarkId, bookmark),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'bookmarks'] });
        },
    });
};
