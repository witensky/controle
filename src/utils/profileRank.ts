const PROFILE_RANKS = [
  'Novice',
  'Étudiant',
  'Assidu',
  'Appliqué',
  'Avancé',
  'Confirmé',
  'Distingué',
  'Émérite',
  'Major',
  'Valedictorien',
] as const;

export const getProfileLevel = (totalXp = 0) => Math.max(1, Math.floor(Math.max(0, totalXp) / 1000) + 1);

export const resolveProfileRankTitle = (totalXp = 0) => {
  const level = getProfileLevel(totalXp);
  return PROFILE_RANKS[Math.min(PROFILE_RANKS.length - 1, level - 1)];
};