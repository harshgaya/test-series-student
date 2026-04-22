"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import {
  MdArrowForward,
  MdArrowBack,
  MdTune,
  MdShuffle,
  MdCheckCircle,
  MdCheck,
  MdKeyboardArrowDown,
  MdSchool,
  MdLock,
  MdAutorenew,
  MdWarningAmber,
  MdSearch,
} from "react-icons/md";

// NOTE: internal value stays 'scratch' for backward compat with existing
// /api/custom-test/create. Only the label is renamed.
const SOURCES = [
  {
    value: "scratch",
    label: "Browse by topic",
    desc: "Pick subjects, chapters or topics",
    icon: "🎯",
    needs: null,
  },
  {
    value: "weak",
    label: "Weak Areas",
    desc: "Auto-picks chapters you struggle with",
    icon: "📉",
    needs: "attempts",
    lockText: "Attempt 3+ tests to unlock",
  },
  {
    value: "bookmarks",
    label: "My Bookmarks",
    desc: "Questions you have saved",
    icon: "🔖",
    needs: "bookmarks",
    lockText: "Save some questions first",
  },
  {
    value: "wrong",
    label: "Wrong Answers",
    desc: "Questions you got wrong before",
    icon: "❌",
    needs: "wrongAnswers",
    lockText: "Attempt tests to unlock",
  },
];

const DIFFICULTIES = [
  { value: "", label: "All", tone: "slate" },
  { value: "EASY", label: "Easy", tone: "emerald" },
  { value: "MEDIUM", label: "Medium", tone: "amber" },
  { value: "HARD", label: "Hard", tone: "rose" },
];

const DIFF_ACTIVE = {
  slate: "border-slate-400 bg-slate-100 text-slate-800",
  emerald: "border-emerald-400 bg-emerald-50 text-emerald-700",
  amber: "border-amber-400 bg-amber-50 text-amber-700",
  rose: "border-rose-400 bg-rose-50 text-rose-700",
};

