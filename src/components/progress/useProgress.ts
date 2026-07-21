import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "kazakh_ukrainian_react_course_progress_v1";

export type ProgressState = {
  currentLessonId: string;
  completedLessons: string[];
  completedSections: Record<string, string[]>;
  taskResults: Record<string, boolean>;
  reviewStats: Record<string, { mastery: number; due: string; correct: number; wrong: number }>;
};

const initialState: ProgressState = {
  currentLessonId: "lesson-1",
  completedLessons: [],
  completedSections: {},
  taskResults: {},
  reviewStats: {}
};

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

function normalizeImportedState(value: unknown): ProgressState {
  if (!value || typeof value !== "object") {
    throw new Error("Файл не схожий на експорт прогресу цього курсу.");
  }
  const candidate = value as Partial<ProgressState>;
  return {
    currentLessonId: typeof candidate.currentLessonId === "string" ? candidate.currentLessonId : initialState.currentLessonId,
    completedLessons: Array.isArray(candidate.completedLessons) ? candidate.completedLessons.filter((item): item is string => typeof item === "string") : [],
    completedSections: candidate.completedSections && typeof candidate.completedSections === "object" ? candidate.completedSections as ProgressState["completedSections"] : {},
    taskResults: candidate.taskResults && typeof candidate.taskResults === "object" ? candidate.taskResults as ProgressState["taskResults"] : {},
    reviewStats: candidate.reviewStats && typeof candidate.reviewStats === "object" ? candidate.reviewStats as ProgressState["reviewStats"] : {}
  };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadState());
  const save = useCallback((next: ProgressState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const markSection = useCallback((lessonId: string, sectionId: string) => {
    const set = new Set(state.completedSections[lessonId] ?? []);
    set.add(sectionId);
    save({ ...state, currentLessonId: lessonId, completedSections: { ...state.completedSections, [lessonId]: [...set] } });
  }, [save, state]);

  const completeLesson = useCallback((lessonId: string) => {
    const completed = new Set(state.completedLessons);
    completed.add(lessonId);
    save({ ...state, currentLessonId: lessonId, completedLessons: [...completed] });
  }, [save, state]);

  const answerTask = useCallback((taskId: string, ok: boolean) => {
    save({ ...state, taskResults: { ...state.taskResults, [taskId]: ok } });
  }, [save, state]);

  const exportProgress = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kazakh-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const reset = useCallback(() => save(initialState), [save]);
  const importProgress = useCallback((file: File) => new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        save(normalizeImportedState(parsed));
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Не вдалося прочитати JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Не вдалося відкрити файл."));
    reader.readAsText(file);
  }), [save]);

  return useMemo(() => ({ state, markSection, completeLesson, answerTask, exportProgress, importProgress, reset }), [answerTask, completeLesson, exportProgress, importProgress, markSection, reset, state]);
}
