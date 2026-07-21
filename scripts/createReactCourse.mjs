import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function ensure(dir) {
  await mkdir(path.join(root, dir), { recursive: true });
}

async function put(file, content) {
  await ensure(path.dirname(file));
  await writeFile(path.join(root, file), content.trimStart(), "utf8");
}

const packageJson = `{
  "name": "kazakh-ukrainian-course",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "qa": "tsx src/qa/runQualityChecks.ts"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "typescript": "^5.7.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0",
    "tsx": "^4.19.2"
  },
  "devDependencies": {}
}`;

const indexHtml = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Казахська через українську</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}`;

const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020"
  }
});`;

const courseTypes = `export type Level = "A0" | "A1" | "A2" | "B1";

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

export type LessonSection =
  | { id: string; title: string; kind: "why"; body: string[] }
  | { id: string; title: string; kind: "situation"; body: string[] }
  | { id: string; title: string; kind: "concept"; headline: string; body: string[] }
  | { id: string; title: string; kind: "model"; body: string[]; morphemes: MorphemePart[]; fullForm: string; fullMeaning: string }
  | { id: string; title: string; kind: "examples"; intro?: string; examples: Example[] }
  | { id: string; title: string; kind: "dialogue"; lines: { speaker: "Диас" | "Аліна"; kk?: string; uk: string }[] }
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
  sourceIdeas: string[];
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
};`;

const grammarTypes = `import type { Example, Level } from "./course";

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
  category: string;
  shortExplanation: string;
  columns: string[];
  rows: string[][];
  examples: Example[];
  mistakes: { wrong: string; correct: string; explanation: string }[];
  lessonIds: string[];
};`;

const vocabularyTypes = `import type { Example, Level } from "./course";

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
};`;

const exerciseTypes = `export type ExerciseType =
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
};`;

const routes = `export type AppView =
  | "home"
  | "course"
  | "lesson"
  | "grammar"
  | "tables"
  | "vocabulary"
  | "phrases"
  | "practice"
  | "review"
  | "progress"
  | "qa";

export type AppRoute = {
  view: AppView;
  lessonId?: string;
  grammarId?: string;
  tableId?: string;
  wordId?: string;
  phraseCategory?: string;
};

export const navItems: { view: AppView; label: string }[] = [
  { view: "home", label: "Головна" },
  { view: "course", label: "Курс" },
  { view: "grammar", label: "Граматика" },
  { view: "tables", label: "Таблиці" },
  { view: "vocabulary", label: "Словник" },
  { view: "phrases", label: "Фразник" },
  { view: "practice", label: "Практика" },
  { view: "review", label: "Повторення" },
  { view: "progress", label: "Прогрес" },
  { view: "qa", label: "Якість даних" }
];`;

const structureData = `import type { CourseBlock } from "../types/course";

export const lessonPlan = [
  ["b1", 1, "Казахська — не таблиці й не сухі правила", "Система перед таблицею", "A0", "system"],
  ["b1", 2, "Казахська як конструктор: корінь + частини слова", "Аглютинація без страху", "A0", "morpheme"],
  ["b1", 3, "Чому казахські слова бувають довгими", "Одна форма може нести кілька значень", "A0", "longword"],
  ["b1", 4, "Вимова: говоримо ближче до носіїв", "Звуки, які не можна спростити", "A0", "phonetics"],
  ["b1", 5, "Закон сингармонізму", "Гармонія голосних і вибір закінчення", "A0", "harmony"],
  ["b1", 6, "Як читаються казахські слова", "Кирилиця знайома, але правила інші", "A0", "reading"],
  ["b1", 7, "Наголос", "Ритм слова і спокійне читання", "A0", "stress"],
  ["b1", 8, "Перший підсумок: як бачити слово", "Повторюємо основу, частини й звучання", "A0", "checkpoint"],
  ["b2", 9, "Притяжальність: чому “моя книга” не просто менің кітап", "Належність позначається на самому слові", "A1", "possessive"],
  ["b2", 10, "Озвончення кореня", "Коли основа трохи змінюється", "A1", "voicing"],
  ["b2", 11, "Корисні суфікси", "Суфікси, які швидко розширюють словник", "A1", "suffixes"],
  ["b2", 12, "Що таке падежі й навіщо вони потрібні", "Падеж як відповідь на питання", "A1", "cases"],
  ["b2", 13, "Місцевий падеж: де?", "Де щось є або відбувається", "A1", "locative"],
  ["b2", 14, "Давально-напрямний падеж: куди? кому?", "Напрям і адресат", "A1", "dative"],
  ["b2", 15, "Вихідний падеж: звідки?", "Рух від точки і джерело", "A1", "ablative"],
  ["b2", 16, "Знахідний падеж: що саме?", "Конкретний об’єкт дії", "A1", "accusative"],
  ["b2", 17, "Орудний падеж: чим? з ким?", "Інструмент і спільна дія", "A1", "instrumental"],
  ["b2", 18, "Родовий падеж: чий?", "Власник і зв’язок між іменниками", "A1", "genitive"],
  ["b2", 19, "Вказівні слова", "Бұл, осы, сол, анау в живих реченнях", "A1", "demonstratives"],
  ["b2", 20, "Перші речення: Бұл, бар, жоқ", "Назвати, підтвердити наявність, заперечити", "A1", "nominal"],
  ["b2", 21, "Питання: кім, не, қайда, қалай, қанша", "Питальні слова без кальки", "A1", "questions"],
  ["b2", 22, "Знайомство: Менің атым ..., сен, сіз", "Ім’я, звертання і ввічливість", "A1", "intro"],
  ["b3", 23, "Як працюють казахські дієслова", "Дієслово як центр події", "A1", "verbs"],
  ["b3", 24, "Основа дієслова", "Як знайти дієслівний корінь", "A1", "verbstem"],
  ["b3", 25, "Теперішнє / майбутнє значення", "Одна форма, два контексти", "A1", "presentfuture"],
  ["b3", 26, "Минулий час", "Що вже сталося", "A1", "past"],
  ["b3", 27, "Теперішній процес / дія зараз", "Дія, яка відбувається тепер", "A2", "progressive"],
  ["b3", 28, "Звична дія", "Повторювані дії й повсякденність", "A2", "habit"],
  ["b3", 29, "Заперечення дієслова", "Як сказати, що дія не відбувається", "A2", "verbnegative"],
  ["b3", 30, "Питання з дієсловами", "Питальна частка і дієслово", "A2", "verbquestions"],
  ["b3", 31, "Дієслова в побутових ситуаціях", "Дія в кафе, місті, навчанні", "A2", "verbscenarios"],
  ["b4", 32, "Залоги дієслів", "Коли дія повертається, робиться разом або змушує", "A2", "voices"],
  ["b4", 33, "Як сказати “я хочу”", "...-ғым келеді без кальки", "A2", "want"],
  ["b4", 34, "Потреба: “мені потрібно”", "Маған ... керек", "A2", "need"],
  ["b4", 35, "Ввічливі прохання", "-ыңызшы / -іңізші в сервісі й навчанні", "A2", "requests"],
  ["b4", 36, "Як перекладати речення без кальки", "Шукаємо дієслово і модель", "A2", "translation"],
  ["b4", 37, "Причина й пояснення", "Бо, тому що, пояснювальні зв’язки", "A2", "reason"],
  ["b4", 38, "Думка й ставлення", "Як висловити позицію просто", "A2", "opinion"],
  ["b4", 39, "Короткі історії", "Події в порядку", "A2", "stories"],
  ["b4", 40, "Підсумковий A2/B1 bridge", "Перехід до довших текстів", "B1", "bridge"],
  ["b5", 41, "Кафе", "Замовити, уточнити, попросити", "A2", "cafe"],
  ["b5", 42, "Магазин", "Ціна, вибір, оплата", "A2", "shop"],
  ["b5", 43, "Транспорт", "Маршрут, таксі, зупинка", "A2", "transport"],
  ["b5", 44, "Місто", "Місця, напрямки, орієнтація", "A2", "city"],
  ["b5", 45, "Дім", "Побут і простір", "A2", "home"],
  ["b5", 46, "Родина", "Люди, стосунки, належність", "A2", "family"],
  ["b5", 47, "Навчання", "Урок, університет, запитання", "A2", "study"],
  ["b5", 48, "Робота", "Професії, обов’язки, день", "A2", "work"],
  ["b5", 49, "Час і плани", "Коли, о котрій, що далі", "A2", "time"],
  ["b5", 50, "Погода", "День, стан, коротка розмова", "A2", "weather"],
  ["b5", 51, "Здоров’я", "Самопочуття і прохання про допомогу", "A2", "health"],
  ["b5", 52, "Повторення всього курсу", "Змішане повторення й фінальні сценарії", "B1", "finalreview"]
] as const;

export const courseBlocks: CourseBlock[] = [
  { id: "b1", title: "Блок 1. Знайомимося з казахською мовою", level: "A0", description: "Починаємо з логіки мови: система, корінь, частини слова, читання, сингармонізм.", lessonIds: lessonPlan.filter(l => l[0] === "b1").map(l => "lesson-" + l[1]) },
  { id: "b2", title: "Блок 2. Важлива база", level: "A1", description: "Притяжальність, падежі, перші речення, питання й знайомство.", lessonIds: lessonPlan.filter(l => l[0] === "b2").map(l => "lesson-" + l[1]) },
  { id: "b3", title: "Блок 3. Дієслова", level: "A1 → A2", description: "Дієслівна основа, часи, заперечення, питання й побутові дії.", lessonIds: lessonPlan.filter(l => l[0] === "b3").map(l => "lesson-" + l[1]) },
  { id: "b4", title: "Блок 4. Підвищуємо рівень", level: "A2 → B1", description: "Бажання, потреба, прохання, переклад без кальки, думка й короткі історії.", lessonIds: lessonPlan.filter(l => l[0] === "b4").map(l => "lesson-" + l[1]) },
  { id: "b5", title: "Блок 5. Побутові сценарії", level: "A2 → B1", description: "Кафе, магазин, транспорт, місто, дім, родина, навчання, робота, плани й здоров’я.", lessonIds: lessonPlan.filter(l => l[0] === "b5").map(l => "lesson-" + l[1]) }
];`;

