export interface Profile {
    id: string;
    username: string;
    rank_title: string;
    total_xp: number;
    total_missions_completed?: number;
    amci_monthly_amount: number;
    next_amci_date?: string;
    location?: string;
    bio?: string;
    motto?: string;
    avatar_url?: string;
    settings_config?: any;
    created_at: string;
}

export interface UpdateProfileDTO {
    username?: string;
    avatar_url?: string;
    amci_monthly_amount?: number;
    next_amci_date?: string;
    location?: string;
    bio?: string;
    motto?: string;
}
