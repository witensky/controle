import { offlineRepository } from '@/data/offlineRepository';
import { Profile, UpdateProfileDTO } from '../types';

export class ProfileService {

    static async getProfile() {
        return offlineRepository.profile.getProfile() as Promise<Profile>;
    }

    static async updateProfile(updates: UpdateProfileDTO) {
        return offlineRepository.profile.updateProfile(updates) as Promise<Profile>;
    }
}
