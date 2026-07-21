export type ExerciseType =
  | "choice"
  | "compactChoice"
  | "fillBlank"
  | "buildWord"
  | "buildSentence"
  | "morphemeAnalysis"
  | "matchPairs"
  | "orderParts"
  | "correctMistake"
  | "classify"
  | "dialogueChoice"
  | "translationRecognition"
  | "selfCheck"
  | "reviewCard";

export type Exercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  skill: "meaning" | "form" | "grammar" | "reading" | "writing" | "speaking" | "dialogue" | "review";
  prompt: string;
  options?: string[];
  answer?: string | string[];
  pairs?: [string, string][];
  blocks?: string[];
  modelAnswer?: string;
  feedbackCorrect: string;
  feedbackWrong: string;
  relatedVocabularyIds: string[];
  relatedGrammarIds: string[];
  reviewed: boolean;
};

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  choice: "вибір",
  compactChoice: "короткий вибір",
  fillBlank: "пропуск",
  buildWord: "зібрати слово",
  buildSentence: "зібрати речення",
  morphemeAnalysis: "розбір слова",
  matchPairs: "пари",
  orderParts: "порядок частин",
  correctMistake: "виправлення",
  classify: "класифікація",
  dialogueChoice: "діалог",
  translationRecognition: "розуміння",
  selfCheck: "самоперевірка",
  reviewCard: "повторення"
};
