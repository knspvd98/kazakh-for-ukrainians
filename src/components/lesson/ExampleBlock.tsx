import type { Example } from "../../types/course";
import { PronounceButton } from "../common/PronounceButton";

export function ExampleBlock({ title, intro, examples }: { title: string; intro?: string; examples: Example[] }) {
  return (
    <section className="reader-section">
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
      <div className="example-grid">
        {examples.map((example, index) => (
          <article className="example-card" key={`${example.kk}-${index}`}>
            <div className="kazakh-audio-line">
              <strong>{example.kk}</strong>
              <PronounceButton text={example.kk} compact />
            </div>
            <span>{example.uk}</span>
            {example.note && <small>{example.note}</small>}
          </article>
        ))}
      </div>
    </section>
  );
}
