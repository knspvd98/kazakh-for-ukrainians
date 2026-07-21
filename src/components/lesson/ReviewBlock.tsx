import type { LessonSection } from "../../types/course";

export function ReviewBlock({ section }: { section: Extract<LessonSection, { kind: "review" }> }) {
  return (
    <section className="reader-section review-block">
      <h2>{section.title}</h2>
      <div className="review-prompts">
        {section.prompts.map((prompt) => <article key={prompt}>{prompt}</article>)}
      </div>
      <p>{section.next}</p>
    </section>
  );
}
