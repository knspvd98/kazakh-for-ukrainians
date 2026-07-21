import { exercises } from "./exercises";
import { vocabulary } from "./vocabulary";
import { grammarArticles } from "./grammar";

export const reviewIntervals = [0, 1, 2, 4, 7, 14, 30];

export const reviewDeck = [
  ...vocabulary.slice(0, 260).map(item => ({ id: "word-" + item.id, kind: "word" as const, prompt: item.kk, answer: item.uk, relatedId: item.id })),
  ...grammarArticles.map(item => ({ id: "grammar-" + item.id, kind: "grammar" as const, prompt: item.title, answer: item.model, relatedId: item.id })),
  ...exercises.slice(0, 260).map(item => ({ id: "exercise-" + item.id, kind: "exercise" as const, prompt: item.prompt, answer: Array.isArray(item.answer) ? item.answer.join(" + ") : item.answer ?? item.modelAnswer ?? "", relatedId: item.id }))
];