import { AppRoute } from "../../app/routes";
import { courseBlocks } from "../../data/courseStructure";
import { lessons } from "../../data/lessons";
import type { Lesson } from "../../types/course";
import { useEffect, useState } from "react";

export function CourseSidebar({ currentLesson, setRoute }: { currentLesson: Lesson; setRoute: (route: AppRoute) => void }) {
  const [expandedBlock, setExpandedBlock] = useState(currentLesson.blockId);

  useEffect(() => {
    setExpandedBlock(currentLesson.blockId);
  }, [currentLesson.blockId]);

  return (
    <aside className="course-sidebar">
      <h2>Зміст курсу / Курс мазмұны</h2>
      {courseBlocks.map((block) => (
        <section className="course-sidebar-block" key={block.id}>
          <button className="course-sidebar-summary" onClick={() => setExpandedBlock(expandedBlock === block.id ? "" : block.id)}>
            {block.title.replace(/^Блок \d+\. /, "")}
          </button>
          {expandedBlock === block.id && (
            <div className="sidebar-lessons">
              {block.lessonIds.map((id) => {
                const lesson = lessons.find((item) => item.id === id)!;
                return <button key={id} className={lesson.id === currentLesson.id ? "active" : ""} onClick={() => setRoute({ view: "lesson", lessonId: id })}>{lesson.number}. {lesson.title}</button>;
              })}
            </div>
          )}
        </section>
      ))}
    </aside>
  );
}
