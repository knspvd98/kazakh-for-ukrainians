import { useState } from "react";

import {
  defaultAudioSettings,
  loadAudioSettings,
  resetAudioSettings,
  saveAudioSettings
} from "../common/audioSettings";

import type {
  AudioRate,
  AudioSettings
} from "../common/audioSettings";

import { playWithCourseTts } from "../common/courseTts";

const samplePhrases = [
  "Сәлем, Алина.",
  "Қазақ тілі өте әдемі.",
  "Маған су керек.",
  "Кітап үстелде.",
  "Диас, қайталап айтыңызшы."
];

export function AudioSettingsPage() {
  const [settings, setSettings] =
    useState<AudioSettings>(() => loadAudioSettings());

  const [sample, setSample] =
    useState(samplePhrases[0]);

  const [saved, setSaved] = useState(false);

  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");

  const [testMessage, setTestMessage] = useState("");

  function updateRate(rate: AudioRate) {
    setSettings({
      voice: "kk-KZ-AigulNeural",
      rate
    });

    setSaved(false);
  }

  function save() {
    saveAudioSettings(settings);
    setSaved(true);
  }

  async function testAudio() {
    setTestStatus("loading");
    setTestMessage("");

    saveAudioSettings(settings);
    setSaved(true);

    try {
      await playWithCourseTts(sample, settings);

      setTestStatus("ok");
      setTestMessage("Готово: аудіо відтворено.");
    } catch (error) {
      setTestStatus("error");

      setTestMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося відтворити аудіо."
      );
    }
  }

  function reset() {
    resetAudioSettings();
    setSettings(defaultAudioSettings);
    setSaved(false);
  }

  return (
    <main className="page audio-page">
      <div className="page-title">
        <p className="section-kicker">Дыбыс</p>
        <h1>Аудіо / Дыбыс</h1>
        <p>
          Обери звичайну або повільну вимову для слів,
          прикладів і діалогів курсу.
        </p>
      </div>

      <section className="audio-settings-card">
        <div className="audio-form">
          <label>
            Голос / Дауыс
            <input
              value="Aigul / әйел дауысы"
              readOnly
            />
          </label>

          <label>
            Швидкість / Жылдамдық
            <select
              value={settings.rate}
              onChange={(event) =>
                updateRate(
                  Number(event.target.value) as AudioRate
                )
              }
            >
              <option value={0.85}>
                повільно / баяу
              </option>

              <option value={1}>
                нормально / қалыпты
              </option>
            </select>
          </label>
        </div>

        <div className="audio-actions">
          <button
            className="primary"
            onClick={save}
          >
            Зберегти налаштування
          </button>

          <button
            className="secondary"
            onClick={reset}
          >
            Скинути
          </button>

          {saved && <span>Збережено локально.</span>}
        </div>
      </section>

      <section className="audio-test-card">
        <h2>Перевірка вимови / Тыңдап көру</h2>

        <p>Обери одну з підготовлених фраз.</p>

        <div className="audio-samples">
          {samplePhrases.map((phrase) => (
            <button
              key={phrase}
              className={phrase === sample ? "active" : ""}
              onClick={() => setSample(phrase)}
            >
              {phrase}
            </button>
          ))}
        </div>

        <button
          className="primary"
          onClick={testAudio}
          disabled={testStatus === "loading"}
        >
          {testStatus === "loading"
            ? "Завантажую аудіо..."
            : "Перевірити / Тыңдау"}
        </button>

        {testMessage && (
          <p
            className={`audio-test-message ${testStatus}`}
          >
            {testMessage}
          </p>
        )}
      </section>
    </main>
  );
}
