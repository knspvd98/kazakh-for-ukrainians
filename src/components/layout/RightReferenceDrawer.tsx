import type { Lesson } from "../../types/course";
import { grammarById } from "../../data/grammar";
import { vocabulary } from "../../data/vocabulary";
import { PronounceButton } from "../common/PronounceButton";

export function RightReferenceDrawer({ open, onClose, lesson }: { open: boolean; onClose: () => void; lesson: Lesson }) {
  const words = lesson.vocabularyIds.map((id) => vocabulary.find((item) => item.id === id)).filter(Boolean).slice(0, 14);
  const rules = lesson.grammarLinks.map((id) => grammarById[id]).filter(Boolean);
  return (
    <aside className={open ? "reference-drawer open" : "reference-drawer"}>
      <div className="drawer-head"><h2>Довідка уроку</h2><button onClick={onClose}>Закрити</button></div>
      <h3>Правила</h3>
      {rules.map((rule) => <article key={rule.id} className="drawer-item"><strong>{rule.title}</strong><p>{rule.model}</p></article>)}
      <h3>Слова</h3>
      {words.map((word) => word && (
        <article key={word.id} className="drawer-item">
          <span className="kazakh-audio-line"><strong>{word.kk}</strong><PronounceButton text={word.kk} compact /></span>
          <p>{word.uk}</p>
        </article>
      ))}
    </aside>
  );
}
