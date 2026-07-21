import type { LessonSection, LessonVisual } from "../../types/course";
import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  BookOpen,
  Blocks,
  BusFront,
  CalendarDays,
  CircleHelp,
  CloudSun,
  Coffee,
  Cross,
  Ear,
  Heart,
  House,
  Lightbulb,
  Map,
  MapPin,
  MessageCircleQuestion,
  NotebookPen,
  PackageCheck,
  PenLine,
  ScanText,
  ShoppingBag,
  SunMedium,
  UsersRound,
  UserRound
} from "lucide-react";
import { PronounceButton } from "../common/PronounceButton";
import { isCompleteKazakhAudioText } from "../common/kazakhText";

export function ConceptExplanation({ section }: { section: Extract<LessonSection, { kind: "concept" }> }) {
  const blocks = section.body.map((paragraph) => parseLectureBlock(paragraph));
  return (
    <section className="reader-section concept-section">
      <span className="section-kicker">{section.title}</span>
      <h2>{section.headline}</h2>
      <div className="lecture-flow">
        {renderLectureBlocks(blocks, section.visual)}
      </div>
    </section>
  );
}

type LectureBlock =
  | { type: "heading"; title: string }
  | { type: "scheme"; title: string; steps: string[] }
  | { type: "table"; title: string; headers: string[]; rows: string[][] }
  | { type: "compare"; leftTitle: string; left: string; rightTitle: string; right: string }
  | { type: "mistake"; title: string; wrong: string; fixTitle: string; fix: string }
  | { type: "note"; title: string; body: string }
  | { type: "paragraph"; body: string };

function parseLectureBlock(text: string): LectureBlock {
  if (text.startsWith("## ")) return { type: "heading", title: text.slice(3) };
  if (text.startsWith("SCHEME|")) {
    const [, title, ...steps] = text.split("|");
    return { type: "scheme", title, steps };
  }
  if (text.startsWith("TABLE|")) {
    const [, title, headerLine, ...rowLines] = text.split("|");
    return {
      type: "table",
      title,
      headers: headerLine.split("~"),
      rows: rowLines.map((row) => row.split("~"))
    };
  }
  if (text.startsWith("COMPARE|")) {
    const [, leftTitle, left, rightTitle, right] = text.split("|");
    return { type: "compare", leftTitle, left, rightTitle, right };
  }
  if (text.startsWith("MISTAKE|")) {
    const [, title, wrong, fixTitle, fix] = text.split("|");
    return { type: "mistake", title, wrong, fixTitle, fix };
  }
  if (text.startsWith("NOTE|")) {
    const [, title, ...body] = text.split("|");
    return { type: "note", title, body: body.join("|") };
  }
  return { type: "paragraph", body: text };
}

function renderLectureBlocks(blocks: LectureBlock[], visual?: Extract<LessonSection, { kind: "concept" }>["visual"]) {
  const output: ReactElement[] = [];
  let prose: string[] = [];
  let visualInserted = false;

  const flushProse = () => {
    if (!prose.length) return;
    output.push(
      <div className="lecture-prose" key={`prose-${output.length}`}>
        {prose.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)}
      </div>
    );
    if (visual && !visualInserted) {
      output.push(<ConceptVisual key={`visual-${visual}`} visual={visual} />);
      visualInserted = true;
    }
    prose = [];
  };

  blocks.forEach((block, index) => {
    if (block.type === "paragraph") {
      prose.push(block.body);
      return;
    }
    flushProse();
    output.push(renderLectureBlock(block, index));
  });
  flushProse();
  return output;
}

const visualIcons: Record<NonNullable<LessonVisual["objects"]>[number]["icon"], LucideIcon> = {
  book: BookOpen,
  blocks: Blocks,
  pen: PenLine,
  letters: ScanText,
  ear: Ear,
  cup: Coffee,
  pin: MapPin,
  arrow: MapPin,
  person: UserRound,
  people: UsersRound,
  map: Map,
  home: House,
  bus: BusFront,
  bike: Bike,
  clock: NotebookPen,
  calendar: CalendarDays,
  bag: ShoppingBag,
  heart: Heart,
  help: CircleHelp,
  menu: NotebookPen,
  receipt: PackageCheck,
  cloud: CloudSun,
  sun: SunMedium,
  cross: Cross,
  chat: MessageCircleQuestion,
  lightbulb: Lightbulb
};

