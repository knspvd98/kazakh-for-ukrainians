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

  function finish(goNext: boolean) {
    progress.completeLesson(lesson.id);
    if (goNext && nextLesson) setRoute({ view: "lesson", lessonId: nextLesson.id });
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
          <LessonSection key={section.id} section={section} progress={progress} />
        ))}
        <div className="lesson-controls">
          <button className="secondary" onClick={() => finish(false)}>До курсу</button>
          <button className="primary" onClick={() => finish(true)}>{nextLesson ? "Наступний урок" : "Завершити курс"}</button>
        </div>
      </article>
    </main>
  );
}
