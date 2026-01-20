
export type AppView = 'AUTH' | 'DASHBOARD' | 'FINANCE' | 'DISCIPLINE' | 'STUDIES' | 'LANGUAGES' | 'BIBLE';

export interface UserStats {
  finance: number;
  studies: number;
  discipline: number;
  mental: number;
  spiritual: number;
  languages: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  comment: string;
  date: string;
}

export interface LawSubject {
  id: string;
  name: string;
  progress: number;
  stressLevel: 'low' | 'medium' | 'high';
  chaptersTotal: number;
  chaptersDone: number;
}

export interface LanguageWord {
  word: string;
  definition: string;
  example: string;
}
