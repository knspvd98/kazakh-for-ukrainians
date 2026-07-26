import type { AudioSettings } from "./audioSettings";

const AUDIO_VERSION = "v1";

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

async function hashText(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

export async function getStaticAudioUrl(
  text: string,
  settings: AudioSettings
) {
  const normalized = normalizeText(text);

  if (!normalized) {
    throw new Error("Немає тексту для озвучення.");
  }

  const speedFolder = settings.rate === 0.85
    ? "slow"
    : "normal";

  const hash = await hashText(normalized);
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}audio/${AUDIO_VERSION}/${speedFolder}/${hash}.mp3`;
}
