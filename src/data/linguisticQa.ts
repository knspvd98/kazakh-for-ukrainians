export type LinguisticQaNote = {
  lessonId: string;
  item: string;
  issue: string;
  saferAlternative: string;
  reviewStatus: "needs_native_review";
};

// Internal editorial queue. These candidates are intentionally excluded from
// learner-facing lesson, phrasebook and vocabulary data until reviewed.
export const LINGUISTIC_QA_NOTES: LinguisticQaNote[] = [
  {
    lessonId: "lesson-41",
    item: "Тағы біреуін әкеліңізші.",
    issue: "The omitted object can be unclear without an immediately preceding referent.",
    saferAlternative: "Тағы бір су әкеліңізші.",
    reviewStatus: "needs_native_review"
  },
  {
    lessonId: "lesson-43",
    item: "Тезірек бара аласыз ба?",
    issue: "The degree of politeness and naturalness in a taxi can depend on context and intonation.",
    saferAlternative: "Асығып бара жатырмын.",
    reviewStatus: "needs_native_review"
  },
  {
    lessonId: "lesson-50",
    item: "Не жаңалық?",
    issue: "Common conversational formula, but register and placement in a beginner weather dialogue need native-speaker review.",
    saferAlternative: "Ауа райы қалай?",
    reviewStatus: "needs_native_review"
  }
];