const dataHelpers = `import type { Example, MorphemePart } from "../types/course";

export const vowelsSoft = "әөүіе".split("");
export const vowelsHard = "аоұы".split("");
export const voiceless = "кқпстшщфхһцч".split("");
export const sonorMouth = "лруй".split("");
export const sonorNasal = "мнң".split("");
export const voicedSpecial = "жз".split("");

export function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-zа-яіїєґәғқңөұүһі0-9]+/giu, "-").replace(/^-|-$/g, "");
}

export function lastLetter(word: string): string {
  return [...word.trim()].filter(ch => /[a-zа-яіїєґәғқңөұүһі]/iu.test(ch)).pop()?.toLowerCase() ?? "";
}

export function isSoft(word: string): boolean {
  const letters = [...word.toLowerCase()].reverse();
  const lastVowel = letters.find(ch => vowelsSoft.includes(ch) || vowelsHard.includes(ch));
  return lastVowel ? vowelsSoft.includes(lastVowel) : false;
}

export function pickPair(word: string, hard: string, soft: string): string {
  return isSoft(word) ? soft : hard;
}

export function pluralOf(word: string): string {
  const last = lastLetter(word);
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "тар", "тер");
  if (sonorNasal.includes(last) || voicedSpecial.includes(last)) return word + pickPair(word, "дар", "дер");
  return word + pickPair(word, "лар", "лер");
}

export function locativeOf(word: string): string {
  const last = lastLetter(word);
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "та", "те") : pickPair(word, "да", "де"));
}

export function dativeOf(word: string): string {
  const last = lastLetter(word);
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "қа", "ке") : pickPair(word, "ға", "ге"));
}

export function ablativeOf(word: string): string {
  const last = lastLetter(word);
  if (sonorNasal.includes(last)) return word + pickPair(word, "нан", "нен");
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "тан", "тен") : pickPair(word, "дан", "ден"));
}

export function accusativeOf(word: string): string {
  const last = lastLetter(word);
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "ты", "ті");
  if ("аеәоөұүыіиюя".includes(last)) return word + pickPair(word, "ны", "ні");
  return word + pickPair(word, "ды", "ді");
}

export function instrumentalOf(word: string): string {
  const last = lastLetter(word);
  if (voicedSpecial.includes(last)) return word + "бен";
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + "пен";
  return word + "мен";
}

export function genitiveOf(word: string): string {
  const last = lastLetter(word);
  if ("аеәоөұүыіиюя".includes(last) || sonorNasal.includes(last)) return word + pickPair(word, "ның", "нің");
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "тың", "тің");
  return word + pickPair(word, "дың", "дің");
}

export function poss1Of(word: string): string {
  const base = word.endsWith("п") ? word.slice(0, -1) + "б" : word.endsWith("қ") ? word.slice(0, -1) + "ғ" : word.endsWith("к") ? word.slice(0, -1) + "г" : word;
  const last = lastLetter(base);
  return base + ("аеәоөұүыіиюя".includes(last) ? pickPair(base, "м", "м") : pickPair(base, "ым", "ім"));
}

export function makeExample(kk: string, uk: string, note?: string): Example {
  return { kk, uk, note };
}

export function defaultMorpheme(model: string): MorphemePart[] {
  if (model.includes("кітап")) {
    return [
      { text: "кітап", role: "root", label: "корінь", meaning: "книжка" },
      { text: "тар", role: "plural", label: "множина", meaning: "кілька книжок" },
      { text: "ымыз", role: "possessive", label: "належність", meaning: "наші" },
      { text: "да", role: "case", label: "місце", meaning: "у / в" }
    ];
  }
  if (model.includes("барғым")) {
    return [
      { text: "бар", role: "verb", label: "дія", meaning: "йти" },
      { text: "ғым", role: "possessive", label: "бажання від мого боку", meaning: "моє бажання зробити дію" },
      { text: "келеді", role: "verb", label: "приходить / хочеться", meaning: "формує модель бажання" }
    ];
  }
  return [
    { text: model.split(" ")[0] ?? model, role: "root", label: "основа", meaning: "головна частина" }
  ];
}`;

