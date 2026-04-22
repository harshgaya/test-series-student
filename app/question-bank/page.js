"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KaTexRenderer from "@/components/KaTexRenderer";
import ReportModal from "@/components/ReportModal";
import toast from "react-hot-toast";
import {
  MdCheckCircle,
  MdCancel,
  MdBookmark,
  MdBookmarkBorder,
  MdFlag,
  MdArrowForward,
  MdArrowBack,
  MdLightbulb,
  MdFilterList,
} from "react-icons/md";

const DIFF_STYLE = {
  EASY: { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  MEDIUM: { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  HARD: { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

function QuestionSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-5 py-3.5">
        <div className="flex gap-2">
          <div className="h-5 w-8 rounded bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-24 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  idx,
  globalIdx,
  selected,
  shown,
  bookmarks,
  onAnswer,
  onBookmark,
  onReport,
}) {
  const ans = selected[q.id];
  const showSol = shown[q.id];
  const isBookmarked = bookmarks.includes(q.id);
  const correctOpt = q.options?.find((o) => o.isCorrect);
  const isCorrect = ans === correctOpt?.label;
  const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.MEDIUM;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] font-bold text-slate-400">
            Q{globalIdx}
          </span>
          {q.subject?.name && (
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
              {q.subject.name}
            </span>
          )}
          {q.chapter?.name && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
              {q.chapter.name}
            </span>
          )}
          {q.difficulty && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${diff.bg}`}
            >
              {q.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onBookmark(q.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100 ${isBookmarked ? "text-teal-600" : "text-slate-400"}`}
          >
            {isBookmarked ? (
              <MdBookmark size={18} />
            ) : (
              <MdBookmarkBorder size={18} />
            )}
          </button>
          <button
            onClick={() => onReport(q.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <MdFlag size={16} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Question text */}
        {q.questionImageUrl && (
          <img
            src={q.questionImageUrl}
            alt=""
            className="mb-4 max-h-48 rounded-xl object-contain"
          />
        )}
        <div className="mb-5 text-[15px] leading-[1.9] text-slate-800">
          <KaTexRenderer text={q.questionText} />
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options?.map((opt) => {
            const isSel = ans === opt.label;
            const isRight = opt.isCorrect;
            const showRes = showSol;

            let borderClass =
              "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/30";
            let labelClass = "bg-slate-200 text-slate-600";

            if (showRes && isRight) {
              borderClass = "border-emerald-200 bg-emerald-50";
              labelClass = "bg-emerald-500 text-white";
            } else if (showRes && isSel && !isRight) {
              borderClass = "border-red-200 bg-red-50";
              labelClass = "bg-red-500 text-white";
            } else if (isSel) {
              borderClass = "border-teal-400 bg-teal-50";
              labelClass = "bg-teal-600 text-white";
            }

            return (
              <button
                key={opt.id}
                onClick={() => !showSol && onAnswer(q.id, opt.label)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${borderClass} ${showSol ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold transition ${labelClass}`}
                >
                  {opt.label}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-slate-700">
                  <KaTexRenderer text={opt.optionText} />
                </span>
                {showRes && isRight && (
                  <MdCheckCircle
                    size={18}
                    className="flex-shrink-0 mt-0.5 text-emerald-500"
                  />
                )}
                {showRes && isSel && !isRight && (
                  <MdCancel
                    size={18}
                    className="flex-shrink-0 mt-0.5 text-red-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Solution */}
        {showSol && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MdLightbulb size={16} className="text-amber-600" />
              <p
                className={`text-[12px] font-extrabold uppercase tracking-wider ${isCorrect ? "text-emerald-700" : "text-red-700"}`}
              >
                {isCorrect
                  ? "✅ Correct!"
                  : `❌ Wrong — Correct: ${correctOpt?.label}`}
              </p>
            </div>
            {q.solutionText && (
              <div className="text-sm leading-relaxed text-amber-900">
                <KaTexRenderer text={q.solutionText} />
              </div>
            )}
            {q.solutionImageUrl && (
              <img
                src={q.solutionImageUrl}
                alt=""
                className="mt-3 max-w-full rounded-xl"
              />
            )}
            {q.solutionVideoUrl && (
              <div className="mt-3 overflow-hidden rounded-xl">
                <iframe
                  src={q.solutionVideoUrl}
                  className="h-52 w-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionBankPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [shown, setShown] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubjects(d.data);
      });
    fetch("/api/bookmark")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookmarks(d.data.map((q) => q.id));
      });
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setChapters([]);
      return;
    }
    fetch(`/api/chapters?subjectId=${subjectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setChapters(d.data);
      });
  }, [subjectId]);

  useEffect(() => {
    loadQuestions();
  }, [subjectId, chapterId, difficulty, page]);

  async function loadQuestions() {
    setLoading(true);
    try {
      let url = `/api/questions/practice?page=${page}&limit=10`;
      if (subjectId) url += `&subjectId=${subjectId}`;
      if (chapterId) url += `&chapterId=${chapterId}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      const res = await fetch(url);
      const d = await res.json();
      if (d.success) {
        setQuestions(d.data.questions);
        setTotal(d.data.total);
      }
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer(qId, label) {
    setSelected((s) => ({ ...s, [qId]: label }));
    setShown((s) => ({ ...s, [qId]: true }));
  }

  async function toggleBookmark(qId) {
    const isB = bookmarks.includes(qId);
    await fetch("/api/bookmark", {
      method: isB ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: qId }),
    });
    setBookmarks((b) => (isB ? b.filter((id) => id !== qId) : [...b, qId]));
    toast.success(isB ? "Bookmark removed" : "Bookmarked!");
  }

  function changePage(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setSubjectId("");
    setChapterId("");
    setDifficulty("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / 10);
  const hasFilters = subjectId || chapterId || difficulty;

  return (
    <>
      {reportId && (
        <ReportModal questionId={reportId} onClose={() => setReportId(null)} />
      )}
      <Navbar exams={exams} />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="mb-2 flex items-center gap-2">
              <MdFilterList size={18} className="text-white/60" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                Practice
              </p>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Question Bank
            </h1>
            <p className="mt-1 text-sm text-white/75">
              Practice questions with instant solutions &amp; bookmarks
            </p>

            {/* Filters inline in hero */}
            <div className="mt-6 flex flex-wrap gap-3">
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setChapterId("");
                  setPage(1);
                }}
                className="rounded-xl border-0 bg-white/15 px-4 py-2.5 text-sm font-medium text-white placeholder-white/70 backdrop-blur-sm outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/30 [&>option]:text-slate-800 [&>option]:bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {chapters.length > 0 && (
                <select
                  value={chapterId}
                  onChange={(e) => {
                    setChapterId(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border-0 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm outline-none focus:bg-white/25 [&>option]:text-slate-800 [&>option]:bg-white"
                >
                  <option value="">All Chapters</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border-0 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm outline-none focus:bg-white/25 [&>option]:text-slate-800 [&>option]:bg-white"
              >
                <option value="">All Levels</option>
                <option value="EASY">🟢 Easy</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HARD">🔴 Hard</option>
              </select>

              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20"
                >
                  Clear ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-16">
          {/* Stats bar */}
          {!loading && (
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {total.toLocaleString("en-IN")} questions
                {hasFilters ? " matching filters" : ""}
                {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
              </p>
              {totalPages > 1 && (
                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from(
                    { length: Math.min(totalPages, 7) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition ${
                        page === p
                          ? "bg-teal-600 text-white"
                          : "text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > 7 && (
                    <span className="text-[12px] text-slate-400">
                      ... {totalPages}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <QuestionSkeleton key={i} />
              ))
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-5xl">🔍</p>
                <p className="mt-4 text-lg font-bold text-slate-700">
                  No questions found
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Try adjusting your filters
                </p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  idx={idx}
                  globalIdx={(page - 1) * 10 + idx + 1}
                  selected={selected}
                  shown={shown}
                  bookmarks={bookmarks}
                  onAnswer={checkAnswer}
                  onBookmark={toggleBookmark}
                  onReport={setReportId}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <MdArrowBack size={16} /> Prev
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                        page === p
                          ? "bg-teal-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="flex h-10 items-center px-2 text-sm text-slate-400">
                    ... {totalPages}
                  </span>
                )}
              </div>

              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-40"
              >
                Next <MdArrowForward size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer exams={exams} />
    </>
  );
}
