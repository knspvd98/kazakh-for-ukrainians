import { useState } from "react";

export function MorphemeBuilder({ blocks, answer }: { blocks: string[]; answer: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const ok = selected.length === answer.length && selected.every((item, index) => item === answer[index]);
  return (
    <div className="builder">
      <div className="builder-bank">
        {blocks.map((block) => <button key={block} onClick={() => setSelected((prev) => [...prev, block])}>{block}</button>)}
      </div>
      <div className="builder-line">{selected.map((block, index) => <span key={`${block}-${index}`}>{block}</span>)}</div>
      <div className={ok ? "feedback ok" : "feedback"}>{selected.length ? ok ? "Порядок правильний." : "Перевір порядок частин." : "Обери частини в потрібному порядку."}</div>
      <button className="secondary" onClick={() => setSelected([])}>Очистити</button>
    </div>
  );
}
