import { useState } from "react";
import type { Exercise } from "../../types/exercises";

export function ChoiceTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const [selected, setSelected] = useState<string>();
  const answer = Array.isArray(task.answer) ? task.answer.join(" + ") : task.answer;
  const ok = selected != null && selected === answer;
  const options = task.options ?? [];
  return (
    <article className="task-card">
      <strong>{task.prompt}</strong>
      <div className={(task.options ?? []).some((option) => option.length > 18) ? "sentence-options" : "chip-options"}>
        {options.map((option) => (
          <button key={option} className={selected === option ? "selected" : ""} onClick={() => { setSelected(option); onAnswer(task.id, option === answer); }}>{option}</button>
        ))}
      </div>
      {options.length < 2 && <p className="task-feedback bad">Це завдання тимчасово приховано: для вибору потрібно щонайменше два варіанти.</p>}
      {selected && <p className={ok ? "task-feedback ok" : "task-feedback bad"}>{ok ? task.feedbackCorrect : task.feedbackWrong}</p>}
    </article>
  );
}
