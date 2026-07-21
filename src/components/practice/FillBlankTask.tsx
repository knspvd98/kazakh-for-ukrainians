import { useState } from "react";
import type { Exercise } from "../../types/exercises";

export function FillBlankTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const answer = String(task.answer ?? "").trim().toLowerCase();
  const ok = value.trim().toLowerCase() === answer;
  return (
    <article className="task-card">
      <strong>{task.prompt}</strong>
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Впиши коротку форму" />
      <button className="secondary" onClick={() => { setChecked(true); onAnswer(task.id, ok); }}>Перевірити</button>
      {checked && <p className={ok ? "task-feedback ok" : "task-feedback bad"}>{ok ? task.feedbackCorrect : task.feedbackWrong}</p>}
    </article>
  );
}
