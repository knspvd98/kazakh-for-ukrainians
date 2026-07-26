import type { AudioSettings } from "./audioSettings";
import { getStaticAudioUrl } from "./staticAudio";

const audioCache = new Map<string, string>();

export async function playWithCourseTts(
  text: string,
  settings: AudioSettings
) {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error("Немає тексту для озвучення.");
  }

  const staticUrl = await getStaticAudioUrl(
    normalized,
    settings
  );

  let playableUrl = audioCache.get(staticUrl);

  if (!playableUrl) {
    const response = await fetch(staticUrl, {
      cache: "force-cache"
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Для цього тексту ще немає готового аудіофайлу."
        );
      }

      throw new Error(
        `Не вдалося завантажити аудіо. Код помилки: ${response.status}.`
      );
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error("Отримано порожній аудіофайл.");
    }

    playableUrl = URL.createObjectURL(blob);
    audioCache.set(staticUrl, playableUrl);
  }

  await playAudioUrl(playableUrl);
}

function playAudioUrl(url: string) {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => resolve();

    audio.onerror = () => {
      reject(
        new Error("Браузер не зміг відтворити аудіо.")
      );
    };

    audio.play().catch(reject);
  });
}
