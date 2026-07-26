export type AudioRate = 0.85 | 1;

export type AudioSettings = {
  voice: "kk-KZ-AigulNeural";
  rate: AudioRate;
};

const AUDIO_SETTINGS_KEY =
  "kazakh_ukrainian_audio_settings_v3";

export const edgeVoiceOptions = [
  {
    id: "kk-KZ-AigulNeural",
    label: "Aigul / әйел дауысы"
  }
] as const;

export const defaultAudioSettings: AudioSettings = {
  voice: "kk-KZ-AigulNeural",
  rate: 1
};

export function loadAudioSettings(): AudioSettings {
  if (typeof localStorage === "undefined") {
    return defaultAudioSettings;
  }

  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);

    if (!raw) return defaultAudioSettings;

    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    const numericRate = Number(parsed.rate);

    return {
      voice: "kk-KZ-AigulNeural",
      rate: numericRate === 0.85 ? 0.85 : 1
    };
  } catch {
    return defaultAudioSettings;
  }
}

export function saveAudioSettings(
  settings: AudioSettings
) {
  const normalized: AudioSettings = {
    voice: "kk-KZ-AigulNeural",
    rate: settings.rate === 0.85 ? 0.85 : 1
  };

  localStorage.setItem(
    AUDIO_SETTINGS_KEY,
    JSON.stringify(normalized)
  );

  window.dispatchEvent(
    new CustomEvent("audio-settings-change")
  );
}

export function resetAudioSettings() {
  localStorage.removeItem(AUDIO_SETTINGS_KEY);

  window.dispatchEvent(
    new CustomEvent("audio-settings-change")
  );
}
