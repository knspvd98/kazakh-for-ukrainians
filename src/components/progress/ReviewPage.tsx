import type { useProgress } from "./useProgress";
import { reviewDeck, reviewIntervals } from "../../data/reviewDeck";

type ProgressApi = ReturnType<typeof useProgress>;

export function ReviewPage({ progress }: { progress: ProgressApi }) {
  const due = reviewDeck.slice(0, 36);
  const kindLabel = { word: "слово", grammar: "правило", exercise: "вправа" } as const;
  return (
    <main className="page">
      <div className="page-title"><h1>Повторення / Қайталау</h1><p>Інтервальне повторення для слів, правил і завдань. Інтервали: {reviewIntervals.join(", ")} днів.</p></div>
      <div className="review-grid">
        {due.map((item) => (
          <article className="review-card" key={item.id}>
            <span>{kindLabel[item.kind]}</span>
            <strong>{item.prompt}</strong>
            <p>{item.answer}</p>
            <button className="secondary" onClick={() => progress.answerTask(item.id, true)}>Знаю</button>
          </article>
        ))}
      </div>
    </main>
  );
}
