import { Profile } from '../types';

const DEFAULT_PROFILE_NAMES = new Set(['', 'Utilisateur', 'Utilisateur local']);
const DEFAULT_CONTACT_EMAILS = new Set(['', 'user@lifestream.io', 'user@myflow.app']);
const DEFAULT_CONTACT_PHONES = new Set(['', '+212 6 XX XX XX XX']);

export const isOnboardingRequired = (profile: Profile | null | undefined) => {
  if (!profile) {
    return true;
  }

  const onboardingCompleted = Boolean(profile.settings_config?.onboarding?.completed);
  if (onboardingCompleted) {
    return false;
  }

  const username = String(profile.username || '').trim();
  const email = String(profile.settings_config?.contact?.email || '').trim();
  const phone = String(profile.settings_config?.contact?.phone || '').trim();

  const hasRealName = !DEFAULT_PROFILE_NAMES.has(username);
  const hasRealEmail = !DEFAULT_CONTACT_EMAILS.has(email);
  const hasRealPhone = !DEFAULT_CONTACT_PHONES.has(phone);

  return !(hasRealName && hasRealEmail && hasRealPhone);
};
