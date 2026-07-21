export type AudioSettings = {
  voice: string;
  rate: number;
};

const AUDIO_SETTINGS_KEY = "kazakh_ukrainian_audio_settings_v2";

export const edgeVoiceOptions = [
  { id: "kk-KZ-AigulNeural", label: "Aigul / әйел дауысы" },
  { id: "kk-KZ-DauletNeural", label: "Daulet / ер дауысы" }
];

export const defaultAudioSettings: AudioSettings = {
  voice: "kk-KZ-AigulNeural",
  rate: 1
};

export function loadAudioSettings(): AudioSettings {
  if (typeof localStorage === "undefined") return defaultAudioSettings;
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return defaultAudioSettings;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    const voice = typeof parsed.voice === "string" && edgeVoiceOptions.some((item) => item.id === parsed.voice)
      ? parsed.voice
      : defaultAudioSettings.voice;
    const rate = Number.isFinite(Number(parsed.rate)) ? Math.min(1.25, Math.max(0.75, Number(parsed.rate))) : defaultAudioSettings.rate;
    return {
      voice,
      rate
    };
  } catch {
    return defaultAudioSettings;
  }
}

export function saveAudioSettings(settings: AudioSettings) {
  localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("audio-settings-change"));
}

export function resetAudioSettings() {
  localStorage.removeItem(AUDIO_SETTINGS_KEY);
  window.dispatchEvent(new CustomEvent("audio-settings-change"));
}
