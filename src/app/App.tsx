import { useCallback, useEffect, useMemo, useState } from "react";
import { AppRoute } from "./routes";
import { Workshop } from "../components/workshop/Workshop";
import "./workshop.css";
import { AppShell } from "../components/layout/AppShell";
import { LessonPlayer } from "../components/lesson/LessonPlayer";
import { GrammarPage } from "../components/reference/GrammarPage";
import { EndingTablesPage } from "../components/reference/EndingTablesPage";
import { VocabularyPage } from "../components/reference/VocabularyPage";
import { PhrasebookPage } from "../components/reference/PhrasebookPage";
import { AudioSettingsPage } from "../components/reference/AudioSettingsPage";
import { ProgressPage } from "../components/progress/ProgressPage";
import { DataQualityPage } from "../components/qa/DataQualityPage";
import { lessons } from "../data/lessons";
import { courseBlocks } from "../data/courseStructure";
import { exercises } from "../data/exercises";
import { vocabulary } from "../data/vocabulary";
import { phrases } from "../data/phrases";
import { grammarArticles } from "../data/grammar";
import { useProgress } from "../components/progress/useProgress";
import { PronounceButton } from "../components/common/PronounceButton";
import homeCourseHero from "../assets/home-course-hero.webp";

export function App() {
  const [route, setRoute] = useState<AppRoute>({ view: "home" });
  const progress = useProgress();
  const currentLesson = useMemo(() => lessons.find((lesson) => lesson.id === (route.lessonId ?? progress.state.currentLessonId)) ?? lessons[0], [route.lessonId, progress.state.currentLessonId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route.view, route.lessonId, route.grammarId, route.tableId, route.wordId, route.phraseCategory, route.flashcardWordId]);

  return (
    <AppShell route={route} setRoute={setRoute} currentLesson={currentLesson}>
      {progress.storageError && <p role="alert">Браузер не зберіг останні зміни. Експортуй прогрес перед закриттям сторінки.</p>}
      {route.view === "home" && <HomePage setRoute={setRoute} progress={progress} />}
      {route.view === "course" && <CoursePage setRoute={setRoute} selectedBlockId={route.courseBlockId} />}
      {route.view === "lesson" && <LessonPlayer lesson={currentLesson} setRoute={setRoute} progress={progress} />}
      {route.view === "grammar" && <GrammarPage selectedId={route.grammarId} setRoute={setRoute} />}
      {route.view === "tables" && <EndingTablesPage selectedId={route.tableId} />}
      {route.view === "vocabulary" && <VocabularyPage selectedId={route.wordId} setRoute={setRoute} />}
      {route.view === "phrases" && <PhrasebookPage category={route.phraseCategory} />}
      {route.view === "workshop" && <Workshop progress={progress} />}
      {route.view === "practice" && <FlashcardsPage key={route.flashcardWordId ?? "practice"} progress={progress} selectedWordId={route.flashcardWordId} />}
      {route.view === "audio" && <AudioSettingsPage />}
      {route.view === "progress" && <ProgressPage progress={progress} />}
      {route.view === "qa" && <DataQualityPage />}
    </AppShell>
  );
}

