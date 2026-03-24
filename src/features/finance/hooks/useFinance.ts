import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanceService } from '../services/finance.service';
import { Transaction, CategoryBudget, SavingsItem } from '../types';
import { localStore, LOCAL_KEYS } from '@/lib/localStorage';

export const useTransactions = () => {
    return useQuery({
        queryKey: ['finance', 'transactions'],
        queryFn: async () => {
            const data = await FinanceService.getTransactions();
            localStore.set(LOCAL_KEYS.TRANSACTIONS, data);
            return data;
        },
        placeholderData: localStore.get<Transaction[]>(LOCAL_KEYS.TRANSACTIONS) ?? undefined,
    });
};

export const useBudgets = () => {
    return useQuery({
        queryKey: ['finance', 'budgets'],
        queryFn: async () => {
            const data = await FinanceService.getBudgets();
            localStore.set(LOCAL_KEYS.BUDGETS, data);
            return data;
        },
        placeholderData: localStore.get<CategoryBudget[]>(LOCAL_KEYS.BUDGETS) ?? undefined,
    });
};

export const useSavings = () => {
    return useQuery({
        queryKey: ['finance', 'savings'],
        queryFn: async () => {
            const data = await FinanceService.getSavings();
            localStore.set(LOCAL_KEYS.SAVINGS, data);
            return data;
        },
        placeholderData: localStore.get<SavingsItem[]>(LOCAL_KEYS.SAVINGS) ?? undefined,
    });
};

export const useFinanceProfile = () => {
    return useQuery({
        queryKey: ['finance', 'profile'],
        queryFn: FinanceService.getProfile,
    });
};

export const useUpdateFinanceSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.updateProfileSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

// --- MUTATIONS ---

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) => FinanceService.updateTransaction(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
        },
    });
}

export const useCreateSavings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.createSavings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
        },
    });
};

export const useUpdateSavings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SavingsItem> }) => FinanceService.updateSavings(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
        },
    });
};

export const useDeleteSavings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.deleteSavings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
        },
    });
}

export const useExecuteSaving = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) => FinanceService.executeSaving(id, amount, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
            queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
        },
    });
}

export const useUpdateBudgets = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FinanceService.updateBudgets,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
        },
    });
}
