import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BibleService } from '../services/bible.service';
import { CreateEntryDTO } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

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
