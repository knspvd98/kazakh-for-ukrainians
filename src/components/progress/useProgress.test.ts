import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { nextReview, normalizeImportedState, useProgress } from "./useProgress";

describe("learner progress", () => {
  it("accepts older backups and rejects corrupt nested fields", () => {
    expect(normalizeImportedState({completedLessons:["lesson-1"]}).reviewStats).toEqual({});
    for (const state of [{}, {taskResults:{x:"false"}}, {completedSections:{x:4}},
                         {reviewStats:{x:{due:"never",correct:-1}}}]) {
      expect(() => normalizeImportedState(state)).toThrow();
    }
  });
  it("retains progress in memory when storage is full", () => {
    const write = vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => { throw new Error("quota"); });
    try {
      const hook = renderHook(() => useProgress());
      act(() => hook.result.current.completeLesson("lesson-3"));
      expect(hook.result.current.storageError).toBe(true);
      expect(hook.result.current.state.completedLessons).toContain("lesson-3");
    } finally { write.mockRestore(); }
  });
  it("brings a missed card back earlier than a recalled card", () => {
    const first = nextReview(undefined, "good", 0);
    expect(Date.parse(first.due)).toBe(86400000);
    const retry = nextReview(first, "again", 0);
    expect(retry).toMatchObject({mastery:0, correct:1, wrong:1});
    expect(Date.parse(retry.due)).toBe(600000);
  });
});
