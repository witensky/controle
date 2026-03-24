import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SportService } from '../services/sport.service';
import { CreateRoutineDTO, CreateLogDTO, CreateMetricDTO, FitnessGoal } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

export const useSportData = () => {
    return useQuery({
        queryKey: ['sport', 'data'],
        queryFn: async () => {
            const data = await SportService.getSportData();
            localStore.set(LOCAL_KEYS.SPORT, data);
            return data;
        },
        placeholderData: localStore.get<any>(LOCAL_KEYS.SPORT) ?? undefined,
    });
};

export const useSaveRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ routine, id }: { routine: CreateRoutineDTO; id?: string }) => SportService.saveRoutine(routine, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
        },
    });
};

export const useDeleteRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SportService.deleteRoutine,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
        },
    });
};

export const useSaveLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SportService.saveLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useAddMetric = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SportService.addMetric,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
        },
    });
};

export const useUpsertGoal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SportService.upsertGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
        },
    });
};

export const useDeleteGoal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: SportService.deleteGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sport', 'data'] });
        },
    });
};