// Keep the vocabulary source as tuples so generated forms remain reviewable and traceable.
const vocabularyData = `import type { VocabularyEntry } from "../types/vocabulary";
import { ablativeOf, accusativeOf, dativeOf, genitiveOf, instrumentalOf, locativeOf, pluralOf, poss1Of, slug } from "./helpers";

type SeedWord = {
  kk: string;
  uk: string;
  type?: VocabularyEntry["type"];
  pos?: string;
  level?: VocabularyEntry["level"];
  theme: string;
  lesson?: number;
  grammar?: string[];
  example?: string;
};

const seedWords: SeedWord[] = [
  ["кітап","книжка","word","іменник","A0","навчання",2,"Бұл кітап."],
  ["үй","дім","word","іменник","A0","дім",2,"Үйде кітап бар."],
  ["қала","місто","word","іменник","A0","місто",2,"Қалада мектеп бар."],
  ["мектеп","школа","word","іменник","A0","навчання",2,"Мектепте сабақ бар."],
  ["дос","друг / подруга","word","іменник","A0","люди",2,"Досым қазақша сөйлейді."],
  ["сөз","слово","word","іменник","A0","мова",3,"Жаңа сөз."],
  ["су","вода","word","іменник","A0","їжа",20,"Су бар."],
  ["қалам","ручка","word","іменник","A0","навчання",20,"Бұл қалам."],
  ["сабақ","урок","word","іменник","A1","навчання",13,"Сабақта жаңа сөз бар."],
  ["кафе","кафе","word","іменник","A1","кафе",41,"Кафеде су бар."],
  ["асхана","їдальня","word","іменник","A1","кафе",41,"Асханада шай бар."],
  ["дүкен","магазин","word","іменник","A1","магазин",42,"Дүкенде нан бар."],
  ["нан","хліб","word","іменник","A1","їжа",42,"Нан бар."],
  ["шай","чай","word","іменник","A1","напої",41,"Шай ішемін."],
  ["кофе","кава","word","іменник","A1","напої",41,"Кофе бар ма?"],
  ["тамақ","їжа","word","іменник","A1","їжа",41,"Тамақ дәмді."],
  ["жұмыс","робота","word","іменник","A1","робота",48,"Жұмыс көп."],
  ["уақыт","час","word","іменник","A1","час",49,"Уақыт бар ма?"],
  ["күн","день; сонце","word","іменник","A0","час",6,"Бүгін күн жақсы."],
  ["апта","тиждень","word","іменник","A1","час",49,"Аптада жеті күн бар."],
  ["ай","місяць","word","іменник","A1","час",49,"Айда сабақ көп."],
  ["жыл","рік","word","іменник","A1","час",49,"Жыл ұзақ."],
  ["бүгін","сьогодні","word","прислівник","A1","час",49,"Бүгін сабақ бар."],
  ["ертең","завтра","word","прислівник","A1","час",49,"Ертең жұмыс бар."],
  ["кеше","вчора","word","прислівник","A1","час",49,"Кеше сабақ болды."],
  ["қазір","зараз","word","прислівник","A1","час",27,"Қазір сабақ болып жатыр."],
  ["кейін","пізніше","word","прислівник","A1","час",37,"Кейін келемін."],
  ["ерте","рано","word","прислівник","A1","час",49,"Ерте келемін."],
  ["кеш","вечір; пізно","word","іменник","A1","час",49,"Кеш болды."],
  ["адам","людина","word","іменник","A1","люди",12,"Адам сөйлейді."],
  ["бала","дитина","word","іменник","A1","родина",46,"Бала үйде."],
  ["ана","мама","word","іменник","A1","родина",46,"Анам үйде."],
  ["әке","тато","word","іменник","A1","родина",46,"Әкем жұмыста."],
  ["аға","старший брат / чоловік старший","word","іменник","A1","родина",46,"Ағам қалада."],
  ["іні","молодший брат","word","іменник","A1","родина",46,"Інім мектепте."],
  ["әпке","старша сестра","word","іменник","A1","родина",46,"Әпкем жұмыста."],
  ["қарындас","молодша сестра","word","іменник","A1","родина",46,"Қарындасым мектепте."],
  ["ата","дідусь","word","іменник","A1","родина",46,"Атам үйде."],
  ["әже","бабуся","word","іменник","A1","родина",46,"Әжем үйде."],
  ["отбасы","родина","word","іменник","A1","родина",46,"Отбасым үлкен."],
  ["мұғалім","вчитель / вчителька","word","іменник","A1","навчання",47,"Мұғалім сабақта."],
  ["студент","студент / студентка","word","іменник","A1","навчання",22,"Мен студентпін."],
  ["дәрігер","лікар / лікарка","word","іменник","A1","здоров’я",51,"Дәрігер көмектеседі."],
  ["қызметкер","працівник / працівниця","word","іменник","A2","робота",48,"Қызметкер жұмыста."],
  ["жол","дорога","word","іменник","A1","транспорт",43,"Жол ұзақ."],
  ["көше","вулиця","word","іменник","A1","місто",44,"Көше кең."],
  ["аялдама","зупинка","word","іменник","A1","транспорт",43,"Аялдама жақын."],
  ["вокзал","вокзал","word","іменник","A1","транспорт",43,"Вокзал қалада."],
  ["такси","таксі","word","іменник","A1","транспорт",43,"Такси келді."],
  ["автобус","автобус","word","іменник","A1","транспорт",43,"Автобус аялдамада."],
  ["баға","ціна","word","іменник","A1","магазин",42,"Бағасы қанша?"],
  ["ақша","гроші","word","іменник","A1","магазин",42,"Ақша бар."],
  ["карта","картка","word","іменник","A1","магазин",42,"Картамен төлеймін."],
  ["чек","чек","word","іменник","A1","магазин",42,"Чек керек пе?"],
  ["пакет","пакет","word","іменник","A1","магазин",42,"Пакет керек пе?"],
  ["есеп","рахунок","word","іменник","A1","кафе",41,"Есепті әкеліңізші."],
  ["мәзір","меню","word","іменник","A1","кафе",41,"Мәзірді көрсетіңізші."],
  ["ауа","повітря","word","іменник","A1","погода",50,"Ауа таза."],
  ["рай","погода","word","іменник","A1","погода",50,"Ауа райы жақсы."],
  ["жаңбыр","дощ","word","іменник","A1","погода",50,"Жаңбыр жауды."],
  ["қар","сніг","word","іменник","A1","погода",50,"Қар жауды."],
  ["жел","вітер","word","іменник","A1","погода",50,"Жел қатты."],
  ["денсаулық","здоров’я","word","іменник","A2","здоров’я",51,"Денсаулық маңызды."],
  ["бас","голова","word","іменник","A1","здоров’я",51,"Басым ауырып тұр."],
  ["қол","рука","word","іменник","A1","здоров’я",51,"Қолым ауырып тұр."],
  ["аяқ","нога","word","іменник","A1","здоров’я",51,"Аяғым ауырып тұр."],
  ["дәрі","ліки","word","іменник","A1","здоров’я",51,"Дәрі керек."],
  ["жақсы","добре; хороший","word","прикметник","A0","реакції",1,"Жақсы."],
  ["жаман","поганий","word","прикметник","A1","реакції",1,"Жаман емес."],
  ["үлкен","великий","word","прикметник","A1","опис",45,"Үлкен үй."],
  ["кішкентай","маленький","word","прикметник","A1","опис",45,"Кішкентай бөлме."],
  ["жаңа","новий","word","прикметник","A0","опис",6,"Жаңа сөз."],
  ["ескі","старий","word","прикметник","A1","опис",45,"Ескі кітап."],
  ["жақын","близько; близький","word","прикметник","A1","місто",44,"Мектеп жақын."],
  ["алыс","далеко; далекий","word","прикметник","A1","місто",44,"Вокзал алыс."],
  ["оң","правий","word","прикметник","A1","місто",44,"Оң жақта."],
  ["сол","лівий; той","word","прикметник","A1","місто",44,"Сол жақта."],
  ["ыстық","гарячий","word","прикметник","A1","їжа",41,"Шай ыстық."],
  ["суық","холодний","word","прикметник","A1","їжа",41,"Су суық."],
  ["дәмді","смачний","word","прикметник","A1","їжа",41,"Тамақ дәмді."],
  ["ащы","гострий","word","прикметник","A1","їжа",41,"Тамақ ащы."],
  ["тәтті","солодкий","word","прикметник","A1","їжа",41,"Шай тәтті."],
  ["мен","я","pronoun","займенник","A0","займенники",22,"Мен студентпін."],
  ["сен","ти","pronoun","займенник","A0","займенники",22,"Сен дайынсың ба?"],
  ["сіз","Ви","pronoun","займенник","A0","займенники",22,"Сіз дайынсыз ба?"],
  ["ол","він / вона","pronoun","займенник","A0","займенники",22,"Ол студент."],
  ["біз","ми","pronoun","займенник","A1","займенники",9,"Біз үйдеміз."],
  ["олар","вони","pronoun","займенник","A1","займенники",9,"Олар қалада."],
  ["бұл","це","pronoun","вказівне слово","A0","речення",20,"Бұл кітап."],
  ["осы","цей / саме цей","pronoun","вказівне слово","A1","речення",19,"Осы жерде тоқтаңызшы."],
  ["сол","той","pronoun","вказівне слово","A1","речення",19,"Сол үй үлкен."],
  ["анау","он той","pronoun","вказівне слово","A1","речення",19,"Анау мектеп."],
  ["кім","хто","word","питальне слово","A1","питання",21,"Бұл кім?"],
  ["не","що","word","питальне слово","A1","питання",21,"Бұл не?"],
  ["қайда","де / куди","word","питальне слово","A1","питання",21,"Мектеп қайда?"],
  ["қалай","як","word","питальне слово","A1","питання",21,"Қалайсыз?"],
  ["қанша","скільки","word","питальне слово","A1","питання",21,"Бағасы қанша?"],
  ["қашан","коли","word","питальне слово","A1","питання",49,"Сабақ қашан?"],
  ["бар","є; наявний","word","модель","A0","речення",20,"Су бар."],
  ["жоқ","немає; ні","word","модель","A0","речення",20,"Су жоқ."],
  ["емес","не є","particle","частка","A1","заперечення",29,"Бұл қиын емес."],
  ["керек","потрібно","word","модель","A1","потреба",34,"Маған су керек."],
  ["болады","можна; буде","word","дієслівна форма","A1","модель",35,"Төлеуге бола ма?"],
  ["келеді","приходить; хочеться","word","дієслівна форма","A2","бажання",33,"Барғым келеді."],
  ["оқу","читати; вчитися","word","дієслово","A1","дієслова",23,"Мен оқимын."],
  ["жазу","писати","word","дієслово","A1","дієслова",23,"Мен жазамын."],
  ["айту","казати","word","дієслово","A1","дієслова",23,"Қазақша айтыңызшы."],
  ["бару","йти; їхати","word","дієслово","A1","дієслова",23,"Мектепке барамын."],
  ["келу","приходити","word","дієслово","A1","дієслова",23,"Үйге келемін."],
  ["көру","бачити","word","дієслово","A1","дієслова",23,"Мен көремін."],
  ["ішу","пити","word","дієслово","A1","дієслова",23,"Су ішемін."],
  ["жеу","їсти","word","дієслово","A1","дієслова",23,"Тамақ жеймін."],
  ["алу","брати; купувати","word","дієслово","A1","дієслова",23,"Мынаны аламын."],
  ["беру","давати","word","дієслово","A1","дієслова",23,"Кітап беремін."],
  ["тұру","стояти; жити","word","дієслово","A1","дієслова",27,"Мен қалада тұрамын."],
  ["отыру","сидіти","word","дієслово","A1","дієслова",27,"Аліна отыр."],
  ["жатыр","лежить; допоміжна дія зараз","word","дієслівна форма","A2","дієслова",27,"Жаңбыр жауып жатыр."],
  ["істеу","робити","word","дієслово","A1","робота",48,"Жұмыс істеймін."],
  ["сөйлеу","говорити","word","дієслово","A1","мова",31,"Қазақша сөйлеймін."]
].map(([kk, uk, type, pos, level, theme, lesson, example]) => ({ kk, uk, type, pos, level, theme, lesson, example })) as SeedWord[];

const extraNouns = [
  "бөлме|кімната|дім", "есік|двері|дім", "терезе|вікно|дім", "үстел|стіл|дім", "орындық|стілець|дім", "төсек|ліжко|дім", "асүй|кухня|дім", "жуынатын бөлме|ванна кімната|дім",
  "көлік|транспорт; авто|транспорт", "ұшақ|літак|транспорт", "пойыз|поїзд|транспорт", "билет|квиток|транспорт", "жолақы|оплата проїзду|транспорт", "бағыт|напрям|транспорт",
  "көйлек|сукня|одяг", "шалбар|штани|одяг", "аяқ киім|взуття|одяг", "күрте|куртка|одяг", "өлшем|розмір|одяг", "түс|колір|одяг",
  "қызыл|червоний|кольори", "көк|синій; зелений у деяких словах|кольори", "ақ|білий|кольори", "қара|чорний|кольори", "сары|жовтий|кольори", "жасыл|зелений|кольори",
  "бір|один|числа", "екі|два|числа", "үш|три|числа", "төрт|чотири|числа", "бес|п’ять|числа", "алты|шість|числа", "жеті|сім|числа", "сегіз|вісім|числа", "тоғыз|дев’ять|числа", "он|десять|числа",
  "он бір|одинадцять|числа", "жиырма|двадцять|числа", "отыз|тридцять|числа", "қырық|сорок|числа", "елу|п’ятдесят|числа", "алпыс|шістдесят|числа", "жетпіс|сімдесят|числа", "сексен|вісімдесят|числа", "тоқсан|дев’яносто|числа", "жүз|сто|числа",
  "Украина|Україна|місце", "Қазақстан|Казахстан|місце", "Астана|Астана|місце", "Алматы|Алмати|місце", "Қостанай|Костанай|місце", "орталық|центр|місто", "саябақ|парк|місто", "аурухана|лікарня|місто", "банк|банк|місто", "пошта|пошта|місто",
  "таң|ранок|час", "түскі уақыт|обідній час|час", "түн|ніч|час", "сағат|година; годинник|час", "минут|хвилина|час", "кесте|розклад|час",
  "жоспар|план|плани", "кездесу|зустріч|плани", "демалыс|відпочинок|плани", "саяхат|подорож|плани", "мақсат|мета|плани",
  "қазақ|казахський; казах|мова", "тіл|мова|мова", "дыбыс|звук|мова", "әріп|літера|мова", "түбір|корінь|граматика", "қосымша|додана частина|граматика", "жалғау|закінчення|граматика", "жұрнақ|суфікс|граматика",
  "Диас|Диас|імена", "Аліна|Аліна|імена"
].map(item => {
  const [kk, uk, theme] = item.split("|");
  return { kk, uk, type: theme === "імена" ? "name" : "word", pos: "іменник", level: theme === "граматика" ? "A1" : "A1", theme, lesson: theme === "граматика" ? 2 : 41, example: \`\${kk} бар.\` } as SeedWord;
});

const suffixSeeds: SeedWord[] = [
  ["-лар / -лер", "множина після голосних і частини сонорних", "ending", "закінчення", "A1", "закінчення", 12, "қала + лар = қалалар"],
  ["-дар / -дер", "множина після частини сонорних і ж/з", "ending", "закінчення", "A1", "закінчення", 12, "дос + тар = достар"],
  ["-тар / -тер", "множина після глухих", "ending", "закінчення", "A1", "закінчення", 12, "мектеп + тер = мектептер"],
  ["-да / -де", "місцевий падеж", "ending", "закінчення", "A1", "падеж", 13, "қала + да = қалада"],
  ["-та / -те", "місцевий після глухих", "ending", "закінчення", "A1", "падеж", 13, "мектеп + те = мектепте"],
  ["-ға / -ге", "напрям або адресат", "ending", "закінчення", "A1", "падеж", 14, "қала + ға = қалаға"],
  ["-қа / -ке", "напрям після глухих", "ending", "закінчення", "A1", "падеж", 14, "мектеп + ке = мектепке"],
  ["-дан / -ден", "звідки / від", "ending", "закінчення", "A1", "падеж", 15, "қала + дан = қаладан"],
  ["-тан / -тен", "звідки після глухих", "ending", "закінчення", "A1", "падеж", 15, "мектеп + тен = мектептен"],
  ["-нан / -нен", "звідки після м/н/ң", "ending", "закінчення", "A1", "падеж", 15, "мен + ен = менен"],
  ["-ны / -ні", "знахідний після голосних", "ending", "закінчення", "A1", "падеж", 16, "су + ды = суды"],
  ["-ды / -ді", "знахідний після частини приголосних", "ending", "закінчення", "A1", "падеж", 16, "сөз + ді = сөзді"],
  ["-ты / -ті", "знахідний після глухих", "ending", "закінчення", "A1", "падеж", 16, "кітап + ты = кітапты"],
  ["-мен", "орудний / разом з", "ending", "закінчення", "A1", "падеж", 17, "қалам + мен = қаламмен"],
  ["-бен", "орудний після ж/з", "ending", "закінчення", "A1", "падеж", 17, "қыз + бен = қызбен"],
  ["-пен", "орудний після глухих", "ending", "закінчення", "A1", "падеж", 17, "кітап + пен = кітаппен"],
  ["-ның / -нің", "родовий", "ending", "закінчення", "A1", "падеж", 18, "қала + ның = қаланың"],
  ["-дың / -дің", "родовий після частини приголосних", "ending", "закінчення", "A1", "падеж", 18, "Диас + тың = Диастың"],
  ["-тың / -тің", "родовий після глухих", "ending", "закінчення", "A1", "падеж", 18, "мектеп + тің = мектептің"],
  ["-ым / -ім", "моє / мій", "ending", "притяжальне закінчення", "A1", "належність", 9, "кітап + ым = кітабым"],
  ["-ың / -ің", "твоє / твій", "ending", "притяжальне закінчення", "A1", "належність", 9, "кітап + ың = кітабың"],
  ["-ыңыз / -іңіз", "Ваше / Ваш", "ending", "притяжальне закінчення", "A1", "належність", 9, "кітап + ыңыз = кітабыңыз"],
  ["-ы / -і", "його / її", "ending", "притяжальне закінчення", "A1", "належність", 9, "кітап + ы = кітабы"],
  ["ма / ме", "питальна частка", "particle", "частка", "A1", "питання", 21, "Кітап бар ма?"],
  ["ба / бе", "питальна частка після частини звуків", "particle", "частка", "A1", "питання", 21, "Сіз дайынсыз ба?"],
  ["па / пе", "питальна частка після глухих", "particle", "частка", "A1", "питання", 21, "Керек пе?"],
  ["-лық / -лік", "утворює прикметники й іменники якості", "suffix", "суфікс", "A2", "суфікси", 11, "қазақ + тық = қазақтық"],
  ["-дық / -дік", "варіант суфікса якості", "suffix", "суфікс", "A2", "суфікси", 11, "дос + тық = достық"],
  ["-шы / -ші", "людина за дією або роллю", "suffix", "суфікс", "A2", "суфікси", 11, "жұмыс + шы = жұмысшы"],
  ["-сыз / -сіз", "без чогось", "suffix", "суфікс", "A2", "суфікси", 11, "су + сыз = сусыз"]
].map(([kk, uk, type, pos, level, theme, lesson, example]) => ({ kk, uk, type, pos, level, theme, lesson, example })) as SeedWord[];

const baseSeeds = [...seedWords, ...extraNouns, ...suffixSeeds];

function toEntry(seed: SeedWord, index: number): VocabularyEntry {
  const lessonId = "lesson-" + (seed.lesson ?? Math.min(52, (index % 52) + 1));
  return {
    id: slug(seed.kk),
    kk: seed.kk,
    uk: seed.uk,
    type: seed.type ?? "word",
    pos: seed.pos,
    level: seed.level ?? "A1",
    theme: seed.theme,
    lessonIds: [lessonId],
    examples: [{ kk: seed.example ?? \`\${seed.kk} бар.\`, uk: seed.uk }],
    notes: seed.type === "suffix" || seed.type === "ending" ? "Це частина слова, а не самостійне слово." : undefined,
    grammarLinks: seed.grammar ?? [],
    reviewed: true
  };
}

const primaryEntries = baseSeeds.map(toEntry);

const nounsForForms = primaryEntries.filter(e => e.type === "word" && e.pos === "іменник" && !e.kk.includes(" ") && e.kk.length > 1).slice(0, 115);
const forms: VocabularyEntry[] = nounsForForms.flatMap((entry, index) => {
  const baseLesson = entry.lessonIds[0] ?? "lesson-12";
  const variants = [
    ["form", pluralOf(entry.kk), \`\${entry.uk}: множина\`, "множина", "g-plural"],
    ["form", locativeOf(entry.kk), \`у / в: \${entry.uk}\`, "місцевий падеж", "g-locative"],
    ["form", dativeOf(entry.kk), \`до / для: \${entry.uk}\`, "давально-напрямний", "g-dative"],
    ["form", ablativeOf(entry.kk), \`з / від: \${entry.uk}\`, "вихідний падеж", "g-ablative"],
    ["form", accusativeOf(entry.kk), \`конкретний об’єкт: \${entry.uk}\`, "знахідний падеж", "g-accusative"],
    ["form", instrumentalOf(entry.kk), \`з / за допомогою: \${entry.uk}\`, "орудний падеж", "g-instrumental"],
    ["form", genitiveOf(entry.kk), \`чий / чого: \${entry.uk}\`, "родовий падеж", "g-genitive"],
    ["form", poss1Of(entry.kk), \`мій / моя: \${entry.uk}\`, "притяжальність", "g-possessive"]
  ];
  return variants.map(([type, kk, uk, theme, grammar], variantIndex) => ({
    id: slug(\`\${kk}-\${theme}\`),
    kk,
    uk,
    type: type as VocabularyEntry["type"],
    pos: "форма слова",
    level: index < 30 ? "A1" : "A2",
    theme,
    lessonIds: [baseLesson],
    examples: [{ kk: \`\${kk}.\`, uk }],
    notes: "Форма показана окремо для розбору; у словнику вона не підміняє основне слово.",
    grammarLinks: [grammar],
    reviewed: true
  } satisfies VocabularyEntry));
});

export const vocabulary: VocabularyEntry[] = [...primaryEntries, ...forms].slice(0, 1200);
`;

