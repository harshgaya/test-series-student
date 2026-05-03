"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdRadioButtonUnchecked,
  MdBookmark,
  MdBookmarkBorder,
  MdFlag,
  MdVolumeUp,
  MdPlayCircle,
  MdLightbulb,
} from "react-icons/md";

// ── Math renderer ─────────────────────────────────────────────────────────────
function renderMath(value, katex) {
  if (!value || !katex) return value || "";
  try {
    let r = value;
    r = r.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: true,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    r = r.replace(/\$([^$\n]+)\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    if (!r.includes("$") && !r.includes("<") && /\\[a-zA-Z]/.test(r)) {
      try {
        return katex.renderToString(r.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {}
    }
    return r.replace(/\n/g, "<br/>");
  } catch {
    return value;
  }
}

function MathText({ text, katex, className = "" }) {
  if (!katex) return <span className={className}>{text}</span>;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMath(text, katex) }}
    />
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { value: "all", label: "All", color: "teal" },
  { value: "correct", label: "Correct", color: "emerald" },
  { value: "wrong", label: "Wrong", color: "red" },
  { value: "skipped", label: "Skipped", color: "slate" },
];

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({
  q,
  qNum,
  answer,
  isBookmarked,
  onBookmark,
  onReport,
  katex,
}) {
  const [expanded, setExpanded] = useState(true);

  const isCorrect = answer?.isCorrect === true;
  const hasAnswer =
    answer?.selectedOption ||
    answer?.integerAnswer ||
    answer?.selectedOptions?.length;
  const isSkipped = !hasAnswer;
  const isWrong = !isCorrect && !isSkipped;

  const statusConfig = isCorrect
    ? {
        label: "Correct",
        icon: <MdCheckCircle size={18} />,
        headerBg: "bg-emerald-50",
        headerText: "text-emerald-700",
        border: "border-emerald-200",
        topBar: "bg-emerald-500",
      }
    : isSkipped
      ? {
          label: "Skipped",
          icon: <MdRadioButtonUnchecked size={18} />,
          headerBg: "bg-slate-50",
          headerText: "text-slate-500",
          border: "border-slate-200",
          topBar: "bg-slate-300",
        }
      : {
          label: "Wrong",
          icon: <MdCancel size={18} />,
          headerBg: "bg-red-50",
          headerText: "text-red-600",
          border: "border-red-200",
          topBar: "bg-red-500",
        };

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${statusConfig.border}`}
    >
      {/* Top colour bar */}
      <div className={`h-1 w-full ${statusConfig.topBar}`} />

      {/* Card header */}
      <div
        className={`flex items-center justify-between gap-3 px-5 py-3 ${statusConfig.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <span className={statusConfig.headerText}>{statusConfig.icon}</span>
          <span className={`text-sm font-bold ${statusConfig.headerText}`}>
            {statusConfig.label}
          </span>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            Q{qNum}
          </span>
          {q.chapter?.name && (
            <span className="hidden text-[11px] text-slate-400 sm:inline">
              · {q.chapter.name}
            </span>
          )}
          {q.difficulty && (
            <span
              className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline ${
                q.difficulty === "EASY"
                  ? "bg-emerald-100 text-emerald-700"
                  : q.difficulty === "HARD"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {q.difficulty}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onBookmark(q.id)}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/70 ${
              isBookmarked ? "text-teal-600" : "text-slate-400"
            }`}
          >
            {isBookmarked ? (
              <MdBookmark size={18} />
            ) : (
              <MdBookmarkBorder size={18} />
            )}
          </button>
          <button
            onClick={() => onReport(q.id)}
            title="Report issue"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/70 hover:text-red-500"
          >
            <MdFlag size={16} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="ml-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-white"
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className="p-5 sm:p-6">
          {/* Question image */}
          {q.questionImageUrl && (
            <img
              src={q.questionImageUrl}
              alt=""
              className="mb-4 max-h-52 rounded-xl object-contain"
            />
          )}

          {/* Question text */}
          <MathText
            text={q.questionText}
            katex={katex}
            className="mb-5 block text-[15px] leading-[1.9] text-slate-800"
          />

          {/* MCQ Options */}
          {q.options?.length > 0 && (
            <div className="mb-5 space-y-2">
              {q.options.map((opt) => {
                const isMyAnswer =
                  answer?.selectedOption === opt.label ||
                  (Array.isArray(answer?.selectedOptions) &&
                    answer.selectedOptions.includes(opt.label));
                const isRight = opt.isCorrect;
                const showWrong = isMyAnswer && !isRight;

                return (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                      isRight
                        ? "border-emerald-200 bg-emerald-50"
                        : showWrong
                          ? "border-red-200 bg-red-50"
                          : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {/* Label circle */}
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
                        isRight
                          ? "bg-emerald-500 text-white"
                          : showWrong
                            ? "bg-red-500 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {opt.label}
                    </span>

                    {/* Option text */}
                    <MathText
                      text={opt.optionText}
                      katex={katex}
                      className="flex-1 text-sm leading-relaxed text-slate-700"
                    />

                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isRight && (
                        <MdCheckCircle size={16} className="text-emerald-500" />
                      )}
                      {showWrong && (
                        <MdCancel size={16} className="text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Integer answer */}
          {answer?.integerAnswer !== undefined &&
            answer?.integerAnswer !== null && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm text-slate-500">Your answer:</span>
                <span
                  className={`rounded-xl border px-4 py-1.5 text-base font-bold ${
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {answer.integerAnswer}
                </span>
              </div>
            )}

          {/* Solution */}
          {(q.solutionText ||
            q.solutionImageUrl ||
            q.solutionAudioUrl ||
            q.solutionVideoUrl) && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MdLightbulb size={16} className="text-amber-600" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Solution
                </p>
              </div>

              {q.solutionText && (
                <MathText
                  text={q.solutionText}
                  katex={katex}
                  className="text-sm leading-relaxed text-amber-900"
                />
              )}
              {q.solutionImageUrl && (
                <img
                  src={q.solutionImageUrl}
                  alt="Solution"
                  className="mt-3 max-w-full rounded-xl"
                />
              )}
              {q.solutionAudioUrl && (
                <div className="mt-3 flex items-center gap-2">
                  <MdVolumeUp size={18} className="text-amber-600" />
                  <audio
                    controls
                    src={q.solutionAudioUrl}
                    className="flex-1 h-9"
                  />
                </div>
              )}
              {q.solutionVideoUrl && (
                <div className="mt-3 overflow-hidden rounded-xl">
                  <iframe
                    src={q.solutionVideoUrl}
                    className="h-56 w-full sm:h-72"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page skeleton ─────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white"
        >
          <div className="h-1 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SolutionsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [katex, setKatex] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    import("katex").then((k) => setKatex(k.default));
  }, []);

  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/bookmark")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookmarks(d.data.map((q) => q.id));
      });
  }, [id]);

  async function toggleBookmark(questionId) {
    const isBookmarked = bookmarks.includes(questionId);
    const res = await fetch("/api/bookmark", {
      method: isBookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    });
    const d = await res.json();
    if (d.success) {
      setBookmarks((prev) =>
        isBookmarked
          ? prev.filter((id) => id !== questionId)
          : [...prev, questionId],
      );
      toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked!");
    }
  }

  async function reportQuestion(questionId) {
    const type = prompt(
      "Report type:\n1. Wrong answer\n2. Typo\n3. Unclear\n4. Image issue\n5. Other\nEnter number:",
    );
    const types = {
      1: "wrong_answer",
      2: "typo",
      3: "unclear",
      4: "image_issue",
      5: "other",
    };
    if (!type || !types[type]) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, reportType: types[type] }),
    });
    toast.success("Report submitted. Thank you!");
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-36 bg-gradient-to-r from-teal-700 to-cyan-600" />
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Skeleton />
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Result not found.</p>
      </div>
    );

  const { attempt } = data;
  const questions = attempt.test?.testQuestions?.map((tq) => tq.question) || [];
  const answers = attempt.answers || [];

  // Filter
  const filtered = questions.filter((q) => {
    const a = answers.find((an) => an.questionId === q.id);
    const hasAns =
      a?.selectedOption || a?.integerAnswer || a?.selectedOptions?.length;
    if (filter === "correct") return a?.isCorrect === true;
    if (filter === "wrong") return !a?.isCorrect && hasAns;
    if (filter === "skipped") return !hasAns;
    return true;
  });

  // Stats for filter badges
  const stats = {
    all: questions.length,
    correct: questions.filter(
      (q) => answers.find((a) => a.questionId === q.id)?.isCorrect === true,
    ).length,
    wrong: questions.filter((q) => {
      const a = answers.find((an) => an.questionId === q.id);
      return (
        !a?.isCorrect &&
        (a?.selectedOption || a?.integerAnswer || a?.selectedOptions?.length)
      );
    }).length,
    skipped: questions.filter((q) => {
      const a = answers.find((an) => an.questionId === q.id);
      return (
        !a?.selectedOption && !a?.integerAnswer && !a?.selectedOptions?.length
      );
    }).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href={`/result/${id}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Result
          </Link>

          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Solutions Review
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {attempt.test?.title || "Test"} · {questions.length} questions
          </p>

          {/* Quick stats */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[12px] font-bold text-emerald-200 ring-1 ring-emerald-400/30">
              ✓ {stats.correct} correct
            </span>
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-[12px] font-bold text-red-200 ring-1 ring-red-400/30">
              ✗ {stats.wrong} wrong
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/70 ring-1 ring-white/20">
              — {stats.skipped} skipped
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  active
                    ? f.value === "correct"
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : f.value === "wrong"
                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                        : f.value === "skipped"
                          ? "border-slate-500 bg-slate-600 text-white shadow-sm"
                          : "border-teal-500 bg-teal-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {stats[f.value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl">🎉</p>
            <p className="mt-4 text-lg font-bold text-slate-700">
              {filter === "wrong"
                ? "No wrong answers!"
                : filter === "skipped"
                  ? "No skipped questions!"
                  : "No questions here"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {filter === "wrong" ? "Great job!" : ""}
            </p>
          </div>
        )}

        {/* Question cards */}
        <div className="space-y-4">
          {filtered.map((q) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const globalIdx = questions.indexOf(q) + 1;
            return (
              <QuestionCard
                key={q.id}
                q={q}
                qNum={globalIdx}
                answer={answer}
                isBookmarked={bookmarks.includes(q.id)}
                onBookmark={toggleBookmark}
                onReport={reportQuestion}
                katex={katex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
