import { MissionCategory } from '../features/discipline/types';

export const STUDY_MISSION_CATEGORY: MissionCategory = 'Droit';
export const DEFAULT_MISSION_CATEGORIES: MissionCategory[] = ['Admin', STUDY_MISSION_CATEGORY, 'Sport', 'Personnel', 'Spirituel', 'Langues'];

export const resolveStudyDomainLabel = (value?: string | null) => {
  const normalized = String(value || '').trim();
  return normalized || 'Etudes';
};

export const displayMissionCategoryLabel = (category: string, studyDomainLabel: string) => {
  return category === STUDY_MISSION_CATEGORY ? studyDomainLabel : category;
};
