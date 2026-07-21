import { exercises } from "../../data/exercises";
import type { useProgress } from "../progress/useProgress";
import { ChoiceTask } from "../practice/ChoiceTask";
import { FillBlankTask } from "../practice/FillBlankTask";
import { BuildSentenceTask } from "../practice/BuildSentenceTask";
import { MatchTask } from "../practice/MatchTask";
import { CorrectMistakeTask } from "../practice/CorrectMistakeTask";
import { SelfCheckTask } from "../practice/SelfCheckTask";

type ProgressApi = ReturnType<typeof useProgress>;

export function PracticeBlock({ title, exerciseIds, progress }: { title: string; exerciseIds: string[]; progress: ProgressApi }) {
  const tasks = exerciseIds.map((id) => exercises.find((exercise) => exercise.id === id)).filter(Boolean);
  return (
    <section className="reader-section practice-section">
      <h2>{title}</h2>
      {tasks.map((task) => {
        if (!task) return null;
        if (task.type === "fillBlank") return <FillBlankTask key={task.id} task={task} onAnswer={progress.answerTask} />;
        if (task.type === "buildWord" || task.type === "buildSentence" || task.type === "orderParts") return <BuildSentenceTask key={task.id} task={task} onAnswer={progress.answerTask} />;
        if (task.type === "matchPairs") return <MatchTask key={task.id} task={task} onAnswer={progress.answerTask} />;
        if (task.type === "correctMistake") return <CorrectMistakeTask key={task.id} task={task} onAnswer={progress.answerTask} />;
        if (task.type === "selfCheck") return <SelfCheckTask key={task.id} task={task} onAnswer={progress.answerTask} />;
        return <ChoiceTask key={task.id} task={task} onAnswer={progress.answerTask} />;
      })}
    </section>
  );
}
