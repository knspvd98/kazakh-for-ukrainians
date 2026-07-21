import { useState } from "react";
import type { MorphemePart } from "../../types/course";
import { PronounceButton } from "../common/PronounceButton";

const roleLabels: Record<string, string> = {
  root: "корінь",
  plural: "множина",
  possessive: "належність",
  case: "відмінок",
  verb: "дієслівна частина",
  question: "питання",
  negative: "заперечення",
  suffix: "суфікс"
};

export function MorphemeBreakdown({ parts, fullForm, fullMeaning }: { parts: MorphemePart[]; fullForm: string; fullMeaning: string }) {
  const [active, setActive] = useState(0);
  const current = parts[active];
  return (
    <div className="morpheme-card">
      <div className="morpheme-track">
        {parts.map((part, index) => (
          <button key={`${part.text}-${index}`} className={`morpheme-token ${part.role} ${index === active ? "active" : ""}`} onClick={() => setActive(index)}>
            <strong>{part.text}</strong><span>{roleLabels[part.role]}</span>
          </button>
        ))}
      </div>
      <div className="morpheme-detail">
        <div>
          <span>Форма</span>
          <span className="kazakh-audio-line">
            <strong>{fullForm}</strong>
            <PronounceButton text={fullForm} compact />
          </span>
        </div>
        <div><span>Значення</span><strong>{fullMeaning}</strong></div>
        <div><span>Активна частина</span><strong>{current.text} — {current.meaning}</strong><p>{current.label}</p></div>
      </div>
    </div>
  );
}
