import { useMemo, useState } from "react";
import { phrases } from "../../data/phrases";
import { PronounceButton } from "../common/PronounceButton";

export function PhrasebookPage({ category }: { category?: string }) {
  const categories = [...new Set(phrases.map((phrase) => phrase.category))];
  const [active, setActive] = useState(category ?? categories[0]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => phrases.filter((phrase) => phrase.category === active && [phrase.kk, phrase.uk, phrase.category].join(" ").toLowerCase().includes(query.toLowerCase())), [active, query]);
  const showingChunks = active.includes("чанки");
  return (
    <main className="page phrase-page">
      <aside className="reference-index phrase-index">
        <h2>Фрази / Үлгілер</h2>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пошук фрази" />
        {categories.map((item) => <button className={item === active ? "active" : ""} key={item} onClick={() => setActive(item)}>{item}</button>)}
      </aside>
      <section className="reference-content">
        <header className="phrase-heading">
          <p className="section-kicker">Сөйлеу үлгілері</p>
          <h1>Фразник / Сөйлеу үлгілері</h1>
          <p>{showingChunks
            ? "Короткі опори, з яких можна швидко розгорнути власну репліку. Вони показані тільки в цьому розділі."
            : "Часті природні репліки для конкретної ситуації. Окремі слова залишаються у словнику / сөздік."}</p>
        </header>
        <div className="phrase-category-heading">
          <div><span>Поточна добірка</span><h2>{active}</h2></div>
          <strong>{filtered.length} {filtered.length === 1 ? "репліка" : "реплік"}</strong>
        </div>
        <div className="phrase-list">
          {filtered.map((phrase) => {
            const dialogue = parsePhraseDialogue(phrase.kk);
            return (
              <article className={dialogue.length ? "phrase-card dialogue-phrase-card" : "phrase-card"} key={phrase.id}>
                {dialogue.length ? (
                  <div className="phrase-dialogue-lines">
                    {dialogue.map((line, index) => (
                      <div key={`${phrase.id}-${index}`} className={line.speaker === "Диас" ? "dias" : "alina"}>
                        <b>{line.speaker}</b>
                        <span>{line.text}</span>
                        <PronounceButton text={line.text} compact />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="phrase-main-line">
                    <strong>{phrase.kk}</strong>
                    <PronounceButton text={phrase.kk} compact />
                  </div>
                )}
                <span className="phrase-translation">{phrase.uk}</span>
                <small>{phrase.level}</small>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function parsePhraseDialogue(text: string) {
  if (!/(Диас|Алина):/.test(text)) return [];
  const matches = [...text.matchAll(/(Диас|Алина):\s*([^:]+?)(?=\s+(?:Диас|Алина):|$)/g)];
  return matches.map((match) => ({ speaker: match[1] as "Диас" | "Алина", text: match[2].trim() })).filter((line) => line.text.length > 0);
}
