import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LanguagesService } from '../services/languages.service';
import { CreateWordDTO } from '../types';

export const useLearnedWords = (language: string) => {
    return useQuery({
        queryKey: ['languages', 'learned', language],
        queryFn: () => LanguagesService.getLearnedWords(language),
        enabled: !!language,
    });
};

export const useMarkAsLearned = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: LanguagesService.markAsLearned,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['languages', 'learned', variables.language] });
        },
    });
};

// Note: generateWords is likely better as a direct async function called from a handler or a useMutation if we want loading states tracked by RQ.
// Let's us useMutation for uniformity.
export const useGenerateWords = () => {
    return useMutation({
        mutationFn: ({ language }: { language: string }) => LanguagesService.generateWords(language),
    });
};
