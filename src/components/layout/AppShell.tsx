import { ReactNode, useState } from "react";
import { AppRoute } from "../../app/routes";
import type { Lesson } from "../../types/course";
import { TopBar } from "./TopBar";
import { CourseSidebar } from "./CourseSidebar";
import { RightReferenceDrawer } from "./RightReferenceDrawer";

export function AppShell({ route, setRoute, currentLesson, children }: { route: AppRoute; setRoute: (route: AppRoute) => void; currentLesson: Lesson; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(true);
  const showCourseSidebar = route.view === "lesson";
  return (
    <>
      <TopBar route={route} setRoute={setRoute} onOpenDrawer={() => setDrawerOpen(true)} />
      <div className={[
        "app-layout",
        showCourseSidebar ? "with-course-sidebar" : "",
        showCourseSidebar && !courseSidebarOpen ? "sidebar-collapsed" : ""
      ].filter(Boolean).join(" ")}>
        {showCourseSidebar && (
          <button
            className="course-sidebar-toggle"
            type="button"
            aria-expanded={courseSidebarOpen}
            onClick={() => setCourseSidebarOpen((open) => !open)}
          >
            <span>{courseSidebarOpen ? "Сховати зміст" : "Показати зміст"}</span>
          </button>
        )}
        {showCourseSidebar && <CourseSidebar currentLesson={currentLesson} setRoute={setRoute} />}
        {children}
      </div>
      <RightReferenceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} lesson={currentLesson} />
    </>
  );
}
