export interface WordDetail {
    word: string;
    phonetic: string;
    definition: string;
    example: string;
    translation: string;
}

export interface LearnedWord extends WordDetail {
    id: string;
    language: string;
    learned_at: string;
}

export interface CreateWordDTO extends WordDetail {
    language: string;
}

export type Word = LearnedWord;
