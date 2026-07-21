import { useState } from "react";
import type { MouseEvent } from "react";
import { loadAudioSettings } from "./audioSettings";
import { playWithCourseTts } from "./courseTts";

export function PronounceButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  async function speak(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const settings = loadAudioSettings();
    setStatus("loading");
    setMessage("");
    try {
      await playWithCourseTts(text, settings);
      setStatus("idle");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Не вдалося озвучити текст.";
      console.warn("Course TTS failed:", error);
      setMessage(nextMessage);
      setStatus("error");
      window.dispatchEvent(new CustomEvent("audio-error", { detail: nextMessage }));
    }
  }
  const label = status === "loading"
    ? "Готую..."
    : status === "error"
      ? compact ? "!" : "Помилка аудіо"
      : compact
        ? "▶"
        : "Прослухати / Тыңдау";
  return (
    <button className={`${compact ? "audio-button compact" : "audio-button"} ${status === "error" ? "error" : ""}`} type="button" onClick={speak} title={message || "Озвучити"}>
      {label}
    </button>
  );
}
