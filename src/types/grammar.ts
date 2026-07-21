import type { Example, Level } from "./course";

export type GrammarArticle = {
  id: string;
  title: string;
  category: string;
  level: Level;
  model: string;
  explanation: string[];
  examples: Example[];
  commonMistakes: { wrong: string; correct: string; explanation: string }[];
  miniTable: string[][];
  lessonIds: string[];
  exerciseIds: string[];
};

export type EndingTable = {
  id: string;
  title: string;
  titleKk: string;
  category: string;
  categoryKk: string;
  shortExplanation: string;
  columns: string[];
  rows: string[][];
  examples: Example[];
  mistakes: { wrong: string; correct: string; explanation: string }[];
  lessonIds: string[];
};
