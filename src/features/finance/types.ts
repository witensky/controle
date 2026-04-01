export interface Transaction {
    id: string;
    user_id: string;
    date: string;
    /** When true, this transaction is a planned provision (manual execution required). */
    planned?: boolean;
    /** Original scheduled date for a planned provision (kept after execution). */
    planned_date?: string;
    title: string;
    category: string;
    amount: number;
    type: 'expense' | 'deposit';
    comment?: string;
    source?: string;
}

export interface CategoryBudget {
    category: string;
    limit: number;
}

export interface SavingsItem {
    id: string;
    amount: number;
    reason: string;
    date: string;
    executed?: boolean;
    execution_date?: string;
}

export interface FinanceProfile {
    amci_monthly_amount: number;
    next_amci_date: string;
    settings_config?: {
        amci_recurrence?: 'monthly' | 'custom';
        amci_day_of_month?: number;
        daily_quota_override?: number | null;
    };
}
