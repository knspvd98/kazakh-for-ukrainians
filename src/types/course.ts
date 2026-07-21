export type Level = "A0" | "A1" | "A2" | "B1";

export type LessonStatus = "ready";

export type MorphemeRole = "root" | "plural" | "possessive" | "case" | "verb" | "question" | "negative" | "suffix";

export type Example = {
  kk: string;
  uk: string;
  note?: string;
};

export type MorphemePart = {
  text: string;
  role: MorphemeRole;
  label: string;
  meaning: string;
};

export type LessonVisualKind =
  | "word-construction"
  | "sound-harmony"
  | "conversation-paths"
  | "case-routes"
  | "verb-time"
  | "intention-to-sentence"
  | "everyday-route";

export type LessonVisualScene =
  | "language-map"
  | "word-builder"
  | "letter-focus"
  | "reading-desk"
  | "sound-pairs"
  | "ending-choice"
  | "object-label"
  | "availability"
  | "address"
  | "introduction"
  | "question-map"
  | "ownership"
  | "location"
  | "direction"
  | "origin"
  | "object-action"
  | "tool-company"
  | "two-nouns"
  | "pointing"
  | "sound-change"
  | "word-family"
  | "checkpoint"
  | "verb-center"
  | "verb-stem"
  | "time-context"
  | "past-event"
  | "action-now"
  | "routine"
  | "negative-action"
  | "verb-question"
  | "daily-actions"
  | "shared-action"
  | "want"
  | "need"
  | "polite-request"
  | "sentence-order"
  | "reason"
  | "opinion"
  | "story"
  | "bridge"
  | "cafe"
  | "shop"
  | "transport"
  | "city"
  | "home"
  | "family"
  | "study"
  | "work"
  | "plans"
  | "weather"
  | "health"
  | "portfolio";

export type LessonVisualObject = {
  icon: "book" | "blocks" | "pen" | "letters" | "ear" | "cup" | "pin" | "arrow" | "person" | "people" | "map" | "home" | "bus" | "bike" | "clock" | "calendar" | "bag" | "heart" | "help" | "menu" | "receipt" | "cloud" | "sun" | "cross" | "chat" | "lightbulb";
  label: string;
};

export type LessonVisualTeachingStep = {
  kk: string;
  uk: string;
};

export type LessonVisualTeaching = {
  title: string;
  steps: LessonVisualTeachingStep[];
  takeaway: string;
};

export type LessonVisual = {
  lessonNumber: number;
  kind: LessonVisualKind;
  eyebrow: string;
  title: string;
  description: string;
  alt: string;
  /** Internal editorial anchor: the concrete scene that the focus example must describe. */
  imageAnchor: string;
  scene?: LessonVisualScene;
  example?: string;
  meaning?: string;
  objects?: LessonVisualObject[];
  contrast?: { before: string; after: string; label: string };
  teaching?: LessonVisualTeaching;
};

export type DialogueSpeaker = "Диас" | "Алина" | "Даяшы" | "Сатушы" | "Жүргізуші" | "Мұғалім";

export type LessonSection =
  | { id: string; title: string; kind: "why"; body: string[] }
  | { id: string; title: string; kind: "situation"; body: string[] }
  | { id: string; title: string; kind: "concept"; headline: string; body: string[]; visual?: LessonVisual }
  | { id: string; title: string; kind: "model"; body: string[]; morphemes: MorphemePart[]; fullForm: string; fullMeaning: string }
  | { id: string; title: string; kind: "examples"; intro?: string; examples: Example[] }
  | { id: string; title: string; kind: "dialogue"; lines: { speaker: DialogueSpeaker; kk?: string; uk: string }[] }
  | { id: string; title: string; kind: "vocabulary"; vocabularyIds: string[] }
  | { id: string; title: string; kind: "grammar"; grammarIds: string[]; tableIds?: string[] }
  | { id: string; title: string; kind: "practice"; exerciseIds: string[] }
  | { id: string; title: string; kind: "review"; prompts: string[]; next: string };

export type Lesson = {
  id: string;
  number: number;
  blockId: string;
  title: string;
  subtitle: string;
  level: Level;
  estimatedMinutes: number;
  goal: string;
  canDo: string[];
  grammarLinks: string[];
  tableLinks: string[];
  vocabularyIds: string[];
  phraseIds: string[];
  exerciseIds: string[];
  sections: LessonSection[];
  contentWordEstimate: number;
};

export type CourseBlock = {
  id: string;
  title: string;
  level: string;
  description: string;
  lessonIds: string[];
};
