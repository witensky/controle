import { offlineRepository } from '@/data/offlineRepository';
import { Transaction, CategoryBudget, SavingsItem, FinanceProfile } from '../types';

export class FinanceService {
    static async getTransactions() {
        return offlineRepository.finance.getTransactions() as Promise<Transaction[]>;
    }

    static async getBudgets() {
        return offlineRepository.finance.getBudgets() as Promise<CategoryBudget[]>;
    }

    static async getSavings() {
        return offlineRepository.finance.getSavings() as Promise<SavingsItem[]>;
    }

    static async getProfile() {
        return offlineRepository.profile.getFinanceProfile() as Promise<FinanceProfile>;
    }

    static async updateProfileSettings(settings: Record<string, unknown>) {
        return offlineRepository.profile.updateSettings(settings) as Promise<unknown>;
    }

    static async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>) {
        return offlineRepository.finance.createTransaction(transaction);
    }

    static async deleteTransaction(id: string) {
        return offlineRepository.finance.deleteTransaction(id);
    }

    static async updateTransaction(id: string, updates: Partial<Transaction>) {
        return offlineRepository.finance.updateTransaction(id, updates);
    }

    static async createSavings(savings: Omit<SavingsItem, 'id'>) {
        return offlineRepository.finance.createSavings(savings);
    }

    static async updateSavings(id: string, updates: Partial<SavingsItem>) {
        return offlineRepository.finance.updateSavings(id, updates);
    }

    static async deleteSavings(id: string) {
        return offlineRepository.finance.deleteSavings(id);
    }

    static async updateBudgets(budgets: CategoryBudget[]) {
        return offlineRepository.finance.updateBudgets(budgets);
    }

    static async executeSaving(savingId: string, amount: number, reason: string) {
        return offlineRepository.finance.executeSaving(savingId, amount, reason);
    }
}
