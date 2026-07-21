import { lessons } from "../../data/lessons";
import { vocabulary } from "../../data/vocabulary";
import { phrases } from "../../data/phrases";
import { exercises } from "../../data/exercises";
import { grammarArticles } from "../../data/grammar";
import { endingTables } from "../../data/endingTables";
import { LINGUISTIC_QA_NOTES } from "../../data/linguisticQa";
import { vocabularyTypeLabels } from "../../types/vocabulary";
import { isCompleteKazakhAudioText } from "../common/kazakhText";

const badFragments = [
  "Маған ата керек",
  "Маған ауыл керек",
  "Маған аға керек",
  "аға бар",
  "аға жоқ",
  "Айту.",
  "Бұл рахмет",
  "Бұл керек",
  "Бұл є су",
  "Це є вода",
  "без окремого “є”",
  "без окремого «є»",
  "окреме слово “є”",
  "окреме слово «є»"
];
const russianSignals = ["Потому что", "таблицы и правила", "русский язык", "Казахский язык", "выучил названия", "привет", "счет"];
const englishVisibleSignals = ["compactChoice", "morphemeBreakdown", "selfCheck", "word", "phrase", "suffix"];
const sourceMentionSignals = ["цей курс створено за", "курс спирається на", "адаптовано з підручника", "PDF", "джерело курсу"];
const publicEditorialSignals = ["варто перевіряти носієм", "потребує носія", "природність потребує", "needs_native_review", "alternative_needed"];
const fallbackDialogueSignals = ["Осы сөйлемдегі үлгіні көрдің бе?", "Бұл жақсы мысал.", "Жақсы. Енді осы үлгімен жаңа сөйлем құра."];
const ukrainianWordsInKazakhDialogue = ["казахська", "казахською", "у наших", "книжках", "книжки", "коханий", "кохана", "привіт", "добре", "правильно"];
const metaDialogueSignals = ["кесте", "сценарий:", "Бірінші сценарий", "Екінші сценарий", "Үшінші сценарий", "повний сценарій", "таблиця", "підготовка до", "зв’язок видно", "әрекетке келеді", "үлгіні көрдің бе"];
const russianCaseTermSignals = ["падеж", "падежі", "падежів"];
const metaExerciseSignals = [
  "Виправ навчальну помилку",
  "навчальної логіки",
  "спершу таблиця",
  "потім приклад",
  "після прикладу, коли модель",
  "порядок роботи з новою формою",
  "найкращу стратегію",
  "порядок аналізу"
];
const forbiddenAudioCandidates = [
  "після з, ж, ғ, л, м, н, ң",
  "-лар / -лер",
  "қала + да",
  "сәлем [sælem]",
  "м, н, ң та дзвінкого",
  "не замінюй қ звичним к",
  "для ө губи округлені, а язик просунутий уперед",
  "маған ... керек",
  "мен, сен, сіз, ол",
  "жоқ, емес, керек емес",
  "қала-да",
  "оқы-"
];

