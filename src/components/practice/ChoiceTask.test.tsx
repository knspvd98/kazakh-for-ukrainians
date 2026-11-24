import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Exercise } from "../../types/exercises";
import { ChoiceTask } from "./ChoiceTask";

const task: Exercise = {
  id: "choice-1",
  lessonId: "lesson-1",
  type: "choice",
  skill: "meaning",
  prompt: "Оберіть переклад",
  options: ["Привіт", "Дякую"],
  answer: "Привіт",
  feedbackCorrect: "Правильно",
  feedbackWrong: "Спробуйте ще",
  relatedVocabularyIds: [],
  relatedGrammarIds: [],
  reviewed: true
};

describe("ChoiceTask", () => {
  it("reports a correct answer and shows feedback", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ChoiceTask task={task} onAnswer={onAnswer} />);

    await user.click(screen.getByRole("button", { name: "Привіт" }));

    expect(onAnswer).toHaveBeenCalledWith("choice-1", true);
    expect(screen.getByText("Правильно")).toBeInTheDocument();
  });

  it("reports an incorrect answer", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ChoiceTask task={task} onAnswer={onAnswer} />);

    await user.click(screen.getByRole("button", { name: "Дякую" }));

    expect(onAnswer).toHaveBeenCalledWith("choice-1", false);
    expect(screen.getByText("Спробуйте ще")).toBeInTheDocument();
  });
});
