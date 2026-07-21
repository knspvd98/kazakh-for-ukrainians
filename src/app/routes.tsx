export type AppView =
  | "home"
  | "course"
  | "lesson"
  | "grammar"
  | "tables"
  | "vocabulary"
  | "phrases"
  | "practice"
  | "audio"
  | "progress"
  | "qa";

export type AppRoute = {
  view: AppView;
  courseBlockId?: string;
  lessonId?: string;
  grammarId?: string;
  tableId?: string;
  wordId?: string;
  phraseCategory?: string;
  flashcardWordId?: string;
};

export const navItems: { view: AppView; label: string }[] = [
  { view: "home", label: "Головна" },
  { view: "course", label: "Курс" },
  { view: "grammar", label: "Граматика" },
  { view: "tables", label: "Таблиці / Кестелер" },
  { view: "vocabulary", label: "Словник" },
  { view: "phrases", label: "Фрази" },
  { view: "practice", label: "Картки" },
  { view: "audio", label: "Аудіо / Дыбыс" },
  { view: "progress", label: "Прогрес" },
  { view: "qa", label: "Якість даних" }
];
