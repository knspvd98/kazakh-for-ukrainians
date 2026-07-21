import { PronounceButton } from "../common/PronounceButton";
import type { DialogueSpeaker } from "../../types/course";

export function DialogueBlock({ title, lines }: { title: string; lines: { speaker: DialogueSpeaker; kk?: string; uk: string }[] }) {
  return (
    <section className="reader-section">
      <h2>{title}</h2>
      <div className="dialogue-block">
        {lines.map((line, index) => (
          <div className="dialogue-line" key={`${line.speaker}-${index}`}>
            <strong>{line.speaker}</strong>
            <p>
              {line.kk && (
                <span className="kk-line with-audio">
                  <span>{line.kk}</span>
                  <PronounceButton text={line.kk} compact />
                </span>
              )}
              {line.uk}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
