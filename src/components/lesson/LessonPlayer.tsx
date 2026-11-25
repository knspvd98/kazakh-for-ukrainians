import { useEffect } from "react";
import { AppRoute } from "../../app/routes";
import type { Lesson } from "../../types/course";
import { LessonSection } from "./LessonSection";
import type { useProgress } from "../progress/useProgress";
import { lessons } from "../../data/lessons";

type ProgressApi = ReturnType<typeof useProgress>;

export function LessonPlayer({ lesson, setRoute, progress }: { lesson: Lesson; setRoute: (route: AppRoute) => void; progress: ProgressApi }) {
  const nextLesson = lessons.find((item) => item.number === lesson.number + 1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [lesson.id]);

  const read = progress.state.completedSections[lesson.id] ?? [];
  const required = lesson.sections.filter(part => part.kind === "concept" || part.kind === "model");
  const tasks = [...new Set(lesson.sections.flatMap(part => "exerciseIds" in part ? part.exerciseIds : []))];
  const answered = tasks.filter(id=>id in progress.state.taskResults).length;
  const correct = tasks.filter(id=>progress.state.taskResults[id] === true).length;
  const ready = required.every(part=>read.includes(part.id)) && answered===tasks.length && correct>=Math.ceil(tasks.length*.8);
  function finish() {
    if (!ready) return;
    progress.completeLesson(lesson.id);
    if (nextLesson) setRoute({ view: "lesson", lessonId: nextLesson.id });
    else setRoute({ view: "course" });
  }

  return (
    <main className="lesson-main">
      <div className="lesson-header">
        <div className="breadcrumb">Курс → Урок {lesson.number}</div>
        <h1>{lesson.title}</h1>
        <p>{lesson.subtitle}</p>
        <div className="lesson-meta"><span>{lesson.level}</span><span>{lesson.exerciseIds.length} перевірювані завдання</span><span>{lesson.vocabularyIds.length} слів уроку</span></div>
      </div>
      <article className="lesson-reader lesson-flow">
        {lesson.sections.map((section) => (
          <div key={section.id}><LessonSection section={section} progress={progress} />
            {required.some(part=>part.id===section.id) && <button className="secondary" disabled={read.includes(section.id)}
              onClick={()=>progress.markSection(lesson.id,section.id)}>{read.includes(section.id)?"Прочитано":"Позначити цей розділ прочитаним"}</button>}
          </div>
        ))}
        <p role="status">Прочитано розділів: {required.filter(part=>read.includes(part.id)).length}/{required.length}. Виконано завдань: {answered}/{tasks.length}. Правильних відповідей: {correct}. Для завершення прочитай основні розділи, виконай усі завдання й дай щонайменше {Math.ceil(tasks.length*.8)} правильних відповідей. Можна повторити окреме завдання.</p>
        <div className="lesson-controls">
          <button className="secondary" onClick={() => setRoute({view:"course"})}>До курсу</button>
          <button className="primary" disabled={!ready} onClick={finish}>{nextLesson ? "Наступний урок" : "Завершити курс"}</button>
        </div>
      </article>
    </main>
  );
}
