import { useState } from "react";
import type { Exercise } from "../../types/exercises";

export function BuildSentenceTask({ task, onAnswer }: { task: Exercise; onAnswer: (id: string, ok: boolean) => void }) {
  const answer = Array.isArray(task.answer) ? task.answer : String(task.answer ?? "").split(" + ");
  const pool = makeBlockPool(task, answer);
  const [built, setBuilt] = useState<{ value: string; index: number }[]>([]);
  const [checked, setChecked] = useState(false);
  const builtValues = built.map((item) => item.value);
  const ok = builtValues.length === answer.length && builtValues.every((item, index) => item === answer[index]);
  const used = new Set(built.map((item) => item.index));
  function choose(value: string, index: number) {
    if (built.length >= answer.length || used.has(index)) return;
    setChecked(false);
    setBuilt((prev) => [...prev, { value, index }]);
  }
  function remove(index: number) {
    setChecked(false);
    setBuilt((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }
  function check() {
    setChecked(true);
    onAnswer(task.id, ok);
  }
  return (
    <article className="task-card">
      <strong>{task.prompt}</strong>
      <p className="task-hint">Обери тільки потрібні частини. Зайві блоки залишаються невикористаними.</p>
      <div className="chip-options build-pool">
        {pool.map((block, index) => (
          <span className="answer-option-with-audio" key={`${block}-${index}`}>
            <button disabled={used.has(index) || built.length >= answer.length} onClick={() => choose(block, index)}>{block}</button>
          </span>
        ))}
      </div>
      <div className="build-answer" aria-label="Твоя відповідь">
        {built.length === 0 && <em>Тут з’явиться твоя модель</em>}
        {built.map((part, index) => (
          <span className="answer-token-with-audio" key={`${part.value}-${part.index}`}>
            <button onClick={() => remove(index)}>{part.value}</button>
          </span>
        ))}
      </div>
      <div className="task-actions">
        <button className="secondary" onClick={() => { setBuilt([]); setChecked(false); }}>Очистити</button>
        <button className="primary" onClick={check} disabled={built.length !== answer.length}>Перевірити порядок</button>
      </div>
      {checked && <p className={ok ? "task-feedback ok" : "task-feedback bad"}>{ok ? task.feedbackCorrect : "Порядок або вибір блоків не збігається з моделлю. Прибери зайве й збери ще раз."}</p>}
    </article>
  );
}

function makeBlockPool(task: Exercise, answer: string[]) {
  const base = task.blocks?.length ? task.blocks : answer;
  const decoys = inferDecoys([...base, ...answer], task.prompt);
  const unique = [...base, ...decoys].filter((item, index, array) => array.indexOf(item) === index);
  const shuffled = deterministicShuffle(unique, task.id);
  if (shuffled.length === answer.length && shuffled.every((item, index) => item === answer[index])) {
    return [...shuffled.slice(1), shuffled[0]];
  }
  return shuffled;
}

function inferDecoys(parts: string[], prompt: string) {
  const text = [...parts, prompt].join(" ");
  const pool = [
    "да", "де", "та", "те", "ға", "ге", "қа", "ке", "дан", "ден", "тан", "тен",
    "бар", "жоқ", "ма", "ба", "пе", "Бұл", "Мен", "Сіз", "сен", "кітап", "қала",
    "су", "үй", "керек", "емес", "тар", "ымыз", "пен", "мен"
  ];
  const targeted = [
    text.includes("қала") ? "қалаға" : "",
    text.includes("мектеп") ? "мектепте" : "",
    text.includes("Маған") ? "Мен" : "",
    text.includes("Бұл") ? "бар" : "",
    text.includes("бар") ? "жоқ" : "",
    text.includes("керек") ? "емес" : ""
  ].filter(Boolean);
  return [...targeted, ...pool].filter((item) => !parts.includes(item)).slice(0, 4);
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
