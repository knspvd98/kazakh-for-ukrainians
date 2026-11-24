import { describe, expect, it } from "vitest";

import {
  isCompleteKazakhAudioText,
  looksLikeKazakhText
} from "./kazakhText";

describe("Kazakh text detection", () => {
  it("recognises complete Kazakh words and phrases", () => {
    expect(looksLikeKazakhText("Қазақ тілі")).toBe(true);
    expect(isCompleteKazakhAudioText("Сәлем! Қалайсың?")).toBe(true);
  });

  it("rejects Ukrainian explanations and isolated suffixes", () => {
    expect(isCompleteKazakhAudioText("після голосного")).toBe(false);
    expect(isCompleteKazakhAudioText("лар")).toBe(false);
  });

  it("rejects mixed script and notation fragments", () => {
    expect(isCompleteKazakhAudioText("Қазақша test")).toBe(false);
    expect(isCompleteKazakhAudioText("үй → үйде")).toBe(false);
  });
});
