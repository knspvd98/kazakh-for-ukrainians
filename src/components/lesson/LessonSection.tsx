import type { LessonSection as LessonSectionType } from "../../types/course";
import { ConceptExplanation } from "./ConceptExplanation";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { DialogueBlock } from "./DialogueBlock";
import { ExampleBlock } from "./ExampleBlock";
import { PracticeBlock } from "./PracticeBlock";
import { ReviewBlock } from "./ReviewBlock";
import { vocabulary } from "../../data/vocabulary";
import { grammarById } from "../../data/grammar";
import { endingTables } from "../../data/endingTables";
import type { useProgress } from "../progress/useProgress";
import { PronounceButton } from "../common/PronounceButton";

type ProgressApi = ReturnType<typeof useProgress>;

export function LessonSection({ section, progress }: { section: LessonSectionType; progress: ProgressApi }) {
  if (section.kind === "why" || section.kind === "situation") {
    return <section className="reader-section"><h2>{section.title}</h2>{section.body.map((p) => <p key={p}>{p}</p>)}</section>;
  }
  if (section.kind === "concept") return <ConceptExplanation section={section} />;
  if (section.kind === "model") {
    return <section className="reader-section"><h2>{section.title}</h2>{section.body.map((p) => <p key={p}>{p}</p>)}<MorphemeBreakdown parts={section.morphemes} fullForm={section.fullForm} fullMeaning={section.fullMeaning} /></section>;
  }
  if (section.kind === "examples") return <ExampleBlock title={section.title} intro={section.intro} examples={section.examples} />;
  if (section.kind === "dialogue") return <DialogueBlock title={section.title} lines={section.lines} />;
  if (section.kind === "vocabulary") {
    const words = section.vocabularyIds.map((id) => vocabulary.find((entry) => entry.id === id)).filter(Boolean);
    return <section className="reader-section"><h2>{section.title}</h2><div className="lesson-word-grid">{words.map((word) => word && <article key={word.id} className="lesson-word"><span className="kazakh-audio-line"><strong>{word.kk}</strong><PronounceButton text={word.kk} compact /></span><span>{word.uk}</span><small>{word.theme}</small></article>)}</div></section>;
  }
  if (section.kind === "grammar") {
    const rules = section.grammarIds.map((id) => grammarById[id]).filter(Boolean);
    const tables = (section.tableIds ?? []).map((id) => endingTables.find((table) => table.id === id)).filter(Boolean);
    return <section className="reader-section"><h2>{section.title}</h2>{rules.map((rule) => <article key={rule.id} className="grammar-insert"><h3>{rule.title}</h3><p>{rule.explanation[0]}</p><span className="grammar-model"><strong>{rule.model}</strong></span></article>)}{tables.map((table) => table && <article key={table.id} className="table-insert"><h3>{table.title} / <em>{table.titleKk}</em></h3><p>{table.shortExplanation}</p><div className="mini-table">{table.rows.map((row) => <div key={row.join("-")}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div></article>)}</section>;
  }
  if (section.kind === "practice") return <PracticeBlock title={section.title} exerciseIds={section.exerciseIds} progress={progress} />;
  if (section.kind === "review") return <ReviewBlock section={section} />;
  return null;
}
