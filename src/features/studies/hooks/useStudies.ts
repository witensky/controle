import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudiesService } from '../services/studies.service';
import { CreateSubjectDTO, UpdateSubjectDTO } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';
import { LawSubject } from '../../../types';

export const useSubjects = () => {
    return useQuery({
        queryKey: ['studies', 'subjects'],
        queryFn: async () => {
            const data = await StudiesService.getSubjects();
            localStore.set(LOCAL_KEYS.SUBJECTS, data);
            return data;
        },
        placeholderData: localStore.get<LawSubject[]>(LOCAL_KEYS.SUBJECTS) ?? undefined,
    });
};

export const useCreateSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: StudiesService.createSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studies', 'subjects'] });
        },
    });
};

export const useUpdateSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateSubjectDTO }) => StudiesService.updateSubject(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studies', 'subjects'] });
        },
    });
};

export const useDeleteSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: StudiesService.deleteSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studies', 'subjects'] });
        },
    });
};