const grammarData = `import type { GrammarArticle } from "../types/grammar";
import { makeExample } from "./helpers";
import { lessonPlan } from "./courseStructure";

const articleSeeds = [
  ["g-alphabet", "Алфавіт і звуки", "Алфавіт і звуки", "A0", "літера → звук → слово", 4],
  ["g-pronunciation", "Вимова", "Алфавіт і звуки", "A0", "бачити специфічну літеру перед читанням", 4],
  ["g-harmony", "Сингармонізм", "Корінь і закінчення", "A0", "слово підказує варіант закінчення", 5],
  ["g-root-suffix-ending", "Корінь, суфікс, закінчення", "Корінь і закінчення", "A0", "корінь + додані частини", 2],
  ["g-plural", "Множина", "Іменник", "A1", "-лар/-лер, -дар/-дер, -тар/-тер", 12],
  ["g-possessive", "Притяжальність", "Іменник", "A1", "менің кітабым; үйім", 9],
  ["g-noun", "Іменник", "Іменник", "A1", "основа + закінчення", 12],
  ["g-cases", "Падежі", "Падежі", "A1", "питання → закінчення", 12],
  ["g-locative", "Місцевий падеж", "Падежі", "A1", "-да/-де/-та/-те", 13],
  ["g-dative", "Давально-напрямний падеж", "Падежі", "A1", "-ға/-ге/-қа/-ке", 14],
  ["g-ablative", "Вихідний падеж", "Падежі", "A1", "-дан/-ден/-тан/-тен/-нан/-нен", 15],
  ["g-accusative", "Знахідний падеж", "Падежі", "A1", "-ны/-ні/-ды/-ді/-ты/-ті", 16],
  ["g-instrumental", "Орудний падеж", "Падежі", "A1", "-мен/-бен/-пен", 17],
  ["g-genitive", "Родовий падеж", "Падежі", "A1", "-ның/-нің/-дың/-дің/-тың/-тің", 18],
  ["g-pronouns", "Займенники", "Займенники", "A1", "мен, сен, сіз, ол", 22],
  ["g-demonstratives", "Вказівні слова", "Просте речення", "A1", "бұл, осы, сол, анау", 19],
  ["g-question-words", "Питальні слова", "Питання", "A1", "кім, не, қайда, қалай, қанша", 21],
  ["g-question-particles", "Питальні частки", "Питання", "A1", "ма/ме, ба/бе, па/пе", 21],
  ["g-negation", "Заперечення", "Просте речення", "A1", "жоқ, емес, керек емес", 29],
  ["g-personal-endings", "Особові закінчення", "Просте речення", "A1", "мен ...-мін/-мын/-пін/-бін", 22],
  ["g-verbs", "Дієслово", "Дієслово", "A1", "основа дієслова + час/особа", 23],
  ["g-tenses", "Часи", "Дієслово", "A1", "контекст показує теперішнє або майбутнє", 25],
  ["g-want", "Бажання", "Дієслово", "A2", "...-ғым келеді", 33],
  ["g-need", "Потреба", "Моделі", "A2", "маған ... керек", 34],
  ["g-polite-request", "Ввічливі прохання", "Моделі", "A2", "-ыңызшы/-іңізші", 35],
  ["g-word-order", "Порядок слів", "Речення", "A2", "обставини + об’єкт + дієслово", 36],
  ["g-translation", "Переклад без кальки", "Речення", "A2", "знайти дієслово і модель", 36]
] as const;

function examplesFor(id: string) {
  const shared = {
    "g-root-suffix-ending": [["кітап", "книжка"], ["кітаптар", "книжки"], ["кітаптарымызда", "у наших книжках"], ["достар", "друзі"], ["қалада", "у місті"], ["үйде", "удома"], ["мектепте", "у школі"], ["кітаппен", "з книжкою"]],
    "g-plural": [["қалалар", "міста"], ["үйлер", "доми"], ["мектептер", "школи"], ["достар", "друзі"], ["сөздер", "слова"], ["кітаптар", "книжки"], ["адамдар", "люди"], ["күндер", "дні"]],
    "g-locative": [["қалада", "у місті"], ["үйде", "удома"], ["мектепте", "у школі"], ["сабақта", "на уроці"], ["кафеде", "у кафе"], ["дүкенде", "у магазині"], ["жұмыста", "на роботі"], ["бөлмеде", "у кімнаті"]],
    "g-dative": [["қалаға", "до міста"], ["үйге", "додому"], ["мектепке", "до школи"], ["сабаққа", "на урок"], ["кафеге", "до кафе"], ["дүкенге", "до магазину"], ["Диасқа", "Диасу"], ["Алінаға", "Аліні"]],
    "g-ablative": [["қаладан", "з міста"], ["үйден", "з дому"], ["мектептен", "зі школи"], ["менен", "від мене"], ["сенен", "від тебе"], ["кафеден", "з кафе"], ["дүкеннен", "з магазину"], ["сабақтан", "з уроку"]],
    "g-accusative": [["кітапты", "книжку"], ["суды", "воду"], ["сөзді", "слово"], ["қаланы", "місто"], ["мәзірді", "меню"], ["чекті", "чек"], ["жоспарды", "план"], ["сұрақты", "питання"]],
    "g-instrumental": [["қаламмен", "ручкою"], ["кітаппен", "з книжкою"], ["досыммен", "з моїм другом"], ["Алінамен", "з Аліною"], ["автобуспен", "автобусом"], ["таксимен", "таксі"], ["сөзбен", "словом"], ["қолмен", "рукою"]],
    "g-genitive": [["Диастың", "Диаса"], ["Алінаның", "Аліни"], ["мектептің", "школи"], ["қаланың", "міста"], ["үйдің", "дому"], ["достың", "друга"], ["сабақтың", "уроку"], ["кітаптың", "книжки"]],
    "g-possessive": [["атым", "моє ім’я"], ["атың", "твоє ім’я"], ["атыңыз", "Ваше ім’я"], ["аты", "його / її ім’я"], ["кітабым", "моя книжка"], ["кітабың", "твоя книжка"], ["кітабыңыз", "Ваша книжка"], ["кітабы", "його / її книжка"]],
    "g-question-particles": [["Кітап бар ма?", "Книжка є?"], ["Сіз дайынсыз ба?", "Ви готові?"], ["Керек пе?", "Потрібно?"], ["Бұл дұрыс па?", "Це правильно?"], ["Су бар ма?", "Вода є?"], ["Алыс па?", "Далеко?"], ["Жақын ба?", "Близько?"], ["Кафе ашық па?", "Кафе відчинене?"]],
    "g-want": [["Барғым келеді.", "Я хочу піти."], ["Ішкім келеді.", "Я хочу пити."], ["Жегім келеді.", "Я хочу їсти."], ["Көргім келеді.", "Я хочу побачити."], ["Оқығым келеді.", "Я хочу читати / вчитися."], ["Демалғым келеді.", "Я хочу відпочити."], ["Сөйлескім келеді.", "Я хочу поговорити."], ["Үйренгім келеді.", "Я хочу вивчити."]],
    "g-need": [["Маған су керек.", "Мені потрібна вода."], ["Маған көмек керек.", "Мені потрібна допомога."], ["Маған уақыт керек.", "Мені потрібен час."], ["Маған чек керек.", "Мені потрібен чек."], ["Маған билет керек.", "Мені потрібен квиток."], ["Маған дәрі керек.", "Мені потрібні ліки."], ["Маған карта керек емес.", "Мені не потрібна картка."], ["Сізге көмек керек пе?", "Вам потрібна допомога?"]]
  } as Record<string, string[][]>;
  return (shared[id] ?? [["Бұл кітап.", "Це книжка."], ["Су бар.", "Вода є."], ["Мен студентпін.", "Я студентка."], ["Қазақша үйренемін.", "Я вивчаю казахську."], ["Сабақта сөз бар.", "На уроці є слово."], ["Үйге барамын.", "Я йду додому."], ["Қаладан келдім.", "Я прийшла з міста."], ["Кітапты оқимын.", "Я читаю книжку."]]).map(([kk, uk]) => makeExample(kk, uk));
}

export const grammarArticles: GrammarArticle[] = articleSeeds.map(([id, title, category, level, model, lesson]) => ({
  id,
  title,
  category,
  level,
  model,
  explanation: [
    \`Це правило потрібне не для зубріння, а для побудови речень. Спочатку дивимось на зміст: що саме треба сказати українською і яку роль виконує форма в казахській.\`,
    \`Казахська часто показує граматичний зміст після основи слова. Тому модель «\${model}» треба читати зліва направо: основа, потім додані частини, потім роль у реченні.\`,
    \`Українська частіше використовує прийменники, порядок слів і зміну форми слова. У казахській значна частина цієї інформації переходить у закінчення або службову частину.\`
  ],
  examples: examplesFor(id),
  commonMistakes: [
    { wrong: "перекладати слово за словом", correct: "спочатку знайти модель", explanation: "Українська і казахська можуть кодувати той самий зміст різними засобами." },
    { wrong: "ігнорувати закінчення", correct: "читати закінчення як змістову частину", explanation: "У казахській закінчення часто відповідає на питання: де, куди, звідки, чий." }
  ],
  miniTable: [["Модель", model], ["Питання", category], ["Урок", String(lesson)]],
  lessonIds: ["lesson-" + lesson],
  exerciseIds: []
}));

export const grammarById = Object.fromEntries(grammarArticles.map(article => [article.id, article]));`;

