import { lessons } from "../src/data/lessons";
import { vocabulary } from "../src/data/vocabulary";
import { phrases } from "../src/data/phrases";
import { grammarArticles } from "../src/data/grammar";
import { endingTables } from "../src/data/endingTables";
import { isCompleteKazakhAudioText } from "../src/components/common/kazakhText";

const dictionaryWords = new Set<string>();
const dictionaryExamples = new Set<string>();
const phrasebook = new Set<string>();
const lessonExamples = new Set<string>();
const lessonDialogues = new Set<string>();
const lessonModels = new Set<string>();
const lessonTeachingSteps = new Set<string>();
const lessonTableCells = new Set<string>();
const grammarExamples = new Set<string>();
const endingTableExamples = new Set<string>();

function add(target: Set<string>, value: unknown) {
  if (typeof value !== "string") return;

  const text = value.trim().replace(/\s+/g, " ");

  if (!text) return;
  if (!isCompleteKazakhAudioText(text)) return;

  target.add(text);
}

for (const word of vocabulary) {
  add(dictionaryWords, word.kk);

  for (const example of word.examples ?? []) {
    add(dictionaryExamples, example.kk);
  }
}

for (const phrase of phrases) {
  const dialogueLines = parsePhraseDialogue(phrase.kk);

  if (dialogueLines.length > 0) {
    for (const line of dialogueLines) {
      add(phrasebook, line);
    }
  } else {
    add(phrasebook, phrase.kk);
  }
}

for (const lesson of lessons) {
  for (const section of lesson.sections) {
    if (section.kind === "model") {
      add(lessonModels, section.fullForm);
    }

    if (section.kind === "examples") {
      for (const example of section.examples) {
        add(lessonExamples, example.kk);
      }
    }

    if (section.kind === "dialogue") {
      for (const line of section.lines) {
        add(lessonDialogues, line.kk);
      }
    }

    if (section.kind === "concept") {
      add(lessonTeachingSteps, section.visual?.example);

      for (const step of section.visual?.teaching?.steps ?? []) {
        add(lessonTeachingSteps, step.kk);
      }

      for (const block of section.body) {
        collectLectureTableCells(block);
      }
    }
  }
}

for (const article of grammarArticles) {
  for (const example of article.examples ?? []) {
    add(grammarExamples, example.kk);
  }
}

for (const table of endingTables) {
  for (const example of table.examples ?? []) {
    add(endingTableExamples, example.kk);
  }
}

function collectLectureTableCells(block: string) {
  if (!block.startsWith("TABLE|")) return;

  const [, , , ...rows] = block.split("|");

  for (const row of rows) {
    for (const cell of row.split("~")) {
      add(lessonTableCells, cell);
    }
  }
}

function parsePhraseDialogue(text: string) {
  if (!/(Диас|Алина):/.test(text)) return [];

  return [
    ...text.matchAll(
      /(Диас|Алина):\s*([^:]+?)(?=\s+(?:Диас|Алина):|$)/g
    )
  ]
    .map((match) => match[2].trim())
    .filter(Boolean);
}

function union(...sets: Set<string>[]) {
  return new Set(sets.flatMap((set) => [...set]));
}

function estimate(texts: Set<string>) {
  const durationSeconds = [...texts].reduce((total, text) => {
    return total + Math.max(0.8, text.length / 12);
  }, 0);

  // Примерный диапазон для коротких MP3 Edge TTS.
  const minimumBytes = durationSeconds * 6000;
  const maximumBytes = durationSeconds * 9000;

  return {
    minutes: durationSeconds / 60,
    minimumMb: minimumBytes / 1024 / 1024,
    maximumMb: maximumBytes / 1024 / 1024
  };
}

function printPack(title: string, texts: Set<string>) {
  const size = estimate(texts);

  console.log(`\n${title}`);
  console.log(`Уникальных аудиофайлов: ${texts.size}`);
  console.log(`Примерная длительность: ${size.minutes.toFixed(1)} мин.`);
  console.log(
    `Примерный размер: ${size.minimumMb.toFixed(1)}–${size.maximumMb.toFixed(1)} МБ`
  );
}

console.log("Количество текстов по разделам:");
console.log(`Слова словаря: ${dictionaryWords.size}`);
console.log(`Примеры словаря: ${dictionaryExamples.size}`);
console.log(`Фразник и его диалоги: ${phrasebook.size}`);
console.log(`Примеры уроков: ${lessonExamples.size}`);
console.log(`Диалоги уроков: ${lessonDialogues.size}`);
console.log(`Разборы полных форм: ${lessonModels.size}`);
console.log(`Учебные шаги в уроках: ${lessonTeachingSteps.size}`);
console.log(`Казахские ячейки таблиц уроков: ${lessonTableCells.size}`);
console.log(`Примеры грамматики: ${grammarExamples.size}`);
console.log(`Примеры таблиц окончаний: ${endingTableExamples.size}`);

const compactPack = union(
  dictionaryWords,
  phrasebook,
  lessonExamples,
  lessonDialogues,
  lessonModels
);

const recommendedPack = union(
  compactPack,
  dictionaryExamples,
  lessonTeachingSteps
);

const completePack = union(
  recommendedPack,
  lessonTableCells,
  grammarExamples,
  endingTableExamples
);

printPack("КОМПАКТНЫЙ НАБОР", compactPack);
printPack("РЕКОМЕНДУЕМЫЙ НАБОР", recommendedPack);
printPack("ПОЛНЫЙ НАБОР", completePack);
