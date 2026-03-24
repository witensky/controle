
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsService, CreateGoalDTO } from '../services/goals.service';
import { FocusService, CreateFocusSessionDTO } from '../services/focus.service';

// --- GOALS HOOKS ---
export const useWeeklyGoals = () => {
    return useQuery({
        queryKey: ['planning', 'weekly_goals'],
        queryFn: () => GoalsService.getWeeklyGoals(),
    });
};

export const useCreateGoal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateGoalDTO) => GoalsService.createGoal(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planning', 'weekly_goals'] });
        },
    });
};

export const useUpdateGoalProgress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, count }: { id: string; count: number }) => GoalsService.updateGoalProgress(id, count),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planning', 'weekly_goals'] });
        },
    });
};

// --- FOCUS HOOKS ---
export const useFocusSessions = (limit?: number) => {
    return useQuery({
        queryKey: ['planning', 'focus_sessions', limit],
        queryFn: () => FocusService.getFocusSessions(limit),
    });
};

export const useCreateFocusSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateFocusSessionDTO) => FocusService.createFocusSession(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planning', 'focus_sessions'] });
        },
    });
};
