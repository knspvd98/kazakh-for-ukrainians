import { useMemo, useState } from "react";
import { endingTables } from "../../data/endingTables";
import type { EndingTable } from "../../types/grammar";
import { PronounceButton } from "../common/PronounceButton";

const tableGroups = [
  { id: "noun", title: "Іменник / Зат есім", description: "Множина й належність.", tableIds: ["t-plural", "t-possessive"] },
  { id: "cases", title: "Відмінкові форми / Септіктер", description: "Казахські форми місця, напрямку, джерела, об’єкта, засобу й належності.", tableIds: ["t-locative", "t-dative", "t-ablative", "t-accusative", "t-instrumental", "t-genitive"] },
  { id: "sentence", title: "Речення / Сөйлем", description: "Особові закінчення, питання й заперечення.", tableIds: ["t-personal-endings", "t-question-particles", "t-negation"] },
  { id: "suffixes", title: "Суфікси / Жұрнақтар", description: "Корисні словотвірні частини.", tableIds: ["t-useful-suffixes"] }
];

export function EndingTablesPage({ selectedId }: { selectedId?: string }) {
  const initialGroup = tableGroups.find((group) => group.tableIds.includes(selectedId ?? "")) ?? tableGroups[0];
  const [groupId, setGroupId] = useState(initialGroup.id);
  const activeGroup = tableGroups.find((group) => group.id === groupId) ?? tableGroups[0];
  const groupTables = activeGroup.tableIds.map((id) => endingTables.find((table) => table.id === id)).filter(Boolean) as EndingTable[];
  const [activeId, setActiveId] = useState((groupTables.find((table) => table.id === selectedId) ?? groupTables[0] ?? endingTables[0]).id);
  const active = useMemo(() => {
    if (!activeGroup.tableIds.includes(activeId)) return groupTables[0] ?? endingTables[0];
    return endingTables.find((table) => table.id === activeId) ?? endingTables[0];
  }, [activeGroup.tableIds, activeId, groupTables]);

  return (
    <main className="page tables-page">
      <div className="page-title grammar-title">
        <p className="section-kicker">Кестелер</p>
        <h1>Таблиці / Кестелер</h1>
        <p>Тут таблиці згруповані як шпаргалки. Септіктер відкриваються разом, але кожна форма має окрему сторінку з умовами вибору, прикладами й помилками.</p>
      </div>

      <nav className="grammar-group-grid table-group-grid" aria-label="Групи таблиць">
        {tableGroups.map((group) => (
          <button
            key={group.id}
            className={group.id === activeGroup.id ? "active" : ""}
            onClick={() => {
              setGroupId(group.id);
              setActiveId(group.tableIds[0]);
            }}
          >
            <strong>{group.title}</strong>
            <span>{group.description}</span>
          </button>
        ))}
      </nav>

      <section className="ending-choice-guide" aria-label="Як обрати варіант закінчення">
        <header><span>Швидка опора / Жылдам көмек</span><h2>Два сигнали для вибору закінчення</h2></header>
        <div>
          <article><strong>1. Останній голосний</strong><p><b>а, о, ұ, ы</b> ведуть до твердого ряду; <b>ә, ө, ү, і, е</b> — до м’якого. Так обираємо голосний усередині закінчення: қала<b>да</b>, үй<b>де</b>.</p></article>
          <article><strong>2. Останній звук</strong><p>Він підказує початковий приголосний варіанта: після глухого <b>п</b> маємо мектеп<b>те</b>, мектеп<b>ке</b>, мектеп<b>тен</b>; після голосного — қала<b>да</b>, қала<b>ға</b>, қала<b>дан</b>.</p></article>
          <article><strong>Перевірка цілою формою</strong><p>Не вчи закінчення без основи. Прочитай пару вголос і зістав функцію: үй<b>де</b> — де?, үй<b>ге</b> — куди?, үй<b>ден</b> — звідки?</p></article>
        </div>
      </section>

      <section className="grammar-workspace">
        <aside className="grammar-topic-list table-topic-list">
          <h2>{activeGroup.title}</h2>
          <p>{activeGroup.description}</p>
          <div>
            {groupTables.map((table) => (
              <button key={table.id} className={table.id === active.id ? "active" : ""} onClick={() => setActiveId(table.id)}>
                <span>{table.category} / {table.categoryKk}</span>
                <strong>{table.title}</strong>
                <small>{table.titleKk}</small>
              </button>
            ))}
          </div>
        </aside>

        <article className="grammar-detail-page table-detail-page">
          <header>
            <span>{active.category} / {active.categoryKk}</span>
            <h2>{active.title}</h2>
            <strong className="model-line">{active.titleKk}</strong>
            <p>{active.shortExplanation}</p>
          </header>

          <section className="grammar-section">
            <h3>Варіанти / Нұсқалар</h3>
            <div className="table-wrap">
              <table>
                <thead><tr>{active.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                <tbody>{active.rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="grammar-section">
            <h3>Приклади / Мысалдар</h3>
            <div className="example-strip">{active.examples.map((example) => <div key={example.kk}><span className="grammar-example-line"><b>{example.kk}</b><PronounceButton text={example.kk} compact /></span><small>{example.uk}</small></div>)}</div>
          </section>

          <section className="grammar-section">
            <h3>Типові помилки / Қателер</h3>
            <div className="mistake-list">
              {active.mistakes.map((mistake) => (
                <div key={`${mistake.wrong}-${mistake.correct}`}>
                  <del>{mistake.wrong}</del>
                  <b>{mistake.correct}</b>
                  <p>{mistake.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </section>
    </main>
  );
}
