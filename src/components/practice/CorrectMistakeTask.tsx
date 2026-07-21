import { useState } from "react";
import type { Exercise } from "../../types/exercises";

export function CorrectMistakeTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const [value, setValue] = useState("");
  const answer = String(task.answer ?? "").toLowerCase().trim();
  const ok = value.toLowerCase().trim() === answer;
  return (
    <article className="task-card">
      <strong>{task.prompt}</strong>
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Напиши виправлену форму" />
      <button className="secondary" onClick={() => onAnswer(task.id, ok)}>Перевірити точну відповідь</button>
      {value && <p className={ok ? "task-feedback ok" : "task-feedback bad"}>{ok ? task.feedbackCorrect : task.feedbackWrong}</p>}
    </article>
  );
}
