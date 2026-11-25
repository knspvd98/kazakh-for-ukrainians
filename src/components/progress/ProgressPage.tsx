import { useRef, useState } from "react";
import type { useProgress } from "./useProgress";
import { lessons } from "../../data/lessons";
import { vocabulary } from "../../data/vocabulary";
import { phrases } from "../../data/phrases";
import { grammarArticles } from "../../data/grammar";

type ProgressApi = ReturnType<typeof useProgress>;

export function ProgressPage({ progress }: { progress: ProgressApi }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");

  async function handleImport(file?: File) {
    if (!file) return;
    try {
      await progress.importProgress(file);
      setMessage("Прогрес імпортовано.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не вдалося імпортувати прогрес.");
    }
  }

  return (
    <main className="page">
      <div className="page-title"><h1>Прогрес / Ілгерілеу</h1><p>Усе зберігається локально в браузері. Експорт JSON дозволяє перенести прогрес вручну.</p></div>
      <div className="progress-grid">
        <Metric value={`${progress.state.completedLessons.length}/${lessons.length}`} label="уроків завершено" />
        <Metric value={String(Object.keys(progress.state.taskResults).length)} label="завдань виконано" />
        <Metric value={String(vocabulary.length)} label="словникових слів" />
        <Metric value={String(phrases.length)} label="фраз" />
        <Metric value={String(grammarArticles.length)} label="правил" />
      </div>
      <div className="progress-actions">
        <button className="primary" onClick={progress.exportProgress}>Експортувати прогрес</button>
        <button className="secondary" onClick={() => inputRef.current?.click()}>Імпортувати прогрес</button>
        <button className="secondary" onClick={progress.reset}>Скинути локальний прогрес</button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={(event) => void handleImport(event.target.files?.[0])}
        />
      </div>
      {message && <p className="import-message">{message}</p>}
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <article className="metric-card"><strong>{value}</strong><span>{label}</span></article>;
}
