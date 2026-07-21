import { useState } from "react";
import type { Exercise } from "../../types/exercises";

export function SelfCheckTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const [shown, setShown] = useState(false);
  return (
    <article className="task-card self-check">
      <strong>{task.prompt}</strong>
      <textarea placeholder="Занотуй свою відповідь для себе. Система не імітує перевірку вільного тексту." />
      <button className="secondary" onClick={() => { setShown(true); onAnswer(task.id, true); }}>Показати зразок</button>
      {shown && <p className="task-feedback self-check-model">{task.modelAnswer}</p>}
    </article>
  );
}
