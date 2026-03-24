import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MissionService } from '../services/mission.service';
import { CreateMissionDTO, UpdateMissionDTO, Mission } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

export const useMissions = () => {
    return useQuery({
        queryKey: ['discipline', 'missions'],
        queryFn: async () => {
            const data = await MissionService.getMissions();
            localStore.set(LOCAL_KEYS.MISSIONS, data);
            return data;
        },
        placeholderData: localStore.get<Mission[]>(LOCAL_KEYS.MISSIONS) ?? undefined,
    });
};

export const useCreateMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: MissionService.createMission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discipline', 'missions'] });
        },
    });
};

export const useUpdateMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateMissionDTO }) => MissionService.updateMission(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discipline', 'missions'] });
        },
    });
};

export const useDeleteMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: MissionService.deleteMission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discipline', 'missions'] });
        },
    });
};