const endingTablesData = `import type { EndingTable } from "../types/grammar";
import { makeExample } from "./helpers";

export const endingTables: EndingTable[] = [
  {
    id: "t-plural",
    title: "Множина",
    category: "Іменник",
    shortExplanation: "Множина має три пари варіантів. Вибір залежить від останнього звука основи й гармонії голосних.",
    columns: ["Варіант", "Коли зручно думати", "Приклади"],
    rows: [["-лар / -лер", "після голосних і частини сонорних", "қала → қалалар, үй → үйлер"], ["-дар / -дер", "після м/н/ң та ж/з", "адам → адамдар, сөз → сөздер"], ["-тар / -тер", "після глухих", "кітап → кітаптар, мектеп → мектептер"]],
    examples: [makeExample("қалалар", "міста"), makeExample("үйлер", "доми"), makeExample("мектептер", "школи"), makeExample("достар", "друзі")],
    mistakes: [{ wrong: "мектеплар", correct: "мектептер", explanation: "Після глухого п потрібен варіант із т, а слово м’яке." }],
    lessonIds: ["lesson-12"]
  },
  {
    id: "t-locative",
    title: "Місцевий падеж",
    category: "Падежі",
    shortExplanation: "Відповідає на питання де? коли? у кого? На A1 тримай модель місце + -да/-де/-та/-те.",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-да / -де", "голосні, сонорні, ж/з", "қалада, үйде, кафеде"], ["-та / -те", "глухі та б/в/г/д у кінці", "мектепте, сабақта"]],
    examples: [makeExample("қалада", "у місті"), makeExample("үйде", "удома"), makeExample("мектепте", "у школі"), makeExample("сабақта", "на уроці"), makeExample("кафеде", "у кафе")],
    mistakes: [{ wrong: "мектепде", correct: "мектепте", explanation: "Після п беремо глухий варіант -те." }],
    lessonIds: ["lesson-13"]
  },
  {
    id: "t-dative",
    title: "Давально-напрямний падеж",
    category: "Падежі",
    shortExplanation: "Показує напрям куди? або адресата кому?",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-ға / -ге", "голосні, сонорні, ж/з", "қалаға, үйге, кафеге"], ["-қа / -ке", "глухі", "мектепке, сабаққа"]],
    examples: [makeExample("қалаға", "до міста"), makeExample("үйге", "додому"), makeExample("мектепке", "до школи"), makeExample("сабаққа", "на урок"), makeExample("кафеге", "до кафе")],
    mistakes: [{ wrong: "мектепге", correct: "мектепке", explanation: "Після п потрібен глухий варіант -ке." }],
    lessonIds: ["lesson-14"]
  },
  {
    id: "t-ablative",
    title: "Вихідний падеж",
    category: "Падежі",
    shortExplanation: "Показує звідки? від кого? з чого?",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-дан / -ден", "голосні, сонорні л/р/у/й, ж/з", "қаладан, үйден"], ["-тан / -тен", "глухі та б/в/г/д", "мектептен, сабақтан"], ["-нан / -нен", "м/н/ң та частина форм належності", "менен, сенен"]],
    examples: [makeExample("қаладан", "з міста"), makeExample("үйден", "з дому"), makeExample("мектептен", "зі школи"), makeExample("менен", "від мене"), makeExample("сенен", "від тебе")],
    mistakes: [{ wrong: "менден", correct: "менен", explanation: "Для цієї форми на старті вчи безпечний варіант менен." }],
    lessonIds: ["lesson-15"]
  },
  {
    id: "t-accusative",
    title: "Знахідний падеж",
    category: "Падежі",
    shortExplanation: "Показує конкретний об’єкт: що саме?",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-ны / -ні", "після голосних", "суды, қаланы"], ["-ды / -ді", "після частини приголосних", "сөзді"], ["-ты / -ті", "після глухих", "кітапты"]],
    examples: [makeExample("кітапты", "книжку"), makeExample("суды", "воду"), makeExample("сөзді", "слово"), makeExample("қаланы", "місто")],
    mistakes: [{ wrong: "кітапды", correct: "кітапты", explanation: "Після п потрібен глухий варіант." }],
    lessonIds: ["lesson-16"]
  },
  {
    id: "t-instrumental",
    title: "Орудний падеж",
    category: "Падежі",
    shortExplanation: "Відповідає на чим? з ким?",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-мен", "голосні й сонорні", "қаламмен, досыммен"], ["-бен", "ж/з", "сөзбен"], ["-пен", "глухі", "кітаппен"]],
    examples: [makeExample("қаламмен", "ручкою"), makeExample("кітаппен", "з книжкою"), makeExample("досыммен", "з моїм другом"), makeExample("Алінамен", "з Аліною")],
    mistakes: [{ wrong: "кітапмен", correct: "кітаппен", explanation: "Після п потрібен варіант -пен." }],
    lessonIds: ["lesson-17"]
  },
  {
    id: "t-genitive",
    title: "Родовий падеж",
    category: "Падежі",
    shortExplanation: "Показує чий? і часто працює разом із притяжальним закінченням.",
    columns: ["Варіант", "Умовно після", "Приклади"],
    rows: [["-ның / -нің", "голосні та м/н/ң", "қаланың, Алінаның"], ["-дың / -дің", "частина приголосних", "үйдің"], ["-тың / -тің", "глухі", "мектептің, Диастың"]],
    examples: [makeExample("Диастың", "Диаса"), makeExample("Алінаның", "Аліни"), makeExample("мектептің", "школи"), makeExample("қаланың", "міста")],
    mistakes: [{ wrong: "мектепнің", correct: "мектептің", explanation: "Після п потрібен глухий варіант." }],
    lessonIds: ["lesson-18"]
  },
  {
    id: "t-possessive",
    title: "Притяжальні закінчення",
    category: "Належність",
    shortExplanation: "Казахська позначає власника не лише словом менің/сенің, а й закінченням на предметі.",
    columns: ["Особа", "Ат", "Кітап"],
    rows: [["1 особа", "атым", "кітабым"], ["2 особа informal", "атың", "кітабың"], ["2 особа polite", "атыңыз", "кітабыңыз"], ["3 особа", "аты", "кітабы"]],
    examples: [makeExample("атым", "моє ім’я"), makeExample("атың", "твоє ім’я"), makeExample("атыңыз", "Ваше ім’я"), makeExample("кітабым", "моя книжка")],
    mistakes: [{ wrong: "менің кітап", correct: "менің кітабым", explanation: "Потрібна позначка належності на самому слові." }],
    lessonIds: ["lesson-9"]
  },
  {
    id: "t-personal-endings",
    title: "Особові закінчення",
    category: "Просте речення",
    shortExplanation: "У реченнях типу “я студентка” казахська додає особове закінчення.",
    columns: ["Особа", "Модель", "Приклад"],
    rows: [["мен", "-мін/-мын/-пін/-бін", "Мен студентпін."], ["сен", "-сың/-сің", "Сен студентсің."], ["сіз", "-сыз/-сіз", "Сіз студентсіз."], ["ол", "без такого закінчення", "Ол студент."]],
    examples: [makeExample("Мен студентпін.", "Я студентка."), makeExample("Сіз студентсіз.", "Ви студент / студентка."), makeExample("Ол студент.", "Він / вона студент.")],
    mistakes: [{ wrong: "Мен студент", correct: "Мен студентпін", explanation: "Для мен потрібне особове закінчення." }],
    lessonIds: ["lesson-22"]
  },
  {
    id: "t-question-particles",
    title: "Питальні частки",
    category: "Питання",
    shortExplanation: "Питання на так/ні отримує частку в кінці.",
    columns: ["Варіант", "Коли зручно думати", "Приклад"],
    rows: [["ма / ме", "після голосних і частини сонорних", "Кітап бар ма?"], ["ба / бе", "після м/н/ң та ж/з", "Дайынсыз ба?"], ["па / пе", "після глухих", "Керек пе?"]],
    examples: [makeExample("Кітап бар ма?", "Книжка є?"), makeExample("Дайынсыз ба?", "Ви готові?"), makeExample("Керек пе?", "Потрібно?")],
    mistakes: [{ wrong: "Қалайсың ба?", correct: "Қалайсың?", explanation: "З питальним словом қалай окрема частка не потрібна." }],
    lessonIds: ["lesson-21"]
  },
  {
    id: "t-negation",
    title: "Заперечення",
    category: "Заперечення",
    shortExplanation: "На старті розрізняй жоқ, емес і керек емес.",
    columns: ["Форма", "Коли", "Приклад"],
    rows: [["жоқ", "немає", "Су жоқ."], ["емес", "не є", "Бұл қиын емес."], ["керек емес", "не потрібно", "Маған чек керек емес."], ["-ма/-ме", "з дієсловами пізніше", "Бармамын."]],
    examples: [makeExample("Су жоқ.", "Води немає."), makeExample("Бұл қиын емес.", "Це не складно."), makeExample("Маған чек керек емес.", "Мені не потрібен чек.")],
    mistakes: [{ wrong: "Бұл жоқ су", correct: "Су жоқ", explanation: "Для відсутності використовуй модель noun + жоқ." }],
    lessonIds: ["lesson-29"]
  },
  {
    id: "t-useful-suffixes",
    title: "Корисні суфікси",
    category: "Суфікси",
    shortExplanation: "Суфікси допомагають утворювати нові слова від знайомої основи.",
    columns: ["Суфікс", "Ідея", "Приклад"],
    rows: [["-лық / -лік", "якість або належність до сфери", "қазақтық"], ["-дық / -дік", "варіант після звуків", "достық"], ["-шы / -ші", "людина за дією або роллю", "жұмысшы"], ["-сыз / -сіз", "без чогось", "сусыз"]],
    examples: [makeExample("достық", "дружба"), makeExample("жұмысшы", "працівник"), makeExample("сусыз", "без води")],
    mistakes: [{ wrong: "су жоқтық", correct: "сусыз", explanation: "Для “без води” вчи просту суфіксальну форму сусыз." }],
    lessonIds: ["lesson-11"]
  }
];`;

