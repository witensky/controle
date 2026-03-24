import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDTO } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

export const useProfile = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const data = await ProfileService.getProfile();
            localStore.set(LOCAL_KEYS.PROFILE, data);
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes stale time as profile doesn't change often
        placeholderData: localStore.get<any>(LOCAL_KEYS.PROFILE) ?? undefined,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ProfileService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};
