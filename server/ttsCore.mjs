import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EdgeTTS } from "edge-tts-universal";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = process.env.TTS_CACHE_DIR
  ? path.resolve(process.env.TTS_CACHE_DIR)
  : path.join(rootDir, ".tts-cache");

export const edgeVoices = [
  { id: "kk-KZ-AigulNeural", label: "Aigul / әйел дауысы", gender: "female" },
  { id: "kk-KZ-DauletNeural", label: "Daulet / ер дауысы", gender: "male" }
];

export function getTtsStatus() {
  return {
    primary: "edge-tts",
    cache: true,
    cacheDir,
    voices: edgeVoices,
    speechGenFallback: Boolean(process.env.SPEECHGEN_EMAIL && process.env.SPEECHGEN_TOKEN),
    speechGenVoice: process.env.SPEECHGEN_VOICE || ""
  };
}

export async function synthesizeTts(input) {
  const text = normalizeText(input.text);
  const voice = normalizeVoice(input.voice);
  const rate = normalizeRate(input.rate);
  const key = makeCacheKey({ text, voice, rate, version: 2 });
  const audioPath = path.join(cacheDir, `${key}.mp3`);
  const metaPath = path.join(cacheDir, `${key}.json`);

  const cached = await readCached(audioPath, metaPath);
  if (cached) return cached;

  await fs.mkdir(cacheDir, { recursive: true });

  const errors = [];
  try {
    const audio = await synthesizeWithEdge({ text, voice, rate });
    await writeCache(audioPath, metaPath, audio, { provider: "edge-tts", voice, rate, text });
    return { audio, provider: "edge-tts", cache: "miss", voice, rate };
  } catch (error) {
    errors.push(`Edge TTS: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const audio = await synthesizeWithSpeechGen({ text, rate });
    await writeCache(audioPath, metaPath, audio, { provider: "speechgen", voice: process.env.SPEECHGEN_VOICE || "", rate, text });
    return { audio, provider: "speechgen", cache: "miss", voice: process.env.SPEECHGEN_VOICE || "", rate };
  } catch (error) {
    errors.push(`SpeechGen: ${error instanceof Error ? error.message : String(error)}`);
  }

  throw new Error(errors.join(" | "));
}

function normalizeText(value) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) throw new Error("Немає тексту для озвучення.");
  if (text.length > 900) throw new Error("Для одного запиту залиш коротший текст: до 900 символів.");
  return text;
}

function normalizeVoice(value) {
  const candidate = String(value ?? "").trim();
  return edgeVoices.some((voice) => voice.id === candidate) ? candidate : edgeVoices[0].id;
}

function normalizeRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(1.25, Math.max(0.75, number));
}

function makeCacheKey(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 40);
}

async function readCached(audioPath, metaPath) {
  try {
    const [audio, metaRaw] = await Promise.all([fs.readFile(audioPath), fs.readFile(metaPath, "utf8")]);
    const meta = JSON.parse(metaRaw);
    return {
      audio,
      provider: typeof meta.provider === "string" ? meta.provider : "cache",
      cache: "hit",
      voice: typeof meta.voice === "string" ? meta.voice : "",
      rate: typeof meta.rate === "number" ? meta.rate : 1
    };
  } catch {
    return null;
  }
}

async function writeCache(audioPath, metaPath, audio, meta) {
  await Promise.all([
    fs.writeFile(audioPath, audio),
    fs.writeFile(metaPath, JSON.stringify({ ...meta, createdAt: new Date().toISOString() }, null, 2))
  ]);
}

async function synthesizeWithEdge({ text, voice, rate }) {
  const percent = Math.round((rate - 1) * 100);
  const rateValue = `${percent >= 0 ? "+" : ""}${percent}%`;
  const tts = new EdgeTTS(text, voice, {
    rate: rateValue,
    volume: "+0%",
    pitch: "+0Hz"
  });
  const result = await tts.synthesize();
  const audio = Buffer.from(await result.audio.arrayBuffer());
  if (audio.length < 1000) throw new Error("Edge TTS повернув занадто малий аудіофайл.");
  return audio;
}

async function synthesizeWithSpeechGen({ text, rate }) {
  const token = process.env.SPEECHGEN_TOKEN;
  const email = process.env.SPEECHGEN_EMAIL;
  const voice = process.env.SPEECHGEN_VOICE;
  if (!token || !email || !voice) {
    throw new Error("не налаштовано SPEECHGEN_EMAIL, SPEECHGEN_TOKEN або SPEECHGEN_VOICE.");
  }
  const form = new URLSearchParams({
    token,
    email,
    voice,
    text,
    format: "mp3",
    speed: String(rate),
    sample_rate: "24000",
    bitrate: "128",
    channels: "1"
  });
  const response = await fetch("https://speechgen.io/index.php?r=api/text", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString()
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result?.status !== 1) throw new Error(String(result?.error || "SpeechGen не повернув аудіофайл."));
  const fileUrl = result.file_cors || result.file;
  if (!fileUrl) throw new Error("SpeechGen не повернув URL аудіофайлу.");
  const download=new URL(fileUrl);
  if(download.protocol!=="https:" || download.username || download.password || download.port ||
     !(download.hostname==="speechgen.io" || download.hostname.endsWith(".speechgen.io"))) throw new Error("Unapproved audio host.");
  const audioResponse = await fetch(download, {redirect:"error",signal:AbortSignal.timeout(20000)});
  if (!audioResponse.ok) throw new Error(`не вдалося завантажити аудіо: HTTP ${audioResponse.status}`);
  const audio = Buffer.from(await audioResponse.arrayBuffer());
  if (audio.length < 1000) throw new Error("SpeechGen повернув занадто малий аудіофайл.");
  return audio;
}