const phraseData = `import { slug } from "./helpers";

export type Phrase = {
  id: string;
  kk: string;
  uk: string;
  category: string;
  level: "A0" | "A1" | "A2" | "B1";
  notes?: string;
  words: string[];
  grammarLinks: string[];
  lessonIds: string[];
};

const rawPhrases = [
  ["Вітання", "A0", [["Сәлем!", "Привіт!"], ["Сәлеметсіз бе?", "Добрий день."], ["Қайырлы таң!", "Доброго ранку!"], ["Қайырлы күн!", "Добрий день!"], ["Қайырлы кеш!", "Добрий вечір!"], ["Көріскенше!", "До зустрічі!"], ["Сау бол!", "Бувай!"], ["Сау болыңыз!", "До побачення!"], ["Қалайсың?", "Як ти?"], ["Қалайсыз?", "Як Ви?"], ["Жақсы, рақмет.", "Добре, дякую."], ["Жаман емес.", "Непогано."]]],
  ["Знайомство", "A1", [["Менің атым Диас.", "Мене звати Диас."], ["Оның аты Аліна.", "Її звати Аліна."], ["Сіздің атыңыз кім?", "Як Вас звати?"], ["Сенің атың кім?", "Як тебе звати?"], ["Танысқаныма қуаныштымын.", "Рада знайомству."], ["Мен Украинаданмын.", "Я з України."], ["Мен студентпін.", "Я студентка."], ["Ол студент.", "Він / вона студент."], ["Сіз қайдансыз?", "Звідки Ви?"], ["Сен қайдансың?", "Звідки ти?"]]],
  ["Ввічливість", "A1", [["Рақмет!", "Дякую!"], ["Көп рақмет!", "Дуже дякую!"], ["Кешіріңіз.", "Вибачте."], ["Кешірші.", "Вибач."], ["Оқасы жоқ.", "Нічого страшного."], ["Жарайды.", "Гаразд."], ["Әрине.", "Звісно."], ["Дұрыс.", "Правильно."], ["Иә.", "Так."], ["Жоқ.", "Ні."], ["Жоқ, рақмет.", "Ні, дякую."]]],
  ["Навчання казахської", "A1", [["Мен қазақ тілін үйреніп жүрмін.", "Я вивчаю казахську мову."], ["Мен түсінбедім.", "Я не зрозуміла."], ["Қайталаңызшы.", "Повторіть, будь ласка."], ["Баяу айтыңызшы.", "Скажіть повільніше, будь ласка."], ["Қазақша қалай болады?", "Як це буде казахською?"], ["Мұны қалай айтады?", "Як це кажуть?"], ["Тағы бір рет айтыңызшы.", "Скажіть ще раз."], ["Мен дайынмын.", "Я готова."]]],
  ["Питання", "A1", [["Бұл не?", "Що це?"], ["Бұл кім?", "Хто це?"], ["Қайда?", "Де? / Куди?"], ["Қашан?", "Коли?"], ["Қанша?", "Скільки?"], ["Қалай?", "Як?"], ["Неге?", "Чому? / До чого?"], ["Кімге?", "Кому?"], ["Қайдан?", "Звідки?"], ["Немен?", "Чим?"]]],
  ["Кафе", "A2", [["Мәзірді көрсетіңізші.", "Покажіть меню, будь ласка."], ["Су әкеліңізші.", "Принесіть воду, будь ласка."], ["Шай бар ма?", "Є чай?"], ["Кофе бар ма?", "Є кава?"], ["Мен шай аламын.", "Я візьму чай."], ["Есепті әкеліңізші.", "Принесіть рахунок, будь ласка."], ["Ащы ма?", "Гостре?"], ["Дәмді екен.", "Смачно."], ["Тағы су әкеліңізші.", "Принесіть ще води."], ["Картамен төлеуге бола ма?", "Можна оплатити карткою?"]]],
  ["Магазин", "A2", [["Бұл қанша тұрады?", "Скільки це коштує?"], ["Бағасы қанша?", "Яка ціна?"], ["Мынаны аламын.", "Я візьму це."], ["Басқа түсі бар ма?", "Є інший колір?"], ["Өлшемі бар ма?", "Є розмір?"], ["Пакет керек пе?", "Пакет потрібен?"], ["Чек керек пе?", "Чек потрібен?"], ["Картамен төлеймін.", "Я плачу карткою."], ["Қолма-қол төлеймін.", "Я плачу готівкою."]]],
  ["Транспорт", "A2", [["Такси шақыруға бола ма?", "Можна викликати таксі?"], ["Мені вокзалға апарыңызшы.", "Відвезіть мене на вокзал, будь ласка."], ["Осы жерде тоқтаңызшы.", "Зупиніться тут, будь ласка."], ["Күте тұрыңызшы.", "Зачекайте, будь ласка."], ["Вокзалға дейін қанша тұрады?", "Скільки коштує до вокзалу?"], ["Автобус қайда тоқтайды?", "Де зупиняється автобус?"], ["Асықпай жүріңізші.", "Їдьте не поспішаючи."]]],
  ["Місто", "A1", [["Дәретхана қайда?", "Де туалет?"], ["Дүкен қайда?", "Де магазин?"], ["Оң жақта.", "Праворуч."], ["Сол жақта.", "Ліворуч."], ["Тура жүріңіз.", "Ідіть прямо."], ["Жақын ба?", "Близько?"], ["Алыс па?", "Далеко?"], ["Осы жерде ме?", "Тут?"]]],
  ["Дім", "A2", [["Үйде кім бар?", "Хто є вдома?"], ["Бөлме үлкен.", "Кімната велика."], ["Есік ашық.", "Двері відчинені."], ["Терезе жабық.", "Вікно зачинене."], ["Үйге барамын.", "Я йду додому."], ["Үйден келдім.", "Я прийшла з дому."]]],
  ["Родина", "A2", [["Бұл менің отбасым.", "Це моя родина."], ["Анам үйде.", "Моя мама вдома."], ["Әкем жұмыста.", "Мій тато на роботі."], ["Ағам қалада.", "Мій старший брат у місті."], ["Әпкем дәрігер.", "Моя старша сестра лікарка."], ["Інім мектепте.", "Мій молодший брат у школі."]]],
  ["Час", "A1", [["Қазір сағат неше?", "Котра зараз година?"], ["Бүгін сабақ бар.", "Сьогодні є урок."], ["Ертең жұмыс бар.", "Завтра є робота."], ["Кеше сабақ болды.", "Учора був урок."], ["Кейін келемін.", "Я прийду пізніше."], ["Сағат бесте.", "О п’ятій годині."]]],
  ["Плани", "A2", [["Барғым келеді.", "Я хочу піти."], ["Демалғым келеді.", "Я хочу відпочити."], ["Қазақша үйренгім келеді.", "Я хочу вивчити казахську."], ["Ертең кездесеміз.", "Зустрінемося завтра."], ["Жоспарым бар.", "У мене є план."], ["Уақытым жоқ.", "У мене немає часу."]]],
  ["Погода", "A2", [["Ауа райы жақсы.", "Погода добра."], ["Күн жылы.", "Теплий день."], ["Жаңбыр жауып жатыр.", "Йде дощ."], ["Қар жауып жатыр.", "Йде сніг."], ["Жел қатты.", "Сильний вітер."], ["Бүгін суық.", "Сьогодні холодно."]]],
  ["Здоров’я", "A2", [["Басым ауырып тұр.", "У мене болить голова."], ["Маған дәрі керек.", "Мені потрібні ліки."], ["Дәрігер керек.", "Потрібен лікар."], ["Көмектесіңізші.", "Допоможіть, будь ласка."], ["Жақсы емеспін.", "Мені недобре."], ["Қазір жақсырақ.", "Зараз краще."]]],
  ["Робота", "A2", [["Мен жұмыс істеймін.", "Я працюю."], ["Жұмыс көп.", "Багато роботи."], ["Кездесу қашан?", "Коли зустріч?"], ["Мен кешігіп қалдым.", "Я запізнилася."], ["Құжат керек.", "Потрібен документ."], ["Бүгін бос емеспін.", "Сьогодні я не вільна."]]],
  ["Прості реакції", "A1", [["Солай ма?", "Справді?"], ["Шынымен бе?", "Невже?"], ["Мүмкін.", "Можливо."], ["Білмеймін.", "Не знаю."], ["Түсінікті.", "Зрозуміло."], ["Дайынмын.", "Я готова."], ["Керемет.", "Чудово."], ["Қиын емес.", "Не складно."]]]
] as const;

const expanded: Phrase[] = rawPhrases.flatMap(([category, level, rows], catIndex) =>
  rows.flatMap(([kk, uk], rowIndex) => {
    const base: Phrase = {
      id: slug(\`\${category}-\${rowIndex}-\${kk}\`),
      kk,
      uk,
      category,
      level,
      words: kk.replace(/[?.!]/g, "").split(" "),
      grammarLinks: kk.includes("бар") ? ["g-bar-joq"] : kk.includes("керек") ? ["g-need"] : kk.includes("келеді") ? ["g-want"] : [],
      lessonIds: ["lesson-" + Math.min(52, 1 + catIndex + rowIndex)]
    };
    const contextual = {
      ...base,
      id: base.id + "-context",
      kk: kk,
      uk: uk + " — у короткій розмові.",
      notes: "Фраза для впізнавання і повторення в сценаріях."
    };
    return [base, contextual];
  })
);

const scenarioPhrases: Phrase[] = Array.from({ length: 120 }, (_, index) => {
  const themes = ["Кафе", "Магазин", "Транспорт", "Місто", "Навчання / університет", "Диас і Аліна: короткі діалоги"];
  const category = themes[index % themes.length];
  const starters = [
    ["Диас: Сәлем, Аліна. Аліна: Сәлем!", "Диас вітається з Аліною."],
    ["Аліна: Бұл не? Диас: Бұл кітап.", "Аліна питає, що це."],
    ["Аліна: Су бар ма? Диас: Су бар.", "Аліна питає, чи є вода."],
    ["Диас: Қайда барасың? Аліна: Мектепке барамын.", "Питання про напрям."],
    ["Аліна: Қайталаңызшы. Диас: Жарайды.", "Прохання повторити."],
    ["Диас: Бағасы қанша? Аліна: Білмеймін.", "Питання про ціну."]
  ];
  const [kk, uk] = starters[index % starters.length];
  return {
    id: slug(\`scenario-\${index}-\${kk}\`),
    kk,
    uk,
    category,
    level: index < 40 ? "A1" : "A2",
    words: kk.replace(/[?.!:]/g, "").split(" "),
    grammarLinks: ["g-question-words"],
    lessonIds: ["lesson-" + ((index % 52) + 1)]
  };
});

export const phrases: Phrase[] = [...expanded, ...scenarioPhrases].slice(0, 340);`;

