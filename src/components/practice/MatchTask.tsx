import { useState } from "react";
import type { Exercise } from "../../types/exercises";
import { PronounceButton } from "../common/PronounceButton";
import { isCompleteKazakhAudioText } from "../common/kazakhText";

export function MatchTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const pairs = task.pairs ?? [];
  const options = deterministicShuffle([...new Set(pairs.map((pair) => pair[1]))], task.id);
  const [values, setValues] = useState<Record<number, string>>({});
  const ok = pairs.every((pair, index) => values[index] === pair[1]);
  const allowAudio = !/(частин|частину|рол|основ|модель|закінчен|поряд|розбір|тип звучання)/iu.test(task.prompt);
  return (
    <article className="task-card">
      <strong>{task.prompt}</strong>
      <div className="match-list">
        {pairs.map((pair, index) => (
          <label key={pair[0]}><span className="match-source">{pair[0]}{allowAudio && isCompleteKazakhAudioText(pair[0]) && <PronounceButton text={pair[0]} compact />}</span><select value={values[index] ?? ""} onChange={(event) => setValues((prev) => ({ ...prev, [index]: event.target.value }))}><option value="">Обери</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
        ))}
      </div>
      <button className="secondary" onClick={() => onAnswer(task.id, ok)}>Перевірити пари</button>
      {Object.keys(values).length > 0 && <p className={ok ? "task-feedback ok" : "task-feedback bad"}>{ok ? task.feedbackCorrect : task.feedbackWrong}</p>}
    </article>
  );
}

function deterministicShuffle(items: string[], seedText: string) {
  return [...items].sort((a, b) => hash(`${seedText}:${a}`) - hash(`${seedText}:${b}`));
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
