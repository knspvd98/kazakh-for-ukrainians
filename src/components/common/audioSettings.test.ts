import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  defaultAudioSettings,
  loadAudioSettings,
  resetAudioSettings,
  saveAudioSettings
} from "./audioSettings";

describe("audio settings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns safe defaults for missing or malformed storage", () => {
    expect(loadAudioSettings()).toEqual(defaultAudioSettings);
    localStorage.setItem("kazakh_ukrainian_audio_settings_v3", "{bad-json");
    expect(loadAudioSettings()).toEqual(defaultAudioSettings);
  });

  it("normalises saved settings and notifies listeners", () => {
    const listener = vi.fn();
    window.addEventListener("audio-settings-change", listener);

    saveAudioSettings({ voice: "kk-KZ-AigulNeural", rate: 0.85 });

    expect(loadAudioSettings()).toEqual({
      voice: "kk-KZ-AigulNeural",
      rate: 0.85
    });
    expect(listener).toHaveBeenCalledOnce();

    window.removeEventListener("audio-settings-change", listener);
  });

  it("clears custom settings", () => {
    saveAudioSettings({ voice: "kk-KZ-AigulNeural", rate: 0.85 });
    resetAudioSettings();
    expect(loadAudioSettings()).toEqual(defaultAudioSettings);
  });
});