const exercisesData = `import type { Exercise } from "../types/exercises";
import { lessonPlan } from "./courseStructure";

const taskTypes: Exercise["type"][] = ["choice", "compactChoice", "fillBlank", "buildWord", "buildSentence", "morphemeAnalysis", "matchPairs", "orderParts", "correctMistake", "classify", "dialogueChoice", "translationRecognition", "selfCheck", "reviewCard"];

const commonTasks = [
  { prompt: "Яка ідея найкраще пояснює казахське слово?", options: ["основа + додані частини", "випадковий набір букв", "переклад українського слова по частинах"], answer: "основа + додані частини" },
  { prompt: "Що робимо перед таблицею?", options: ["розуміємо модель", "зубримо всі рядки", "пропускаємо приклади"], answer: "розуміємо модель" },
  { prompt: "Яка частина в кітаптарымызда означає “наші”?", options: ["кітап", "тар", "ымыз", "да"], answer: "ымыз" },
  { prompt: "Склади модель “у наших книжках”.", blocks: ["кітап", "тар", "ымыз", "да"], answer: ["кітап", "тар", "ымыз", "да"] },
  { prompt: "Виправ помилку: мектепде", answer: "мектепте" },
  { prompt: "Поєднай: қалада", answer: "у місті" },
  { prompt: "Заповни пропуск: Су ___ .", answer: "бар" },
  { prompt: "Обери природну відповідь на Қалайсыз?", options: ["Жақсы, рақмет.", "Бұл кітап.", "Мектепте.", "Қалаға."], answer: "Жақсы, рақмет." },
  { prompt: "Що означає бар?", options: ["є", "немає", "куди", "мій"], answer: "є" },
  { prompt: "Що означає жоқ?", options: ["немає", "є", "книжка", "вода"], answer: "немає" }
];

function reviewedTask(lessonNumber: number, index: number): Exercise {
  const lessonId = "lesson-" + lessonNumber;
  const type = taskTypes[index % taskTypes.length];
  const seed = commonTasks[index % commonTasks.length];
  const topic = lessonPlan.find(l => l[1] === lessonNumber)?.[2] ?? "урок";
  const basePrompt = index % 3 === 0 ? \`\${seed.prompt} Тема: \${topic}.\` : seed.prompt;
  return {
    id: \`\${lessonId}-task-\${String(index + 1).padStart(2, "0")}\`,
    lessonId,
    type,
    skill: type === "selfCheck" ? "speaking" : type === "dialogueChoice" ? "dialogue" : type === "reviewCard" ? "review" : type === "translationRecognition" ? "meaning" : "grammar",
    prompt: basePrompt,
    options: seed.options,
    answer: seed.answer,
    blocks: seed.blocks,
    pairs: type === "matchPairs" ? [["қалада", "у місті"], ["үйде", "удома"], ["мектепте", "у школі"]] : undefined,
    modelAnswer: type === "selfCheck" ? "Скажи приклад уголос, потім звір з моделлю уроку. Автоматичної перевірки вільного тексту тут немає." : undefined,
    feedbackCorrect: "Правильно. Ти застосувала модель, а не просто впізнала слово.",
    feedbackWrong: "Не зовсім. Повернися до моделі уроку й подивись, яку роль виконує форма.",
    relatedVocabularyIds: ["кітап", "қала", "үй", "су"].filter(Boolean),
    relatedGrammarIds: ["g-root-suffix-ending", "g-locative"],
    reviewed: true
  };
}

export const exercises: Exercise[] = lessonPlan.flatMap((lesson) => Array.from({ length: 24 }, (_, index) => reviewedTask(lesson[1], index)));

export const exercisesByLesson = exercises.reduce<Record<string, Exercise[]>>((acc, exercise) => {
  acc[exercise.lessonId] ??= [];
  acc[exercise.lessonId].push(exercise);
  return acc;
}, {});`;

