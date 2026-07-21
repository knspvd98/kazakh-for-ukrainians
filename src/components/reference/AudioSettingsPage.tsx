import { useState } from "react";
import { defaultAudioSettings, edgeVoiceOptions, loadAudioSettings, resetAudioSettings, saveAudioSettings } from "../common/audioSettings";
import type { AudioSettings } from "../common/audioSettings";
import { playWithCourseTts } from "../common/courseTts";

const samplePhrases = [
  "Сәлем, Алина.",
  "Қазақ тілі өте әдемі.",
  "Маған су керек.",
  "Кітап үстелде.",
  "Диас, қайталап айтыңызшы."
];

export function AudioSettingsPage() {
  const [settings, setSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const [sample, setSample] = useState(samplePhrases[0]);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  function update(next: AudioSettings) {
    setSettings(next);
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
      setTestMessage(error instanceof Error ? error.message : "Не вдалося озвучити текст.");
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
        <p>Налаштуй голос і швидкість для слів, фраз і діалогів курсу.</p>
      </div>

      <section className="audio-settings-card">
        <div className="audio-form">
          <label>
            Голос / Дауыс
            <select value={settings.voice} onChange={(event) => update({ ...settings, voice: event.target.value })}>
              {edgeVoiceOptions.map((voice) => <option key={voice.id} value={voice.id}>{voice.label}</option>)}
            </select>
          </label>
          <label>
            Швидкість / Жылдамдық
            <select value={settings.rate} onChange={(event) => update({ ...settings, rate: Number(event.target.value) })}>
              <option value={0.85}>повільніше / баяу</option>
              <option value={1}>нормально / қалыпты</option>
              <option value={1.12}>трохи швидше / жылдамырақ</option>
            </select>
          </label>
        </div>

        <div className="audio-actions">
          <button className="primary" onClick={save}>Зберегти налаштування</button>
          <button className="secondary" onClick={reset}>Скинути</button>
          {saved && <span>Збережено локально.</span>}
        </div>
      </section>

      <section className="audio-test-card">
        <h2>Перевірка вимови / Тыңдап көру</h2>
        <p>Обери коротку фразу або введи свою.</p>
        <div className="audio-samples">
          {samplePhrases.map((phrase) => (
            <button key={phrase} className={phrase === sample ? "active" : ""} onClick={() => setSample(phrase)}>{phrase}</button>
          ))}
        </div>
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} />
        <button className="primary" onClick={testAudio} disabled={testStatus === "loading"}>
          {testStatus === "loading" ? "Готую аудіо..." : "Перевірити / Тыңдау"}
        </button>
        {testMessage && <p className={`audio-test-message ${testStatus}`}>{testMessage}</p>}
      </section>
    </main>
  );
}
