import type { AudioSettings } from "./audioSettings";

const audioCache = new Map<string, string>();

export async function playWithCourseTts(text: string, settings: AudioSettings) {
  const normalized = text.trim();
  if (!normalized) throw new Error("Немає тексту для озвучення.");
  const key = `${settings.voice}:${settings.rate}:${normalized}`;
  const cachedUrl = audioCache.get(key);
  if (cachedUrl) {
    await playAudioUrl(cachedUrl);
    return;
  }
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: normalized,
      voice: settings.voice,
      rate: settings.rate
    })
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error("Сервер повернув порожній аудіофайл.");
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  await playAudioUrl(url);
}

function playAudioUrl(url: string) {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Браузер не зміг програти аудіо."));
    audio.play().catch(reject);
  });
}

async function readError(response: Response) {
  try {
    const json = await response.json();
    if (typeof json?.error === "string") return json.error;
  } catch {
    // Fall through to status.
  }
  return `Не вдалося озвучити текст. Код помилки: ${response.status}.`;
}