function HomePage({ setRoute, progress }: { setRoute: (route: AppRoute) => void; progress: ReturnType<typeof useProgress> }) {
  const completed = new Set(progress.state.completedLessons);
  const nextLesson = lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[lessons.length - 1];
  const completedCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return (
    <main className="page home-page">
      <header className="home-course-hero">
        <img
          src={homeCourseHero}
          alt="Діас і Аліна в навчальному світі конструктора між Казахстаном і Україною"
          width="1774"
          height="887"
          decoding="async"
          fetchPriority="high"
        />
        <div className="home-hero-copy">
          <span className="kicker">Қазақ тілі · українською</span>
          <h1>Казахська через українську</h1>
          <p className="lead">Читай, слухай і будуй власні фрази: від першого звука до живої розмови.</p>
          <div className="home-intro-actions">
            <button className="primary" onClick={() => setRoute({ view: "lesson", lessonId: nextLesson.id })}>
              {completedCount ? "Продовжити навчання" : "Розпочати навчання"}
            </button>
            <button className="quiet-action" onClick={() => setRoute({ view: "course" })}>Відкрити зміст курсу</button>
          </div>
        </div>
      </header>

      <section className="home-progress">
        <div className="home-progress-copy">
          <span>Твій прогрес / Ілгерілеу</span>
          <strong>{completedCount} із {lessons.length} уроків</strong>
        </div>
        <div className="home-progress-bar" aria-label="Прогрес курсу">
          <span style={{ width: String(Math.round((completedCount / lessons.length) * 100)) + "%" }} />
        </div>
        <div className="home-next">
          <small>Наступний крок</small>
          <button onClick={() => setRoute({ view: "lesson", lessonId: nextLesson.id })}>
            <strong>{nextLesson.number}. {nextLesson.title}</strong>
            <span>{nextLesson.subtitle}</span>
          </button>
        </div>
      </section>

      <div className="home-columns">
        <section className="home-index">
          <div className="home-section-heading">
            <div><span className="section-kicker">Зміст курсу</span><h2>Модулі курсу / Курс бөлімдері</h2></div>
            <button className="quiet-action" onClick={() => setRoute({ view: "course" })}>Усі уроки</button>
          </div>
          <div className="home-module-list">
            {courseBlocks.map((block, index) => (
              <button className="home-module-row" key={block.id} onClick={() => setRoute({ view: "course", courseBlockId: block.id })}>
                <span className="home-module-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="home-module-copy">
                  <strong>{block.title}</strong>
                  <small>{block.description}</small>
                </span>
                <span className="home-module-meta">{block.lessonIds.length} уроків</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="home-reference">
          <div className="home-section-heading">
            <div><span className="section-kicker">Додатково</span><h2>Довідники</h2></div>
          </div>
          <nav className="home-reference-list">
            <button onClick={() => setRoute({ view: "vocabulary" })}><strong>Словник / Сөздік</strong><span>{vocabulary.length} слів</span></button>
            <button onClick={() => setRoute({ view: "phrases" })}><strong>Фразник / Сөйлеу үлгілері</strong><span>{phrases.length} реплік</span></button>
            <button onClick={() => setRoute({ view: "grammar" })}><strong>Граматика / Грамматика</strong><span>{grammarArticles.length} тем</span></button>
            <button onClick={() => setRoute({ view: "practice" })}><strong>Флешкартки / Сөз карталары</strong><span>{exercises.length} завдань у курсі</span></button>
          </nav>
        </aside>
      </div>
    </main>
  );
}

function CoursePage({ setRoute, selectedBlockId }: { setRoute: (route: AppRoute) => void; selectedBlockId?: string }) {
  useEffect(() => {
    if (!selectedBlockId) return;
    requestAnimationFrame(() => document.getElementById(`course-${selectedBlockId}`)?.scrollIntoView({ block: "start", behavior: "auto" }));
  }, [selectedBlockId]);

  return (
    <main className="page course-page">
      <div className="page-title">
        <h1>Курс / Сабақтар</h1>
        <p>52 повноцінні глави: від першого розуміння системи до побутових сценаріїв і B1 bridge.</p>
      </div>
      {courseBlocks.map((block) => (
        <section className="course-block" id={`course-${block.id}`} key={block.id}>
          <div className="block-head">
            <div><span>{block.level}</span><h2>{block.title}</h2><p>{block.description}</p></div>
            <strong>{block.lessonIds.length} уроків</strong>
          </div>
          <div className="lesson-list">
            {block.lessonIds.map((id) => {
              const lesson = lessons.find((item) => item.id === id)!;
              return (
                <button className="lesson-row" key={id} onClick={() => setRoute({ view: "lesson", lessonId: id })}>
                  <span className="lesson-number">{lesson.number}</span>
                  <span><strong>{lesson.title}</strong><small>{lesson.subtitle}</small></span>
                  <span>{lesson.estimatedMinutes} хв</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

function FlashcardsPage({ progress, selectedWordId }: { progress: ReturnType<typeof useProgress>; selectedWordId?: string }) {
  const { gradeCard } = progress;
  const initialSelectedWord = selectedWordId
    ? vocabulary.find((entry) => entry.id === selectedWordId)
    : undefined;
  const [mode, setMode] = useState<"review" | "self">(initialSelectedWord ? "self" : "review");
  const [theme, setTheme] = useState(initialSelectedWord?.theme ?? "Усі теми");
  const [level, setLevel] = useState(initialSelectedWord?.level ?? "Усі рівні");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [hardIds, setHardIds] = useState<string[]>(() => {
    try { const saved: unknown = JSON.parse(localStorage.getItem("kazakh-course-hard-words") ?? "[]"); return Array.isArray(saved) ? saved.filter((v): v is string => typeof v === "string") : []; }
    catch { return []; }
  });
  const [showHardOnly, setShowHardOnly] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const completed = new Set(progress.state.completedLessons);
  const currentLessonNumber = Number(progress.state.currentLessonId.replace("lesson-", "")) || 1;
  const learnedWords = vocabulary.filter((entry) => entry.lessonIds.some((lessonId) => completed.has(lessonId)));
  const reviewWords = learnedWords.length > 0 ? learnedWords : vocabulary.filter((entry) => entry.lessonIds.includes("lesson-" + currentLessonNumber)).slice(0, 24);
  const themes = ["Усі теми", ...Array.from(new Set(vocabulary.map((entry) => entry.theme))).sort((a, b) => a.localeCompare(b, "uk"))];
  const levels = ["Усі рівні", "A0", "A1", "A2", "B1"];
  const selfWords = vocabulary
    .filter((entry) => (theme === "Усі теми" || entry.theme === theme) && (level === "Усі рівні" || entry.level === level))
    .sort((a, b) => {
      if (a.id === selectedWordId) return -1;
      if (b.id === selectedWordId) return 1;
      return a.kk.localeCompare(b.kk, "kk");
    });
  const [reviewTime, setReviewTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setReviewTime(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const dueWords = reviewWords.filter(word => {
    const stat = progress.state.reviewStats[word.id];
    return !stat || Date.parse(stat.due) <= reviewTime;
  });
  const baseDeck = mode === "review" ? dueWords : selfWords;
  const filteredDeck = showHardOnly ? baseDeck.filter((entry) => hardIds.includes(entry.id)) : baseDeck;
  const deck = useMemo(() => {
    const source = filteredDeck;
    if (!shuffleSeed) return source;
    return [...source].sort((a, b) => hashFlashcard(a.id, shuffleSeed) - hashFlashcard(b.id, shuffleSeed));
  }, [filteredDeck, shuffleSeed]);
  const card = deck[index % Math.max(1, deck.length)];
  const sessionTotal = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
  const frontText = card ? (reverse ? card.uk : card.kk) : "";
  const backMain = card ? (reverse ? card.kk : card.uk) : "";

  useEffect(() => {
    try { localStorage.setItem("kazakh-course-hard-words", JSON.stringify(hardIds)); } catch { /* Available for this session. */ }
  }, [hardIds]);

  function resetSession() {
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setIndex(0);
    setFlipped(false);
  }

  const grade = useCallback((result: "again" | "hard" | "good" | "easy") => {
    if (!card) return;
    gradeCard(card.id, result);
    setSessionStats((stats) => ({ ...stats, [result]: stats[result] + 1 }));
    setHardIds((ids) => {
      const set = new Set(ids);
      if (result === "again" || result === "hard") set.add(card.id);
      else set.delete(card.id);
      return [...set];
    });
    setFlipped(false);
    setIndex((value) => mode === "review" ? 0 : (value + 1) % Math.max(1, deck.length));
  }, [gradeCard, card, deck.length, mode]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      if (!flipped) return;
      if (event.key === "1") grade("again");
      if (event.key === "2") grade("hard");
      if (event.key === "3") grade("good");
      if (event.key === "4") grade("easy");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flipped, grade]);

  return (
    <main className="page flashcards-page">
      <div className="page-title">
        <h1>Флешкартки / Карточкалар</h1>
        <p>Спочатку згадай відповідь сама, потім переверни картку й оціни результат: 1 — не знаю, 2 — важко, 3 — добре, 4 — легко.</p>
      </div>
      <div className="flashcard-layout">
        <aside className="flashcard-panel">
          <div className="mode-switch">
            <button className={mode === "review" ? "active" : ""} onClick={() => { setMode("review"); setIndex(0); setFlipped(false); }}>Повторення вивченого / Өткенді қайталау</button>
            <button className={mode === "self" ? "active" : ""} onClick={() => { setMode("self"); setIndex(0); setFlipped(false); }}>Самостійне вивчення / Өзіндік оқу</button>
          </div>
          {mode === "self" && (
            <div className="flashcard-filters">
              <label>Тема<select value={theme} onChange={(event) => { setTheme(event.target.value); setIndex(0); }}>{themes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Рівень<select value={level} onChange={(event) => { setLevel(event.target.value); setIndex(0); }}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
          )}
          <div className="flashcard-toolbar">
            <button className="secondary" onClick={() => { setShuffleSeed(Date.now()); setIndex(0); setFlipped(false); }}>Перемішати / Араластыру</button>
            <button className="secondary" onClick={() => { setReverse((value) => !value); setFlipped(false); }}>{reverse ? "uk → kk" : "kk → uk"}</button>
            <button className="secondary" onClick={() => { setShowHardOnly((value) => !value); setIndex(0); setFlipped(false); }} disabled={hardIds.length === 0}>{showHardOnly ? "Усі слова" : `Складні (${hardIds.length})`}</button>
          </div>
          <div className="flashcard-session">
            <span>Карток: {deck.length}</span>
            <span>Сесія: {sessionTotal}</span>
            <span>Добре: {sessionStats.good + sessionStats.easy}</span>
            <span>Повторити: {sessionStats.again + sessionStats.hard}</span>
          </div>
          <p className="deck-note">Картки беруть тільки словникові форми, без суфіксів і готових фраз. Пробіл перевертає картку, клавіші 1–4 ставлять оцінку після перевороту.</p>
        </aside>
        {card ? (
          <section className="flashcard-stage">
            <button className={`flashcard-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)} aria-label="Перевернути картку">
              <span className="flashcard-counter">{index + 1} / {deck.length}</span>
              <span className="flashcard-progress"><i style={{ width: `${Math.min(100, ((index + 1) / Math.max(1, deck.length)) * 100)}%` }} /></span>
              <span className="flashcard-inner">
                <span className="flashcard-face flashcard-front">
                  <span className="flashcard-meta">{card.level} · {card.theme}</span>
                  <strong>{frontText}</strong>
                  <small>Згадай відповідь, потім натисни або пробіл</small>
                </span>
                <span className="flashcard-face flashcard-back">
                  <span className="flashcard-meta">{card.pos}</span>
                  <strong>{backMain}</strong>
                  <span className="flashcard-example"><b>{card.examples[0]?.kk}</b>{card.examples[0]?.uk}</span>
                </span>
              </span>
            </button>
            <PronounceButton text={reverse ? card.examples[0]?.kk ?? card.kk : card.kk} />
            {!flipped && <button className="primary show-answer" onClick={() => setFlipped(true)}>Показати відповідь / Жауап</button>}
            <div className="flashcard-actions">
              <button className="grade-button again" disabled={!flipped} onClick={() => grade("again")}><span>1</span>Не знаю / Білмеймін</button>
              <button className="grade-button hard" disabled={!flipped} onClick={() => grade("hard")}><span>2</span>Важко / Қиын</button>
              <button className="grade-button good" disabled={!flipped} onClick={() => grade("good")}><span>3</span>Добре / Жақсы</button>
              <button className="grade-button easy" disabled={!flipped} onClick={() => grade("easy")}><span>4</span>Легко / Оңай</button>
            </div>
            <button className="text-button" onClick={resetSession}>Скинути сесію</button>
          </section>
        ) : (
          <section className="empty-state"><h2>Немає слів для цього набору</h2><p>Повернися до повторення пізніше або обери слова у вільній практиці.</p></section>
        )}
      </div>
    </main>
  );
}

function hashFlashcard(value: string, seed: number) {
  let hash = seed || 17;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 2654435761);
  }
  return hash >>> 0;
}