const toggleIn = (setter) => (id) =>
  setter((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
  );

export default function CustomTestPage() {
  const router = useRouter();
  const pickerRef = useRef(null);

  // Data
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  // stats: null = unknown (endpoint may not exist yet). Only lock sources
  // once we have confirmed zeros.
  const [stats, setStats] = useState(null);

  // Selection
  const [examId, setExamId] = useState(null);
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [subjectIds, setSubjectIds] = useState([]);
  const [chapterIds, setChapterIds] = useState([]);
  const [topicIds, setTopicIds] = useState([]);
  const [source, setSource] = useState("scratch");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(20);
  const [shuffle, setShuffle] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [availableCount, setAvailableCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);

  // ── Click outside to close exam picker ───────────────────────
  useEffect(() => {
    if (!showExamPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowExamPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExamPicker]);

  // ── Auth + initial load ──────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem("iitneet_student");
    if (!s) {
      router.push("/login");
      return;
    }
    const student = JSON.parse(s);

    // Exams (required)
    fetch("/api/exams")
      .then((r) => r.json())
      .then((e) => {
        if (!e.success) return;
        setExams(e.data);
        const target =
          student.targetExamId ??
          e.data.find(
            (x) =>
              x.name === student.targetExam || x.slug === student.targetExam,
          )?.id ??
          e.data[0]?.id;
        setExamId(target);
      });

    // Stats (optional — endpoint may not exist yet. All sources stay unlocked if this fails.)
    fetch("/api/student/practice-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((st) => {
        if (st?.success) setStats(st.data);
      })
      .catch(() => {});
  }, []);

  // ── Fetch subjects when exam changes ─────────────────────────
  useEffect(() => {
    if (!examId) return;
    fetch(`/api/subjects?examId=${examId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubjects(d.data);
      });
    setSubjectIds([]);
    setChapterIds([]);
    setTopicIds([]);
  }, [examId]);

  // ── Fetch chapters when subjects change ──────────────────────
  useEffect(() => {
    if (subjectIds.length === 0) {
      setChapters([]);
      setChapterIds([]);
      return;
    }
    fetch(`/api/chapters?subjectIds=${subjectIds.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setChapters(d.data);
      });
  }, [subjectIds]);

  // ── Fetch topics when chapters change (endpoint optional) ───
  useEffect(() => {
    if (chapterIds.length === 0) {
      setTopics([]);
      setTopicIds([]);
      return;
    }
    fetch(`/api/topics?chapterIds=${chapterIds.join(",")}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success) setTopics(d.data);
      })
      .catch(() => setTopics([]));
  }, [chapterIds]);

  // ── Live count (endpoint optional) ──────────────────────────
  useEffect(() => {
    if (!examId) return;
    setCountLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams({
        examId: String(examId),
        source,
        ...(subjectIds.length ? { subjectIds: subjectIds.join(",") } : {}),
        ...(chapterIds.length ? { chapterIds: chapterIds.join(",") } : {}),
        ...(topicIds.length ? { topicIds: topicIds.join(",") } : {}),
        ...(difficulty ? { difficulty } : {}),
      });
      fetch(`/api/custom-test/count?${params}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setAvailableCount(d?.success ? d.data.total : null))
        .catch(() => setAvailableCount(null))
        .finally(() => setCountLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [examId, source, subjectIds, chapterIds, topicIds, difficulty]);

  // ── Derived ─────────────────────────────────────────────────
  const currentExam = exams.find((e) => e.id === examId);

  // Lock ONLY when stats confirmed zero. If stats unknown (endpoint missing),
  // everything is unlocked — backend handles the empty result.
  const sourceAvailable = (src) => {
    if (!stats) return true;
    if (src.needs === "attempts") return stats.attempts >= 3;
    if (src.needs === "bookmarks") return stats.bookmarks > 0;
    if (src.needs === "wrongAnswers") return stats.wrongAnswers > 0;
    return true;
  };

  async function handleBuild() {
    setLoading(true);
    try {
      const res = await fetch("/api/custom-test/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // New shape
          examId,
          source,
          subjectIds,
          chapterIds,
          topicIds,
          // Backward compat — old backend reads these scalars
          subjectId: subjectIds[0] || null,
          chapterId: chapterIds[0] || null,
          difficulty: difficulty || null,
          count,
          shuffle,
        }),
      });
      const d = await res.json();

      if (!d.success) {
        toast.error(d.error || "Could not build test");
        return;
      }
      if (!d.data || d.data.total === 0) {
        const hasFilters =
          subjectIds.length ||
          chapterIds.length ||
          topicIds.length ||
          difficulty;
        toast.error(
          hasFilters
            ? "No questions match — try broader filters or remove difficulty"
            : "No questions available for this source yet",
        );
        return;
      }
      setPreview(d.data);
      toast.success(`${d.data.total} questions ready!`);
    } catch (e) {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const stepN = (step) =>
    source === "scratch" ? step : step === 1 ? 1 : step - 1;

  return (
    <>
      <Navbar exams={exams} />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          {/* Decorative layer — clipped to hero, pointer-events-none */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          </div>

          {/* Content layer — NOT clipped, so dropdown can overflow hero */}
          <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-2 flex items-center gap-2">
              <MdTune size={18} className="text-white/80" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                Practice Tool
              </p>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Custom Test Builder
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Pick subjects, chapters, topics — any mix, any depth. Build your
              own practice test.
            </p>

            {/* Exam chip */}
            {currentExam && (
              <div ref={pickerRef} className="relative z-20 mt-5 inline-block">
                <button
                  onClick={() => setShowExamPicker((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
                >
                  <MdSchool size={16} className="text-white" />
                  <span className="text-xs font-semibold text-white/70">
                    Preparing for
                  </span>
                  <span className="text-sm font-bold text-white">
                    {currentExam.name}
                  </span>
                  <MdKeyboardArrowDown
                    size={18}
                    className={`text-white/80 transition ${showExamPicker ? "rotate-180" : ""}`}
                  />
                </button>

                {showExamPicker && (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                    {exams.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setExamId(e.id);
                          setShowExamPicker(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                          e.id === examId
                            ? "bg-teal-50 font-bold text-teal-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {e.name}
                        {e.id === examId && (
                          <MdCheck size={16} className="text-teal-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ─── BODY ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
          {!preview ? (
            <div className="space-y-5">
              {/* 1. SOURCE */}
              <Card>
                <SectionLabel n={1}>Choose question source</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {SOURCES.map((s) => {
                    const available = sourceAvailable(s);
                    const isActive = source === s.value;
                    return (
                      <button
                        key={s.value}
                        disabled={!available}
                        onClick={() => setSource(s.value)}
                        className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                          !available
                            ? "cursor-not-allowed border-slate-100 bg-slate-50/60"
                            : isActive
                              ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-400/30"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isActive && available && (
                          <MdCheckCircle
                            size={16}
                            className="absolute right-3 top-3 text-teal-600"
                          />
                        )}
                        {!available && (
                          <MdLock
                            size={14}
                            className="absolute right-3 top-3 text-slate-300"
                          />
                        )}
                        <p
                          className={`mb-1.5 text-2xl ${!available ? "opacity-40 grayscale" : ""}`}
                        >
                          {s.icon}
                        </p>
                        <p
                          className={`text-[13px] font-bold ${!available ? "text-slate-400" : "text-slate-800"}`}
                        >
                          {s.label}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] leading-snug ${!available ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {!available ? s.lockText : s.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 2. SCOPE (only for "Browse by topic" source) */}
              {source === "scratch" && (
                <Card>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <SectionLabel n={2} inline>
                      Define your scope
                    </SectionLabel>
                    <p className="text-[11px] text-slate-400">
                      All optional · empty = everything
                    </p>
                  </div>

                  <ScopeGroup
                    label="Subjects"
                    items={subjects}
                    selectedIds={subjectIds}
                    onToggle={toggleIn(setSubjectIds)}
                    onClear={() => setSubjectIds([])}
                    emptyText="Loading subjects…"
                  />

                  {subjectIds.length > 0 && (
                    <ScopeGroup
                      label="Chapters"
                      items={chapters}
                      selectedIds={chapterIds}
                      onToggle={toggleIn(setChapterIds)}
                      onClear={() => setChapterIds([])}
                      emptyText="Loading chapters…"
                      className="mt-5 border-t border-slate-100 pt-5"
                    />
                  )}

                  {chapterIds.length > 0 && topics.length > 0 && (
                    <ScopeGroup
                      label="Topics"
                      items={topics}
                      selectedIds={topicIds}
                      onToggle={toggleIn(setTopicIds)}
                      onClear={() => setTopicIds([])}
                      emptyText="No topics available"
                      className="mt-5 border-t border-slate-100 pt-5"
                    />
                  )}
                </Card>
              )}

              {/* DIFFICULTY */}
              <Card>
                <SectionLabel n={stepN(3)}>Difficulty</SectionLabel>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`rounded-xl border-2 py-2.5 text-[12px] font-bold transition ${
                        difficulty === d.value
                          ? DIFF_ACTIVE[d.tone]
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* SETTINGS */}
              <Card>
                <SectionLabel n={stepN(4)}>Test settings</SectionLabel>

                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[13px] font-semibold text-slate-600">
                      Number of questions
                    </label>
                    <span className="rounded-full bg-teal-600 px-3 py-1 text-sm font-black text-white">
                      {count}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                    <span>5 min</span>
                    <span>50 max</span>
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {[10, 20, 30, 45].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                        count === n
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {n}Q · ~{Math.ceil(n * 1.5)}min
                    </button>
                  ))}
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <MdShuffle size={18} className="text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Shuffle questions
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Randomise question order
                      </p>
                    </div>
                  </div>
                  <div
                    className={`relative flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      shuffle ? "bg-teal-500" : "bg-slate-200"
                    }`}
                    onClick={() => setShuffle((v) => !v)}
                  >
                    <div
                      className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        shuffle ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </Card>

              {/* LIVE COUNT + BUILD */}
              <div className="space-y-3 pt-2">
                <LiveCountBanner
                  loading={countLoading}
                  count={availableCount}
                  requested={count}
                />
                <button
                  onClick={handleBuild}
                  disabled={loading || availableCount === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-sm font-black text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Building your test...
                    </>
                  ) : (
                    <>
                      Build My Test <MdArrowForward size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <PreviewCard
              preview={preview}
              source={source}
              shuffle={shuffle}
              difficulty={difficulty}
              subjects={subjects}
              chapters={chapters}
              topics={topics}
              subjectIds={subjectIds}
              chapterIds={chapterIds}
              topicIds={topicIds}
              onBack={() => setPreview(null)}
              onStart={() => {
                if (preview.attemptId)
                  router.push(`/attempt/${preview.attemptId}`);
                else toast("Custom test attempt coming soon!");
              }}
            />
          )}
        </div>
      </main>
      <Footer exams={exams} />
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════ */

function Card({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {children}
    </div>
  );
}

function SectionLabel({ n, children, inline }) {
  return (
    <p
      className={`flex items-center gap-2 text-sm font-bold text-slate-800 ${inline ? "" : "mb-4"}`}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-700">
        {n}
      </span>
      {children}
    </p>
  );
}

function ScopeGroup({
  label,
  items,
  selectedIds,
  onToggle,
  onClear,
  emptyText,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="mb-2.5 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
          {label}
          {selectedIds.length > 0 && (
            <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-black text-white">
              {selectedIds.length}
            </span>
          )}
        </label>
        {selectedIds.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-semibold text-slate-400 transition hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] italic text-slate-400">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  selected
                    ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {selected && <MdCheck size={12} />}
                {item.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LiveCountBanner({ loading, count, requested }) {
  if (count === null && !loading) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500">
        <MdAutorenew size={16} className="animate-spin" />
        Checking availability…
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">
        <MdWarningAmber size={16} />
        No questions match — try different filters
      </div>
    );
  }

  if (count < requested) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700">
        <MdWarningAmber size={16} />
        Only {count} available · reduce count or broaden filters
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700">
      <MdSearch size={16} />
      {count.toLocaleString()} questions match your filters
    </div>
  );
}

function PreviewCard({
  preview,
  source,
  shuffle,
  difficulty,
  subjects,
  chapters,
  topics,
  subjectIds,
  chapterIds,
  topicIds,
  onBack,
  onStart,
}) {
  const sourceLabel = {
    scratch: "question bank",
    weak: "your weak chapters",
    bookmarks: "your bookmarks",
    wrong: "your wrong answers",
  }[source];

  const tags = [
    shuffle && "🔀 Shuffled",
    difficulty && difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
    ...subjectIds
      .map((id) => subjects.find((x) => x.id === id)?.name)
      .filter(Boolean),
    ...chapterIds
      .map((id) => chapters.find((x) => x.id === id)?.name)
      .filter(Boolean),
    ...topicIds
      .map((id) => topics.find((x) => x.id === id)?.name)
      .filter(Boolean),
  ].filter(Boolean);

  const stats = [
    { label: "Questions", value: preview.total, tone: "teal" },
    {
      label: "Est. Time",
      value: `~${Math.ceil(preview.total * 1.5)}m`,
      tone: "orange",
    },
    { label: "Marks", value: preview.total * 4, tone: "emerald" },
  ];
  const statBg = {
    teal: "bg-teal-50 text-teal-700",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
          ✅
        </div>
        <h2 className="text-xl font-black text-white">Test Ready!</h2>
        <p className="mt-1 text-sm text-white/85">
          {preview.total} questions from {sourceLabel}
        </p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        {stats.map((s) => (
          <div key={s.label} className={`${statBg[s.tone]} py-5 text-center`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 p-5">
        <button
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <MdArrowBack size={16} /> Change Settings
        </button>
        <button
          onClick={onStart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700"
        >
          Start Test <MdArrowForward size={16} />
        </button>
      </div>
    </div>
  );
}
