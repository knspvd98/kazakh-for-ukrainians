import { useMemo, useState } from "react";
import { AppRoute } from "../../app/routes";
import { vocabulary } from "../../data/vocabulary";
import { grammarById } from "../../data/grammar";
import { PronounceButton } from "../common/PronounceButton";

export function VocabularyPage({ selectedId, setRoute }: { selectedId?: string; setRoute: (route: AppRoute) => void }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("Усі теми");
  const [level, setLevel] = useState("Усі рівні");
  const themes = useMemo(() => ["Усі теми", ...Array.from(new Set(vocabulary.map((item) => item.theme))).sort((a, b) => a.localeCompare(b, "uk"))], []);
  const filtered = useMemo(() => vocabulary.filter((item) => {
    const haystack = [item.kk, item.uk, item.theme, item.pos].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (theme === "Усі теми" || item.theme === theme) && (level === "Усі рівні" || item.level === level);
  }), [level, query, theme]);
  const selected = vocabulary.find((item) => item.id === selectedId) ?? filtered[0] ?? vocabulary[0];
  return (
    <main className="page vocabulary-page">
      <section className="vocab-list-panel">
        <div>
          <p className="section-kicker">Сөздік</p>
          <h1>Словник / Сөздік</h1>
          <p>Тільки словникові форми: без суфіксів, відмінкових форм і готових фраз.</p>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пошук казахською або українською" />
        <div className="vocab-filter-row">
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>{themes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>{["Усі рівні", "A0", "A1", "A2", "B1"].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="word-list">{filtered.map((entry) => <button key={entry.id} className={entry.id === selected.id ? "active" : ""} onClick={() => setRoute({ view: "vocabulary", wordId: entry.id })}><strong>{entry.kk}</strong><span>{entry.uk}</span><small>{entry.pos}</small></button>)}</div>
      </section>
      <section className="word-detail-panel">
        <span>{selected.level} · {selected.theme}</span>
        <div className="word-title-row">
          <h2>{selected.kk}</h2>
          <PronounceButton text={selected.kk} />
        </div>
        <p className="translation">{selected.uk}</p>
        <div className="word-meta">
          <span>{selected.pos}</span>
          {selected.grammarLinks?.map((link) => <span key={link}>{grammarById[link]?.title ?? "граматика"}</span>)}
        </div>
        {selected.notes && <p>{selected.notes}</p>}
        <h3>Приклади</h3>
        <div className="example-strip vertical">{selected.examples.map((example) => <div key={example.kk}><b>{example.kk}</b><small>{example.uk}</small><PronounceButton text={example.kk} compact /></div>)}</div>
        <button className="primary word-repeat" onClick={() => setRoute({ view: "practice", flashcardWordId: selected.id })}>Повторити / Қайталау</button>
      </section>
    </main>
  );
}