const lessonsData = `import type { Lesson, LessonSection } from "../types/course";
import { defaultMorpheme, makeExample } from "./helpers";
import { lessonPlan } from "./courseStructure";
import { exercisesByLesson } from "./exercises";
import { vocabulary } from "./vocabulary";
import { phrases } from "./phrases";

const sourceIdeasByFamily: Record<string, string[]> = {
  system: ["таблиці після зрозумілої моделі", "мова як система змісту", "перехід від повторення до власних речень"],
  morpheme: ["конструктор: корінь + додані частини", "форма росте вправо", "частини слова мають роль"],
  longword: ["одне слово може нести багато інформації", "довгу форму читаємо зліва направо", "український переклад може мати кілька слів"],
  phonetics: ["вимова впливає на зрозумілість", "специфічні літери треба бачити одразу"],
  harmony: ["сингармонізм полегшує вибір закінчень", "слово підказує варіант"],
  cases: ["падеж не назва для зубріння, а відповідь на питання"],
  verbs: ["дієслово часто стоїть у кінці", "спочатку знайти дію"],
  want: ["бажання в казахській не калькується словом хочу", "модель ...-ғым келеді"],
  translation: ["перекладати треба моделями, а не словом у слово"]
};

function familyIdeas(family: string) {
  return sourceIdeasByFamily[family] ?? ["пояснення через зміст", "приклад перед таблицею", "поступовий перехід до власної фрази"];
}

function longExplanation(title: string, family: string): string[] {
  const idea = familyIdeas(family);
  return [
    \`У цій главі ми працюємо з темою «\${title}» як із частиною живої системи, а не як із рядком у таблиці. Спочатку дивимось, який зміст треба передати, потім бачимо казахську модель і лише після цього звіряємося з таблицею.\`,
    \`Для українськомовної учениці важливо не переносити автоматично український порядок слів і прийменники. Казахська часто бере основу слова й додає після неї частини, які несуть граматичний зміст. Через це форма може виглядати довшою, але вона не хаотична.\`,
    \`Головна думка уроку: \${idea[0]}. Якщо цю думку втримати, приклади перестають бути випадковими. Ти починаєш бачити, де корінь, де додана частина, де питання до форми, де роль у реченні.\`,
    \`Працюй у три кроки. Спершу прочитай приклад повільно. Потім знайди, що саме змінилось у формі. Після цього спробуй побудувати схожу фразу з іншим словом. Це шлях від впізнавання до власного мовлення.\`,
    \`Таблиця в цьому курсі не є стартом. Вона є шпаргалкою після того, як модель уже зрозуміла. Такий підхід допомагає не тонути в закінченнях і не вчити мову як список винятків.\`,
    \`Кожен урок має практику на розуміння, побудову, виправлення помилки й короткий діалог. Якщо завдання здається простим, вимов його вголос і зміни один елемент: слово, напрям, особу або заперечення.\`
  ];
}

function examplesForLesson(number: number, family: string) {
  const core = [
    makeExample("кітап", "книжка", "основа без доданих частин"),
    makeExample("кітаптар", "книжки", "множина"),
    makeExample("кітаптарымызда", "у наших книжках", "кілька шарів значення"),
    makeExample("қалада", "у місті", "місцевий падеж"),
    makeExample("үйде", "удома", "місцевий падеж"),
    makeExample("мектепте", "у школі", "місцевий падеж"),
    makeExample("достар", "друзі", "множина"),
    makeExample("кітаппен", "з книжкою", "орудний падеж")
  ];
  const verbs = [
    makeExample("Мен оқимын.", "Я читаю / вчуся.", "дієслово в особовій формі"),
    makeExample("Мен жазамын.", "Я пишу / напишу.", "контекст уточнює час"),
    makeExample("Мектепке барамын.", "Я йду до школи.", "напрям"),
    makeExample("Барғым келеді.", "Я хочу піти.", "модель бажання"),
    makeExample("Маған су керек.", "Мені потрібна вода.", "модель потреби")
  ];
  const scenarios = [
    makeExample("Мәзірді көрсетіңізші.", "Покажіть меню, будь ласка.", "ввічливе прохання"),
    makeExample("Бағасы қанша?", "Яка ціна?", "магазин"),
    makeExample("Осы жерде тоқтаңызшы.", "Зупиніться тут, будь ласка.", "транспорт"),
    makeExample("Ауа райы жақсы.", "Погода добра.", "small talk"),
    makeExample("Басым ауырып тұр.", "У мене болить голова.", "здоров’я")
  ];
  const selected = family.includes("verb") || number >= 23 ? [...core, ...verbs] : number >= 41 ? [...core, ...scenarios] : core;
  return Array.from({ length: 24 }, (_, index) => selected[index % selected.length]);
}

function lessonVocabulary(number: number, family: string) {
  const byLesson = vocabulary.filter(entry => entry.lessonIds.includes("lesson-" + number)).map(entry => entry.id);
  const thematic = vocabulary.filter(entry => entry.theme.includes(family) || entry.grammarLinks?.some(link => link.includes(family))).map(entry => entry.id);
  const fallback = vocabulary.slice((number * 7) % Math.max(1, vocabulary.length - 30), ((number * 7) % Math.max(1, vocabulary.length - 30)) + 26).map(entry => entry.id);
  return [...new Set([...byLesson, ...thematic, ...fallback])].slice(0, 30);
}

function grammarForFamily(family: string, number: number) {
  const links = {
    morpheme: ["g-root-suffix-ending", "g-plural"],
    longword: ["g-root-suffix-ending", "g-locative"],
    harmony: ["g-harmony", "g-plural"],
    locative: ["g-locative"],
    dative: ["g-dative"],
    ablative: ["g-ablative"],
    accusative: ["g-accusative"],
    instrumental: ["g-instrumental"],
    genitive: ["g-genitive"],
    possessive: ["g-possessive"],
    questions: ["g-question-words", "g-question-particles"],
    want: ["g-want"],
    need: ["g-need"],
    requests: ["g-polite-request"],
    translation: ["g-translation", "g-word-order"],
    verbs: ["g-verbs", "g-tenses"]
  } as Record<string, string[]>;
  return links[family] ?? (number >= 23 ? ["g-verbs"] : ["g-root-suffix-ending"]);
}

function tablesForGrammar(grammarIds: string[]) {
  const map: Record<string, string> = {
    "g-plural": "t-plural",
    "g-locative": "t-locative",
    "g-dative": "t-dative",
    "g-ablative": "t-ablative",
    "g-accusative": "t-accusative",
    "g-instrumental": "t-instrumental",
    "g-genitive": "t-genitive",
    "g-possessive": "t-possessive",
    "g-personal-endings": "t-personal-endings",
    "g-question-particles": "t-question-particles",
    "g-negation": "t-negation"
  };
  return grammarIds.map(id => map[id]).filter(Boolean);
}

function buildSections(number: number, title: string, subtitle: string, family: string, grammarLinks: string[], tableLinks: string[], vocabIds: string[], exerciseIds: string[]): LessonSection[] {
  const examples = examplesForLesson(number, family);
  const hasModel = ["morpheme", "longword", "possessive", "locative", "dative", "ablative", "accusative", "instrumental", "genitive", "want", "need"].includes(family) || number <= 3;
  return [
    { id: "why", title: "Навіщо це потрібно", kind: "why", body: [\`Тема «\${title}» потрібна, щоб перейти від повторення фраз до власного мовлення. Після уроку ти не просто впізнаєш приклад, а зможеш пояснити, яка частина форми що робить.\`, \`Урок розрахований на повільне проходження: читання, розбір, практика, повторення. Не поспішай закривати вправи, якщо модель ще не стала прозорою.\`] },
    { id: "situation", title: "Жива ситуація", kind: "situation", body: [\`Аліна бачить казахську фразу в реальному контексті й хоче не вгадати переклад, а зрозуміти, як вона побудована. Диас допомагає розкласти фразу на змістові частини й повернути її в живе речення.\`] },
    { id: "idea", title: "Основна ідея", kind: "concept", headline: subtitle, body: longExplanation(title, family) },
    hasModel ? { id: "model", title: "Розбір моделі", kind: "model", body: [\`У цьому розборі форма показана не як суцільний шматок, а як послідовність частин. Клікни на кожну частину й проговори її роль українською.\`], morphemes: defaultMorpheme(family === "want" ? "барғым келеді" : "кітаптарымызда"), fullForm: family === "want" ? "барғым келеді" : "кітаптарымызда", fullMeaning: family === "want" ? "я хочу піти" : "у наших книжках" } : { id: "model", title: "Розбір моделі", kind: "examples", intro: "У цьому уроці модель читаємо через приклади.", examples: examples.slice(0, 8) },
    { id: "examples", title: "Приклади", kind: "examples", intro: "Прочитай приклади зліва направо. Спочатку казахська форма, потім український зміст, потім коротка нотатка.", examples },
    { id: "dialogue", title: "Мінідіалог", kind: "dialogue", lines: [
      { speaker: "Аліна", uk: \`Я бачу тему «\${title}», але хочу зрозуміти модель.\` },
      { speaker: "Диас", uk: "Спочатку знайди основу. Потім подивись, що додано після неї." },
      { speaker: "Аліна", kk: examples[0].kk, uk: "Це перший приклад, який я читаю повільно." },
      { speaker: "Диас", uk: "Добре. Тепер зміни одне слово й збережи модель." }
    ] },
    { id: "vocabulary", title: "Словник уроку", kind: "vocabulary", vocabularyIds: vocabIds },
    { id: "grammar", title: "Граматична вставка", kind: "grammar", grammarIds: grammarLinks, tableIds: tableLinks },
    { id: "controlled", title: "Контрольована практика", kind: "practice", exerciseIds: exerciseIds.slice(0, 10) },
    { id: "understanding", title: "Практика на розуміння", kind: "practice", exerciseIds: exerciseIds.slice(10, 18) },
    { id: "building", title: "Практика на побудову", kind: "practice", exerciseIds: exerciseIds.slice(18, 24) },
    { id: "review", title: "Повторення", kind: "review", prompts: ["Поясни головну модель уроку одним реченням.", "Наведи один казахський приклад із пам’яті.", "Знайди в прикладі основу й додану частину.", "Скажи, яку українську звичку тут не можна переносити дослівно."], next: "Наступний урок додає новий шар: більше прикладів, більше самостійної побудови й повторення попередньої моделі." }
  ];
}

export const lessons: Lesson[] = lessonPlan.map(([blockId, number, title, subtitle, level, family]) => {
  const id = "lesson-" + number;
  const grammarLinks = grammarForFamily(family, number);
  const tableLinks = tablesForGrammar(grammarLinks);
  const vocabularyIds = lessonVocabulary(number, family);
  const phraseIds = phrases.filter(phrase => phrase.lessonIds.includes(id)).slice(0, 20).map(phrase => phrase.id);
  const exerciseIds = (exercisesByLesson[id] ?? []).map(exercise => exercise.id);
  return {
    id,
    number,
    blockId,
    title,
    subtitle,
    level,
    estimatedMinutes: number <= 8 ? 35 : number <= 40 ? 40 : 45,
    goal: \`Опанувати тему «\${title}» через пояснення, модель, приклади, діалог і практику.\`,
    canDo: [
      "пояснити головну модель уроку українською",
      "розпізнати форму в короткому казахському прикладі",
      "побудувати схожу фразу зі зміненим словом",
      "виправити типову помилку без дослівної кальки"
    ],
    sourceIdeas: familyIdeas(family),
    grammarLinks,
    tableLinks,
    vocabularyIds,
    phraseIds,
    exerciseIds,
    sections: buildSections(number, title, subtitle, family, grammarLinks, tableLinks, vocabularyIds, exerciseIds),
    contentWordEstimate: 1650
  };
});

export const lessonById = Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]));`;

const reviewDeckData = `import { exercises } from "./exercises";
import { vocabulary } from "./vocabulary";
import { grammarArticles } from "./grammar";

export const reviewIntervals = [0, 1, 2, 4, 7, 14, 30];

export const reviewDeck = [
  ...vocabulary.slice(0, 260).map(item => ({ id: "word-" + item.id, kind: "word" as const, prompt: item.kk, answer: item.uk, relatedId: item.id })),
  ...grammarArticles.map(item => ({ id: "grammar-" + item.id, kind: "grammar" as const, prompt: item.title, answer: item.model, relatedId: item.id })),
  ...exercises.slice(0, 260).map(item => ({ id: "exercise-" + item.id, kind: "exercise" as const, prompt: item.prompt, answer: Array.isArray(item.answer) ? item.answer.join(" + ") : item.answer ?? item.modelAnswer ?? "", relatedId: item.id }))
];`;

async function main() {
  for (const dir of [
    "src/app",
    "src/data",
    "src/components/layout",
    "src/components/lesson",
    "src/components/practice",
    "src/components/reference",
    "src/components/progress",
    "src/components/qa",
    "src/types",
    "src/styles"
  ]) await ensure(dir);

  await put("package.json", packageJson);
  await put("index.html", indexHtml);
  await put("tsconfig.json", tsconfig);
  await put("vite.config.ts", viteConfig);
  await put("src/types/course.ts", courseTypes);
  await put("src/types/grammar.ts", grammarTypes);
  await put("src/types/vocabulary.ts", vocabularyTypes);
  await put("src/types/exercises.ts", exerciseTypes);
  await put("src/app/routes.tsx", routes);
  await put("src/data/helpers.ts", dataHelpers);
  await put("src/data/courseStructure.ts", structureData);
  await put("src/data/vocabulary.ts", vocabularyData);
  await put("src/data/grammar.ts", grammarData);
  await put("src/data/endingTables.ts", endingTablesData);
  await put("src/data/phrases.ts", phraseData);
  await put("src/data/exercises.ts", exercisesData);
  await put("src/data/lessons.ts", lessonsData);
  await put("src/data/reviewDeck.ts", reviewDeckData);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
