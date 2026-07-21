import type { Example, Level } from "./course";

export type VocabularyType = "word" | "phrase" | "form" | "suffix" | "ending" | "particle" | "pronoun" | "name";

export type WordForm = {
  label: string;
  kk: string;
  uk: string;
};

export type VocabularyEntry = {
  id: string;
  kk: string;
  uk: string;
  type: VocabularyType;
  pos?: string;
  level: Level;
  theme: string;
  lessonIds: string[];
  examples: Example[];
  notes?: string;
  forms?: WordForm[];
  grammarLinks?: string[];
  reviewed: boolean;
};

export const vocabularyTypeLabels: Record<VocabularyType, string> = {
  word: "слово",
  phrase: "фраза",
  form: "форма",
  suffix: "суфікс",
  ending: "закінчення",
  particle: "частка",
  pronoun: "займенник",
  name: "ім’я"
};