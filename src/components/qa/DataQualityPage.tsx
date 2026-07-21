import { runQualityChecks } from "./qualityChecks";

export function DataQualityPage() {
  const report = runQualityChecks();
  return (
    <main className="page">
      <div className="page-title"><h1>Якість даних</h1><p>Технічна перевірка покриття курсу, словника, фразника, практики й видимого тексту.</p></div>
      <div className="qa-grid">
        {Object.entries(report.counts).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{label(key)}</span></article>)}
      </div>
      <div className="qa-list">
        {Object.entries(report.pass).map(([key, ok]) => <div className={ok ? "qa-row ok" : "qa-row bad"} key={key}><span>{ok ? "✓" : "!"}</span>{label(key)}</div>)}
      </div>
      <pre>{JSON.stringify(report.issues, null, 2)}</pre>
    </main>
  );
}

function label(key: string) {
  const labels: Record<string, string> = {
    lessons: "уроки",
    vocabulary: "словник",
    phrases: "фрази",
    exercises: "завдання",
    grammarArticles: "граматика",
    endingTables: "таблиці",
    lessonTextMin: "мінімум слів у фактичному тексті уроку",
    lessonCount: "52 уроки існують",
    vocabularyCount: "180+ словникових слів",
    phraseCount: "300+ фраз",
    exerciseCount: "1000+ завдань",
    grammarCoverage: "граматика покрита",
    tableCoverage: "таблиці покриті",
    allLessonsHaveContent: "усі уроки мають контент",
    lessonActualTextDepth: "усі уроки мають 720+ слів лекційного тексту",
    structuredLectureExplanations: "лекції мають пояснення, схему, помилку й підсумок",
    noGarbageExamples: "немає заборонених прикладів",
    noRussianVisibleText: "немає російського UI",
    noEnglishLabelsVisible: "немає англійських labels",
    noBadKkFields: "kk-поля чисті",
    noNonWordVocabulary: "у словнику тільки слова",
    noMultiWordHeadwords: "немає словосполучень у словнику",
    noMorphologyInVocabulary: "немає суфіксів і форм у словнику",
    examplesTranslated: "приклади в словнику перекладені",
    tablesHaveBilingualNames: "таблиці мають українські й казахські назви",
    noDuplicatePhrases: "у фразнику немає повторів",
    noUncheckableSelfChecks: "немає неперевірюваних self-check завдань",
    noOneOptionChoiceTasks: "немає вибору з одним варіантом",
    noInvalidBuilderTasks: "немає builder/order завдань з одним блоком",
    noDuplicatePromptsInsideLesson: "завдання не повторюються всередині уроку",
    noDuplicateExamplesInsideLesson: "приклади не дублюються всередині уроку",
    noTrivialLetterPrompts: "немає очевидних завдань “де літера?”",
    lessonDialoguesHaveKazakh: "мінідіалоги в уроках мають казахський текст",
    lessonDialogueKkIsKazakh: "казахські рядки діалогів не містять українських літер",
    noFallbackDialogues: "немає fallback-діалогів",
    noLiveSituationSections: "немає секції “Жива ситуація”",
    noDuplicateLessonGoals: "цілі уроків не повторюються",
    noDuplicateConceptHeadlines: "основні ідеї уроків не повторюються",
    noSourceMentions: "джерела не згадуються в інтерфейсі",
    noFakeFreeTextChecking: "немає фейкової перевірки тексту",
    noRawTypeLabels: "типи перекладені",
    audioOnlyForCompleteKazakhText: "аудіо є лише біля повних казахських слів і речень"
  };
  return labels[key] ?? key;
}
