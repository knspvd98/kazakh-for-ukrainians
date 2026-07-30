import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { EdgeTTS } from "edge-tts-universal";

import { lessons } from "../src/data/lessons";
import { vocabulary } from "../src/data/vocabulary";
import { phrases } from "../src/data/phrases";
import { grammarArticles } from "../src/data/grammar";
import { endingTables } from "../src/data/endingTables";
import { isCompleteKazakhAudioText } from "../src/components/common/kazakhText";

const VOICE = "kk-KZ-AigulNeural";
const OUTPUT_DIR = path.resolve("public/audio/v1");

const speedProfiles = [
  {
    folder: "normal",
    rate: 1,
    edgeRate: "+0%"
  },
  {
    folder: "slow",
    rate: 0.85,
    edgeRate: "-15%"
  }
] as const;

const samplePhrases = [
  "Сәлем, Алина.",
  "Қазақ тілі өте әдемі.",
  "Маған су керек.",
  "Кітап үстелде.",
  "Диас, қайталап айтыңызшы."
];

const texts = new Set<string>();

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function add(value: unknown) {
  if (typeof value !== "string") return;

  const text = normalizeText(value);

  if (!text) return;
  if (!isCompleteKazakhAudioText(text)) return;

  texts.add(text);
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

function collectLectureTableCells(block: string) {
  if (!block.startsWith("TABLE|")) return;

  const [, , , ...rows] = block.split("|");

  for (const row of rows) {
    for (const cell of row.split("~")) {
      add(cell);
    }
  }
}

for (const word of vocabulary) {
  add(word.kk);

  for (const example of word.examples ?? []) {
    add(example.kk);
  }
}

for (const phrase of phrases) {
  const dialogueLines = parsePhraseDialogue(phrase.kk);

  if (dialogueLines.length > 0) {
    for (const line of dialogueLines) {
      add(line);
    }
  } else {
    add(phrase.kk);
  }
}

for (const lesson of lessons) {
  for (const section of lesson.sections) {
    if (section.kind === "model") {
      add(section.fullForm);
    }

    if (section.kind === "examples") {
      for (const example of section.examples) {
        add(example.kk);
      }
    }

    if (section.kind === "dialogue") {
      for (const line of section.lines) {
        add(line.kk);
      }
    }

    if (section.kind === "concept") {
      add(section.visual?.example);

      for (const step of section.visual?.teaching?.steps ?? []) {
        add(step.kk);
      }

      for (const block of section.body) {
        collectLectureTableCells(block);
      }
    }
  }
}

for (const article of grammarArticles) {
  for (const example of article.examples ?? []) {
    add(example.kk);
  }
}

for (const table of endingTables) {
  for (const example of table.examples ?? []) {
    add(example.kk);
  }
}

for (const phrase of samplePhrases) {
  add(phrase);
}

function hashText(text: string) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex")
    .slice(0, 40);
}

async function isValidAudioFile(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size > 1000;
  } catch {
    return false;
  }
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function synthesize(text: string, rate: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const tts = new EdgeTTS(text, VOICE, {
        rate,
        volume: "+0%",
        pitch: "+0Hz"
      });

      const result = await tts.synthesize();
      const audio = Buffer.from(await result.audio.arrayBuffer());

      if (audio.length < 1000) {
        throw new Error("Отримано занадто малий аудіофайл.");
      }

      return audio;
    } catch (error) {
      lastError = error;

      if (attempt < 5) {
        await sleep(attempt * 1500);
      }
    }
  }

  throw lastError;
}

const orderedTexts = [...texts].sort((a, b) => a.localeCompare(b, "kk"));

const jobs = speedProfiles.flatMap((profile) =>
  orderedTexts.map((text) => ({
    profile,
    text
  }))
);

if (process.argv.includes("--check")) {
  const missing: string[] = [];

  for (const job of jobs) {
    const filename = `${hashText(job.text)}.mp3`;
    const filePath = path.join(OUTPUT_DIR, job.profile.folder, filename);

    if (!(await isValidAudioFile(filePath))) {
      missing.push(`${job.profile.folder}: ${job.text}`);
    }
  }

  console.log(`Аудіокорпус: ${orderedTexts.length} текстів, ${jobs.length} файлів.`);
  console.log(`Відсутніх або пошкоджених файлів: ${missing.length}.`);

  if (missing.length > 0) {
    console.log("\nПерші пропуски:");
    missing.slice(0, 20).forEach((item) => console.log(`- ${item}`));
    process.exitCode = 1;
  }

  process.exit();
}

const configuredConcurrency = Number(process.env.AUDIO_CONCURRENCY ?? 2);

const concurrency = Number.isFinite(configuredConcurrency)
  ? Math.max(1, Math.min(4, Math.floor(configuredConcurrency)))
  : 2;

let cursor = 0;
let completed = 0;
let generated = 0;
let skipped = 0;

const failures: Array<{
  text: string;
  speed: string;
  error: string;
}> = [];

await fs.mkdir(OUTPUT_DIR, { recursive: true });

for (const profile of speedProfiles) {
  await fs.mkdir(path.join(OUTPUT_DIR, profile.folder), {
    recursive: true
  });
}

console.log(`Унікальних текстів: ${orderedTexts.length}`);
console.log(`Швидкостей: ${speedProfiles.length}`);
console.log(`Усього MP3: ${jobs.length}`);
console.log(`Паралельних запитів: ${concurrency}`);
console.log("");

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;

    if (index >= jobs.length) return;

    const job = jobs[index];
    const filename = `${hashText(job.text)}.mp3`;

    const finalPath = path.join(
      OUTPUT_DIR,
      job.profile.folder,
      filename
    );

    const temporaryPath = `${finalPath}.tmp`;

    try {
      if (await isValidAudioFile(finalPath)) {
        skipped += 1;
      } else {
        const audio = await synthesize(
          job.text,
          job.profile.edgeRate
        );

        await fs.writeFile(temporaryPath, audio);
        await fs.rename(temporaryPath, finalPath);

        generated += 1;
        await sleep(150);
      }
    } catch (error) {
      await fs.rm(temporaryPath, { force: true });

      failures.push({
        text: job.text,
        speed: job.profile.folder,
        error: error instanceof Error
          ? error.message
          : String(error)
      });
    } finally {
      completed += 1;

      if (completed % 25 === 0 || completed === jobs.length) {
        console.log(
          `${completed}/${jobs.length} | нових: ${generated} | вже були: ${skipped} | помилок: ${failures.length}`
        );
      }
    }
  }
}

await Promise.all(
  Array.from({ length: concurrency }, () => worker())
);

await fs.writeFile(
  path.join(OUTPUT_DIR, "_meta.json"),
  JSON.stringify(
    {
      version: "v1",
      voice: VOICE,
      texts: orderedTexts.length,
      files: jobs.length,
      speeds: speedProfiles.map((profile) => ({
        folder: profile.folder,
        rate: profile.rate
      }))
    },
    null,
    2
  )
);

console.log("");
console.log("Генерацію завершено.");
console.log(`Створено зараз: ${generated}`);
console.log(`Пропущено готових: ${skipped}`);
console.log(`Помилок: ${failures.length}`);

if (failures.length > 0) {
  console.log("");
  console.log("Перші помилки:");

  for (const failure of failures.slice(0, 20)) {
    console.log(
      `[${failure.speed}] ${failure.text.slice(0, 80)} — ${failure.error}`
    );
  }

  console.log("");
  console.log("Запусти команду повторно. Готові файли генеруватися заново не будуть.");

  process.exitCode = 1;
}