function countWords(text: string) {
  return text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

function sectionText(section: (typeof lessons)[number]["sections"][number]) {
  if (section.kind === "why" || section.kind === "situation" || section.kind === "concept") {
    return [section.title, "headline" in section ? section.headline : "", ...section.body].join(" ");
  }
  if (section.kind === "model") {
    return [
      section.title,
      ...section.body,
      section.fullForm,
      section.fullMeaning,
      ...section.morphemes.flatMap((part) => [part.text, part.label, part.meaning])
    ].join(" ");
  }
  if (section.kind === "examples") {
    return [
      section.title,
      section.intro ?? "",
      ...section.examples.flatMap((example) => [example.kk, example.uk, example.note ?? ""])
    ].join(" ");
  }
  if (section.kind === "dialogue") {
    return [section.title, ...section.lines.flatMap((line) => [line.speaker, line.kk ?? "", line.uk])].join(" ");
  }
  if (section.kind === "review") {
    return [section.title, ...section.prompts, section.next].join(" ");
  }
  if (section.kind === "vocabulary" || section.kind === "grammar") return section.title;
  if (section.kind === "practice") return section.title;
  return "";
}

function lessonTextWordCount(lesson: (typeof lessons)[number]) {
  return countWords(lesson.sections.map(sectionText).join(" "));
}

export function runQualityChecks() {
  const serialized = JSON.stringify({ lessons, vocabulary, phrases, exercises, grammarArticles, endingTables, labels: vocabularyTypeLabels });
  const lessonTextCounts = lessons.map((lesson) => ({ id: lesson.id, words: lessonTextWordCount(lesson) }));
  // Count the authored lecture sections, not the exercise controls. The old
  // 1500-word gate encouraged filler; this gate checks a substantial readable
  // base while the structured markers verify that the explanation has shape.
  const shortLessons = lessonTextCounts.filter((lesson) => lesson.words < 720);
  const thinConceptLessons = lessons.filter((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    return !concept || concept.kind !== "concept" || countWords(concept.body.join(" ")) < 640;
  });
  const lessonsWithoutLanguageTable = lessons.filter((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    return !concept || concept.kind !== "concept" || !concept.body.some((paragraph) => paragraph.startsWith("TABLE|"));
  });
  const unstructuredLectureLessons = lessons.filter((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    if (!concept || concept.kind !== "concept") return true;
    const body = concept.body.join(" ");
    return !body.includes("## ") || !body.includes("SCHEME|") || !body.includes("MISTAKE|") || !body.includes("NOTE|");
  });
  const lessonsWithoutConceptVisual = lessons.filter((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    return !concept || concept.kind !== "concept" || !concept.visual;
  });
  const invalidConceptVisuals = lessons.flatMap((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    if (!concept || concept.kind !== "concept" || !concept.visual) return [];
    const { eyebrow, title, description, alt } = concept.visual;
    return [eyebrow, title, description, alt].every((value) => value.trim().length > 0) ? [] : [lesson.id];
  });
  const visualsWithoutConcreteLearningData = lessons.flatMap((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    if (!concept || concept.kind !== "concept" || !concept.visual) return [lesson.id];
    const { scene, example, meaning, objects } = concept.visual;
    return scene && example && meaning && (objects?.length ?? 0) >= 3 ? [] : [lesson.id];
  });
  const visualsWithoutIllustrationFocus = lessons.flatMap((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    if (!concept || concept.kind !== "concept" || !concept.visual) return [lesson.id];
    const { imageAnchor, example, meaning } = concept.visual;
    return imageAnchor.trim() && example?.trim() && meaning?.trim() ? [] : [lesson.id];
  });
  const visualsWithoutTeachingBreakdown = lessons.flatMap((lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    if (!concept || concept.kind !== "concept" || !concept.visual?.teaching) return [lesson.id];
    const { title, steps, takeaway } = concept.visual.teaching;
    return title.trim() && takeaway.trim() && steps.length >= 3 && steps.every((step) => step.kk.trim() && step.uk.trim()) ? [] : [lesson.id];
  });
  const visualTeachingSequences = lessons.reduce<Record<string, number>>((acc, lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    const sequence = concept?.kind === "concept" ? concept.visual?.teaching?.steps.map((step) => step.kk).join(" | ") : undefined;
    if (sequence) acc[sequence] = (acc[sequence] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateVisualTeachingSequences = Object.entries(visualTeachingSequences).filter(([, count]) => count > 1);
  const visualSceneCounts = lessons.reduce<Record<string, number>>((acc, lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    const scene = concept?.kind === "concept" ? concept.visual?.scene : undefined;
    if (scene) acc[scene] = (acc[scene] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateVisualScenes = Object.entries(visualSceneCounts).filter(([, count]) => count > 1);
  const visualExampleCounts = lessons.reduce<Record<string, number>>((acc, lesson) => {
    const concept = lesson.sections.find((section) => section.kind === "concept");
    const example = concept?.kind === "concept" ? concept.visual?.example?.trim() : undefined;
    if (example) acc[example] = (acc[example] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateVisualExamples = Object.entries(visualExampleCounts).filter(([, count]) => count > 1);
  const badFragmentHits = badFragments.filter((fragment) => containsStandalone(serialized, fragment));
  const kkWithNonKazakh = vocabulary.filter((entry) => /[їєґ]/i.test(entry.kk));
  const fakeTextCheck = exercises.filter((exercise) => exercise.type === "selfCheck" && /перевір/i.test(exercise.prompt));
  const metaExerciseHits = exercises.filter((exercise) =>
    metaExerciseSignals.some((signal) => JSON.stringify(exercise).includes(signal))
  );
  const rawTypeLabels = Object.keys(vocabularyTypeLabels).filter((raw) => serialized.includes(`>${raw}<`));
  const uncheckableSelfChecks = exercises.filter((exercise) => exercise.type === "selfCheck");
  const oneOptionChoices = exercises.filter((exercise) =>
    ["choice", "compactChoice", "dialogueChoice", "translationRecognition", "morphemeAnalysis", "classify", "reviewCard"].includes(exercise.type)
    && ((exercise.options?.length ?? 0) < 2)
  );
  const functionallyDuplicateOptions = exercises.filter((exercise) => {
    const options = exercise.options ?? [];
    const normalized = options.map((option) => option.toLocaleLowerCase("uk").replace(/[.!?]+$/g, "").replace(/\s+/g, " ").trim());
    return normalized.length > 1 && new Set(normalized).size !== normalized.length;
  });
  const builderBlocksAlreadyOrdered = exercises.filter((exercise) => {
    if (!["buildWord", "buildSentence", "orderParts"].includes(exercise.type) || !exercise.blocks || !Array.isArray(exercise.answer)) return false;
    return exercise.blocks.join("\u0000") === exercise.answer.join("\u0000");
  });
  const invalidBuilderTasks = exercises.filter((exercise) =>
    ["buildWord", "buildSentence", "orderParts"].includes(exercise.type)
    && ((exercise.blocks?.length ?? 0) < 2 || (Array.isArray(exercise.answer) && exercise.answer.length < 2))
  );
  const duplicateLessonPrompts = lessons.flatMap((lesson) => {
    const prompts = new Map<string, number>();
    exercises.filter((exercise) => exercise.lessonId === lesson.id).forEach((exercise) => {
      const key = exercise.prompt.trim().replace(/\s+/g, " ");
      prompts.set(key, (prompts.get(key) ?? 0) + 1);
    });
    return [...prompts.entries()]
      .filter(([, count]) => count > 1)
      .map(([prompt, count]) => `${lesson.id}: ${prompt} × ${count}`);
  });
  const duplicateLessonExamples = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) => {
      if (section.kind !== "examples") return [];
      const counts = new Map<string, number>();
      section.examples.forEach((example) => {
        const key = example.kk.trim().replace(/\s+/g, " ");
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      return [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([example, count]) => `${lesson.id}: ${example} × ${count}`);
    })
  );
  const trivialLetterPrompts = exercises.filter((exercise) =>
    /Яке слово має|У якому слові є|літер[ау]\s+[әғқңөұүіһ]/i.test(exercise.prompt)
  );
  const dialogueLinesWithoutKazakh = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      section.kind === "dialogue"
        ? section.lines.filter((line) => !line.kk).map((line) => `${lesson.id}: ${line.speaker} ${line.uk}`)
        : []
    )
  );
  const dialogueKkWithUkrainianLetters = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      section.kind === "dialogue"
        ? section.lines.filter((line) => /[їєґ]/i.test(line.kk ?? "")).map((line) => `${lesson.id}: ${line.kk}`)
        : []
    )
  );
  const dialogueKkWithUkrainianWords = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      section.kind === "dialogue"
        ? section.lines
          .filter((line) => ukrainianWordsInKazakhDialogue.some((word) => (line.kk ?? "").toLowerCase().includes(word)))
          .map((line) => `${lesson.id}: ${line.kk ?? ""}`)
        : []
    )
  );
  const fallbackDialogueHits = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      section.kind === "dialogue"
        ? section.lines.filter((line) => fallbackDialogueSignals.some((signal) => line.kk?.includes(signal) || line.uk.includes(signal))).map((line) => `${lesson.id}: ${line.kk ?? line.uk}`)
        : []
    )
  );
  const metaDialogueHits = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) =>
      section.kind === "dialogue"
        ? section.lines.filter((line) => metaDialogueSignals.some((signal) => (line.kk ?? "").includes(signal) || line.uk.includes(signal))).map((line) => `${lesson.id}: ${line.kk ?? ""}`)
        : []
    )
  );
  const sourceMentionHits = sourceMentionSignals.filter((signal) => serialized.includes(signal));
  const publicEditorialHits = publicEditorialSignals.filter((signal) => serialized.includes(signal));
  const russianCaseTermHits = russianCaseTermSignals.filter((signal) => serialized.toLowerCase().includes(signal));
  const liveSituationSections = lessons.flatMap((lesson) => lesson.sections.filter((section) => section.title.includes("Жива ситуація")).map((section) => `${lesson.id}: ${section.title}`));
  const goalCounts = lessons.reduce<Record<string, number>>((acc, lesson) => {
    acc[lesson.goal] = (acc[lesson.goal] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateGoals = Object.entries(goalCounts).filter(([, count]) => count > 1);
  const conceptHeadlines = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) => section.kind === "concept" ? [`${lesson.id}: ${section.headline}`] : [])
  );
  const headlineCounts = conceptHeadlines.reduce<Record<string, number>>((acc, item) => {
    const headline = item.replace(/^lesson-\d+:\s*/, "");
    acc[headline] = (acc[headline] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateConceptHeadlines = Object.entries(headlineCounts).filter(([, count]) => count > 1);
  const nonWordVocabulary = vocabulary.filter((entry) => entry.type !== "word");
  const multiWordHeadwords = vocabulary.filter((entry) => /\s/.test(entry.kk.trim()));
  const morphologyInVocabulary = vocabulary.filter((entry) => /^-|\/|-/.test(entry.kk) || ["форма слова", "закінчення", "суфікс"].includes(entry.pos ?? ""));
  const untranslatedExamples = vocabulary.filter((entry) =>
    entry.examples.some((example) => example.uk === entry.uk || example.uk.includes("потребує ручної перевірки"))
  );
  const tablesWithoutKazakhNames = endingTables.filter((table) => !table.titleKk || !table.categoryKk);
  const phraseCounts = phrases.reduce<Record<string, number>>((acc, phrase) => {
    const key = phrase.kk.trim();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const duplicatePhrases = Object.entries(phraseCounts).filter(([, count]) => count > 1);
  const publicQaLeaks = LINGUISTIC_QA_NOTES.filter((note) => serialized.includes(note.item));
  const underExplainedGrammar = grammarArticles.filter((article) => article.explanation.length < 5 || countWords(article.explanation.join(" ")) < 130);
  const underExampledGrammar = grammarArticles.filter((article) => article.examples.length < 8);
  const weakGrammarTables = grammarArticles.filter((article) =>
    article.miniTable.length < 3
    || article.miniTable.some((row) => row.length < 2)
    || article.miniTable.flat().some((cell) => /Уперше в курсі|Розділ/u.test(cell))
  );
  const lessonsWithShortDialogues = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) => section.kind === "dialogue" && section.lines.length < 6 ? [lesson.id] : [])
  );
  const dialogueScripts = lessons.reduce<Record<string, string[]>>((acc, lesson) => {
    const dialogue = lesson.sections.find((section) => section.kind === "dialogue");
    if (!dialogue || dialogue.kind !== "dialogue") return acc;
    const key = dialogue.lines.map((line) => line.kk?.toLocaleLowerCase("kk").replace(/[.!?«»]/g, "").replace(/\s+/g, " ").trim()).join(" | ");
    acc[key] ??= [];
    acc[key].push(lesson.id);
    return acc;
  }, {});
  const duplicateDialogueScripts = Object.values(dialogueScripts).filter((ids) => ids.length > 1);
  const untranslatedDialogueLines = lessons.flatMap((lesson) =>
    lesson.sections.flatMap((section) => section.kind === "dialogue"
      ? section.lines.filter((line) => line.kk?.trim() === line.uk.trim()).map((line) => `${lesson.id}: ${line.kk}`)
      : [])
  );
  const allPromptCounts = exercises.reduce<Record<string, string[]>>((acc, exercise) => {
    const key = exercise.prompt.trim().replace(/\s+/g, " ");
    acc[key] ??= [];
    acc[key].push(exercise.id);
    return acc;
  }, {});
  const duplicatePromptsAcrossLessons = Object.values(allPromptCounts).filter((ids) =>
    new Set(ids.map((id) => id.match(/^lesson-\d+/)?.[0])).size > 1
  );
  const choicesWithoutAnswer = exercises.filter((exercise) =>
    (exercise.options?.length ?? 0) > 0
    && typeof exercise.answer === "string"
    && !exercise.options?.includes(exercise.answer)
  );
  const buildersWithDifferentParts = exercises.filter((exercise) => {
    if (!exercise.blocks || !Array.isArray(exercise.answer)) return false;
    return [...exercise.blocks].sort().join("\u0000") !== [...exercise.answer].sort().join("\u0000");
  });
  const unreviewedExercises = exercises.filter((exercise) => !exercise.reviewed);
  const lessonsWithNarrowPractice = lessons.filter((lesson) => {
    const lessonExercises = exercises.filter((exercise) => exercise.lessonId === lesson.id);
    const types = new Set(lessonExercises.map((exercise) => exercise.type));
    const productive = lessonExercises.filter((exercise) =>
      ["fillBlank", "buildWord", "buildSentence", "orderParts", "correctMistake"].includes(exercise.type)
    );
    return types.size < 5 || productive.length < 5;
  });
  const lessonsWithoutCoreSections = lessons.filter((lesson) => {
    const kinds = new Set(lesson.sections.map((section) => section.kind));
    return !["concept", "examples", "dialogue", "practice", "review"].every((kind) => kinds.has(kind as never));
  });
  const lessonsWithTooFewExamples = lessons.filter((lesson) =>
    !lesson.sections.some((section) => section.kind === "examples" && section.examples.length >= 6)
  );
  const modelExampleOverlaps = lessons.flatMap((lesson) => {
    const model = lesson.sections.find((section) => section.kind === "model");
    const examples = lesson.sections.find((section) => section.kind === "examples");
    if (!model || model.kind !== "model" || !examples || examples.kind !== "examples") return [];
    const normalize = (value: string) => value.replace(/\s*\+\s*/g, "").replace(/[.!?]/g, "").toLocaleLowerCase("kk");
    return examples.examples.some((example) => normalize(example.kk) === normalize(model.fullForm)) ? [lesson.id] : [];
  });
  const fillBlanksThatRevealAnswer = exercises.filter((exercise) =>
    exercise.type === "fillBlank"
    && typeof exercise.answer === "string"
    && containsStandalone(exercise.prompt.toLocaleLowerCase("kk"), exercise.answer.toLocaleLowerCase("kk").replace(/[.!?]+$/g, ""))
  );
  const invalidAudioCandidates = forbiddenAudioCandidates.filter(isCompleteKazakhAudioText);
  return {
    counts: {
      lessons: lessons.length,
      vocabulary: vocabulary.length,
      phrases: phrases.length,
      exercises: exercises.length,
      grammarArticles: grammarArticles.length,
      endingTables: endingTables.length,
      lessonTextMin: Math.min(...lessonTextCounts.map((lesson) => lesson.words))
    },
    pass: {
      lessonCount: lessons.length >= 52,
      vocabularyCount: vocabulary.length >= 180,
      phraseCount: phrases.length >= 300,
      exerciseCount: exercises.length >= 1000,
      grammarCoverage: grammarArticles.length >= 35,
      tableCoverage: endingTables.length >= 12,
      allLessonsHaveContent: lessons.every((lesson) => lesson.sections.length >= 10 && lesson.exerciseIds.length >= 20 && lesson.vocabularyIds.length >= 15) && shortLessons.length === 0,
      lessonActualTextDepth: shortLessons.length === 0,
      lessonExplanationsAreSubstantial: thinConceptLessons.length === 0,
      everyLessonHasAnInlineLanguageTable: lessonsWithoutLanguageTable.length === 0,
      structuredLectureExplanations: unstructuredLectureLessons.length === 0,
      everyLessonHasConceptVisual: lessonsWithoutConceptVisual.length === 0,
      conceptVisualsHaveAccessibleContext: invalidConceptVisuals.length === 0,
      everyVisualHasConcreteLearningData: visualsWithoutConcreteLearningData.length === 0,
      everyVisualFocusIsAnchoredToItsIllustration: visualsWithoutIllustrationFocus.length === 0,
      everyVisualExplainsItsOwnExample: visualsWithoutTeachingBreakdown.length === 0,
      visualScenesAreUniquePerLesson: duplicateVisualScenes.length === 0,
      visualExamplesAreUniquePerLesson: duplicateVisualExamples.length === 0,
      visualTeachingSequencesAreUnique: duplicateVisualTeachingSequences.length === 0,
      noGarbageExamples: badFragmentHits.length === 0,
      noRussianVisibleText: russianSignals.every((fragment) => !serialized.includes(fragment)),
      noEnglishLabelsVisible: englishVisibleSignals.every((label) => !serialized.includes(`>${label}<`)),
      noBadKkFields: kkWithNonKazakh.length === 0,
      noNonWordVocabulary: nonWordVocabulary.length === 0,
      noMultiWordHeadwords: multiWordHeadwords.length === 0,
      noMorphologyInVocabulary: morphologyInVocabulary.length === 0,
      examplesTranslated: untranslatedExamples.length === 0,
      tablesHaveBilingualNames: tablesWithoutKazakhNames.length === 0,
      noDuplicatePhrases: duplicatePhrases.length === 0,
      noUncheckableSelfChecks: uncheckableSelfChecks.length === 0,
      noOneOptionChoiceTasks: oneOptionChoices.length === 0,
      noFunctionallyDuplicateOptions: functionallyDuplicateOptions.length === 0,
      noInvalidBuilderTasks: invalidBuilderTasks.length === 0,
      builderTasksRequireReordering: builderBlocksAlreadyOrdered.length === 0,
      noDuplicatePromptsInsideLesson: duplicateLessonPrompts.length === 0,
      noDuplicateExamplesInsideLesson: duplicateLessonExamples.length === 0,
      noTrivialLetterPrompts: trivialLetterPrompts.length === 0,
      lessonDialoguesHaveKazakh: dialogueLinesWithoutKazakh.length === 0,
      lessonDialogueKkIsKazakh: dialogueKkWithUkrainianLetters.length === 0,
      noUkrainianWordsInKazakhDialogue: dialogueKkWithUkrainianWords.length === 0,
      noFallbackDialogues: fallbackDialogueHits.length === 0,
      noMetaDialogues: metaDialogueHits.length === 0,
      noLiveSituationSections: liveSituationSections.length === 0,
      noDuplicateLessonGoals: duplicateGoals.length === 0,
      noDuplicateConceptHeadlines: duplicateConceptHeadlines.length === 0,
      noSourceMentions: sourceMentionHits.length === 0,
      noInternalEditorialNotesInPublicContent: publicEditorialHits.length === 0,
      noRussianCaseTerms: russianCaseTermHits.length === 0,
      noFakeFreeTextChecking: fakeTextCheck.length === 0,
      noMetaLearningExercises: metaExerciseHits.length === 0,
      noRawTypeLabels: rawTypeLabels.length === 0,
      noUnreviewedQaItemsInPublicData: publicQaLeaks.length === 0,
      grammarArticlesAreSubstantial: underExplainedGrammar.length === 0,
      grammarArticlesHaveEnoughExamples: underExampledGrammar.length === 0,
      grammarTablesAreInstructional: weakGrammarTables.length === 0,
      lessonDialoguesAreComplete: lessonsWithShortDialogues.length === 0,
      lessonDialoguesAreIndividuallyAuthored: duplicateDialogueScripts.length === 0,
      lessonDialogueTranslationsArePresent: untranslatedDialogueLines.length === 0,
      noPromptsReusedAcrossLessons: duplicatePromptsAcrossLessons.length === 0,
      everyChoiceContainsItsAnswer: choicesWithoutAnswer.length === 0,
      everyBuilderUsesTheSameParts: buildersWithDifferentParts.length === 0,
      everyExerciseIsReviewed: unreviewedExercises.length === 0,
      everyLessonHasVariedProductivePractice: lessonsWithNarrowPractice.length === 0,
      everyLessonHasCoreSections: lessonsWithoutCoreSections.length === 0,
      everyLessonHasSixTopicExamples: lessonsWithTooFewExamples.length === 0,
      examplesExtendRatherThanRepeatModel: modelExampleOverlaps.length === 0,
      fillBlankPromptsDoNotRevealAnswer: fillBlanksThatRevealAnswer.length === 0,
      audioOnlyForCompleteKazakhText: invalidAudioCandidates.length === 0
    },
    issues: {
      kkWithNonKazakh: kkWithNonKazakh.map((entry) => entry.kk),
      nonWordVocabulary: nonWordVocabulary.map((entry) => `${entry.kk}:${entry.type}`),
      multiWordHeadwords: multiWordHeadwords.map((entry) => entry.kk),
      morphologyInVocabulary: morphologyInVocabulary.map((entry) => entry.kk),
      untranslatedExamples: untranslatedExamples.map((entry) => `${entry.kk}: ${entry.examples[0]?.kk}`),
      tablesWithoutKazakhNames: tablesWithoutKazakhNames.map((table) => table.id),
      duplicatePhrases: duplicatePhrases.map(([phrase, count]) => `${phrase} × ${count}`),
      uncheckableSelfChecks: uncheckableSelfChecks.map((item) => item.id),
      oneOptionChoices: oneOptionChoices.map((item) => item.id),
      functionallyDuplicateOptions: functionallyDuplicateOptions.map((item) => item.id),
      invalidBuilderTasks: invalidBuilderTasks.map((item) => `${item.id}: ${item.prompt}`),
      builderBlocksAlreadyOrdered: builderBlocksAlreadyOrdered.map((item) => `${item.id}: ${item.prompt}`),
      duplicateLessonPrompts,
      duplicateLessonExamples,
      trivialLetterPrompts: trivialLetterPrompts.map((item) => `${item.id}: ${item.prompt}`),
      dialogueLinesWithoutKazakh,
      dialogueKkWithUkrainianLetters,
      dialogueKkWithUkrainianWords,
      fallbackDialogueHits,
      metaDialogueHits,
      sourceMentionHits,
      publicEditorialHits,
      russianCaseTermHits,
      liveSituationSections,
      duplicateGoals: duplicateGoals.map(([goal, count]) => `${goal} × ${count}`),
      duplicateConceptHeadlines: duplicateConceptHeadlines.map(([headline, count]) => `${headline} × ${count}`),
      badFragmentHits,
      fakeTextCheck: fakeTextCheck.map((item) => item.id),
      metaExerciseHits: metaExerciseHits.map((item) => `${item.id}: ${item.prompt}`),
      rawTypeLabels,
      shortLessons: shortLessons.map((lesson) => `${lesson.id}: ${lesson.words} слів`),
      thinConceptLessons: thinConceptLessons.map((lesson) => lesson.id),
      lessonsWithoutLanguageTable: lessonsWithoutLanguageTable.map((lesson) => lesson.id),
      unstructuredLectureLessons: unstructuredLectureLessons.map((lesson) => lesson.id),
      lessonsWithoutConceptVisual: lessonsWithoutConceptVisual.map((lesson) => lesson.id),
      invalidConceptVisuals,
      visualsWithoutConcreteLearningData,
      visualsWithoutIllustrationFocus,
      visualsWithoutTeachingBreakdown,
      duplicateVisualScenes: duplicateVisualScenes.map(([scene, count]) => `${scene} × ${count}`),
      duplicateVisualExamples: duplicateVisualExamples.map(([example, count]) => `${example} × ${count}`),
      duplicateVisualTeachingSequences: duplicateVisualTeachingSequences.map(([sequence, count]) => `${sequence} × ${count}`),
      publicQaLeaks: publicQaLeaks.map((note) => `${note.lessonId}: ${note.item}`),
      underExplainedGrammar: underExplainedGrammar.map((article) => article.id),
      underExampledGrammar: underExampledGrammar.map((article) => article.id),
      weakGrammarTables: weakGrammarTables.map((article) => article.id),
      lessonsWithShortDialogues,
      duplicateDialogueScripts,
      untranslatedDialogueLines,
      duplicatePromptsAcrossLessons,
      choicesWithoutAnswer: choicesWithoutAnswer.map((exercise) => exercise.id),
      buildersWithDifferentParts: buildersWithDifferentParts.map((exercise) => exercise.id),
      unreviewedExercises: unreviewedExercises.map((exercise) => exercise.id),
      lessonsWithNarrowPractice: lessonsWithNarrowPractice.map((lesson) => lesson.id),
      lessonsWithoutCoreSections: lessonsWithoutCoreSections.map((lesson) => lesson.id),
      lessonsWithTooFewExamples: lessonsWithTooFewExamples.map((lesson) => lesson.id),
      modelExampleOverlaps,
      fillBlanksThatRevealAnswer: fillBlanksThatRevealAnswer.map((exercise) => `${exercise.id}: ${exercise.prompt}`),
      invalidAudioCandidates
    }
  };
}

function containsStandalone(haystack: string, fragment: string) {
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, "u").test(haystack);
}