const lessonIllustrations = import.meta.glob("../../assets/lesson-*.png", {
  eager: true,
  import: "default"
}) as Record<string, string>;

function ConceptVisual({ visual }: { visual: NonNullable<Extract<LessonSection, { kind: "concept" }>["visual"]> }) {
  const objects = visual.objects ?? [];
  const imageKey = `../../assets/lesson-${String(visual.lessonNumber).padStart(2, "0")}.png`;
  const imageSource = lessonIllustrations[imageKey];
  return (
    <>
      {imageSource && (
        <figure className="lesson-illustration">
          <img src={imageSource} alt={visual.alt} />
        </figure>
      )}
      <section className={`lesson-visual lesson-visual-${visual.scene ?? "language-map"}`} aria-label={visual.alt}>
        <div className="lesson-visual-stage">
          <div className="visual-example-block">
            <span className="visual-stage-kicker">Приклад у фокусі</span>
            <strong lang="kk">{visual.example}</strong>
            <p>{visual.meaning}</p>
            {visual.contrast && (
              <div className="visual-contrast" aria-label={visual.contrast.label}>
                <span>{visual.contrast.before}</span>
                <i aria-hidden="true">→</i>
                <strong lang="kk">{visual.contrast.after}</strong>
              </div>
            )}
          </div>
          {visual.teaching && (
            <div className="visual-teaching">
              <span className="visual-stage-kicker">Як це працює</span>
              <h3>{visual.teaching.title}</h3>
              <ol>
                {visual.teaching.steps.map((step, index) => (
                  <li
                    className={step.kk.length > 24 || step.uk.length > 92 ? "visual-teaching-step is-wide" : "visual-teaching-step"}
                    key={`${step.kk}-${index}`}
                  >
                    <span className="visual-teaching-form">
                      <strong lang="kk">{step.kk}</strong>
                      {isCompleteKazakhAudioText(step.kk) && <PronounceButton text={step.kk} compact />}
                    </span>
                    <span className="visual-teaching-explanation">{step.uk}</span>
                  </li>
                ))}
              </ol>
              <p>{visual.teaching.takeaway}</p>
            </div>
          )}
          <div className="visual-object-row">
            {objects.map((object) => {
              const Icon = visualIcons[object.icon];
              return (
                <div className="visual-object" key={`${object.icon}-${object.label}`}>
                  <Icon aria-hidden="true" />
                  <span>{object.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <footer className="lesson-visual-caption">
          <span>{visual.eyebrow}</span>
          <strong>{visual.title}</strong>
        </footer>
      </section>
    </>
  );
}

function renderLectureBlock(block: LectureBlock, index: number) {
  if (block.type === "heading") return <h3 className="lecture-heading" key={`${block.title}-${index}`}>{block.title}</h3>;
  if (block.type === "scheme") {
    return (
      <div className="lecture-scheme" key={`${block.title}-${index}`}>
        <strong>{block.title}</strong>
        <ol>
          {block.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>
    );
  }
  if (block.type === "table") {
    return (
      <div className="lecture-table-block" key={`${block.title}-${index}`}>
        <strong className="lecture-table-title">{block.title}</strong>
        <div className="lecture-table-scroll">
          <table>
            <thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${row.join("-")}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`}>
                      {cellIndex === 0 ? (
                        <span className="lecture-table-kazakh" lang="kk">
                          <span>{cell}</span>
                          {isCompleteKazakhAudioText(cell) && <PronounceButton text={cell} compact />}
                        </span>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (block.type === "compare") {
    return (
      <div className="lecture-compare" key={`${block.leftTitle}-${index}`}>
        <article><span>{block.leftTitle}</span><p>{block.left}</p></article>
        <article><span>{block.rightTitle}</span><p>{block.right}</p></article>
      </div>
    );
  }
  if (block.type === "mistake") {
    return (
      <div className="lecture-mistake" key={`${block.title}-${index}`}>
        <article><span>{block.title}</span><p>{block.wrong}</p></article>
        <article><span>{block.fixTitle}</span><p>{block.fix}</p></article>
      </div>
    );
  }
  if (block.type === "note") {
    return (
      <aside className="lecture-note" key={`${block.title}-${index}`}>
        <strong>{block.title}</strong>
        <p>{block.body}</p>
      </aside>
    );
  }
  return <p key={`${block.body}-${index}`}>{block.body}</p>;
}
