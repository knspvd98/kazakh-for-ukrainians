import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadArchive, saveArchive } from "./archive";

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
    return raw ? normalizeImportedState(JSON.parse(raw)) : initialState;
  } catch {
    return initialState;
  }
}

type Review = ProgressState["reviewStats"][string];

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function count(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function review(value: unknown): value is Review {
  return record(value) && count(value.correct) && count(value.wrong) &&
    count(value.mastery) && typeof value.due === "string" && Number.isFinite(Date.parse(value.due));
}

function checkedMap<T>(value: unknown, check: (v: unknown) => v is T): Record<string, T> {
  if (value === undefined) return {};
  if (!record(value) || !Object.entries(value).every(([key, item]) =>
    !["constructor", "__proto__", "prototype"].includes(key) && check(item))) {
    throw new Error("Файл містить пошкоджені записи прогресу.");
  }
  return value as Record<string, T>;
}

export function normalizeImportedState(value: unknown): ProgressState {
  if (!record(value) || !Object.keys(initialState).some(key => Object.prototype.hasOwnProperty.call(value, key)) ||
      (value.currentLessonId !== undefined && typeof value.currentLessonId !== "string") ||
      (value.completedLessons !== undefined && !strings(value.completedLessons))) {
    throw new Error("Файл не схожий на експорт прогресу цього курсу.");
  }
  return {
    currentLessonId: typeof value.currentLessonId === "string" ? value.currentLessonId : initialState.currentLessonId,
    completedLessons: [...new Set(value.completedLessons ?? [])],
    completedSections: checkedMap(value.completedSections, strings),
    taskResults: checkedMap(value.taskResults, (v): v is boolean => typeof v === "boolean"),
    reviewStats: checkedMap(value.reviewStats, review)
  };
}

export function nextReview(previous: Review | undefined, result: "again" | "hard" | "good" | "easy", now: number): Review {
  const ok = result === "good" || result === "easy";
  const mastery = ok ? Math.min(6, (previous?.mastery ?? 0) + (result === "easy" ? 2 : 1)) : 0;
  const minutes = ok ? [0, 1, 3, 7, 14, 30, 60][mastery] * 1440 : result === "again" ? 10 : 60;
  return { mastery, due: new Date(now + minutes * 60000).toISOString(),
    correct: (previous?.correct ?? 0) + Number(ok), wrong: (previous?.wrong ?? 0) + Number(!ok) };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadState());
  const [storageError, setStorageError] = useState(false);
  const edits = useRef(0);
  useEffect(() => {
    let active=true;
    void loadArchive().then(value=>{
      if (!active || edits.current || value===undefined) return;
      if (!record(value) || typeof value.savedAt !== "number") return;
      let localTime=0;
      try {
        const local=JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if(local) { normalizeImportedState(local); localTime=Number(local.savedAt)||0; }
      } catch { /* The backup can recover an unreadable local snapshot. */ }
      if (value.savedAt>localTime) setState(normalizeImportedState(value.state));
    }).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  const save = useCallback((next: ProgressState) => {
    const version=++edits.current;
    const savedAt=Date.now();
    let stored=false;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({...next,savedAt}));
      stored=true;
      setStorageError(false);
    } catch { setStorageError(true); }
    void saveArchive({state:next,savedAt}).then(()=>{if(edits.current===version)setStorageError(false);})
      .catch(()=>{if(edits.current===version&&!stored)setStorageError(true);});
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

  const gradeCard = useCallback((id: string, result: "again" | "hard" | "good" | "easy") => {
    save({ ...state, taskResults: { ...state.taskResults, [`flashcard-${id}`]: result === "good" || result === "easy" },
      reviewStats: { ...state.reviewStats, [id]: nextReview(state.reviewStats[id], result, Date.now()) } });
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

  return useMemo(() => ({ state, gradeCard, storageError, markSection, completeLesson, answerTask, exportProgress, importProgress, reset }), [gradeCard, storageError, answerTask, completeLesson, exportProgress, importProgress, markSection, reset, state]);
}
