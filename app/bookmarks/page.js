"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KaTexRenderer from "@/components/KaTexRenderer";
import {
  MdDelete,
  MdBookmark,
  MdSearch,
  MdClose,
  MdArrowForward,
} from "react-icons/md";
import toast from "react-hot-toast";

const DIFF_COLORS = {
  EASY: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  MEDIUM: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  HARD: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function QuestionSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-100" />
        <div className="h-5 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-3/4 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/bookmark")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookmarks(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, []);

  async function removeBookmark(id) {
    setRemoving(id);
    try {
      await fetch("/api/bookmark", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id }),
      });
      setBookmarks((b) => b.filter((q) => q.id !== id));
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemoving(null);
    }
  }

  const filtered = bookmarks.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.questionText?.toLowerCase().includes(s) ||
      q.subject?.name?.toLowerCase().includes(s) ||
      q.chapter?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <Navbar exams={exams} />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <MdBookmark size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                My Bookmarks
              </h1>
            </div>
            <p className="text-sm text-white/70">
              {loading
                ? "Loading..."
                : `${bookmarks.length} question${bookmarks.length !== 1 ? "s" : ""} saved for later`}
            </p>

            {/* Search */}
            {!loading && bookmarks.length > 0 && (
              <div className="relative mt-5 max-w-md">
                <MdSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/40"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <MdClose size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <QuestionSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && bookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                <MdBookmark size={36} className="text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700">
                No bookmarks yet
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Tap the bookmark icon on any question while solving a test to
                save it here for review.
              </p>
              <Link
                href="/browse"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                Browse Tests <MdArrowForward size={16} />
              </Link>
            </div>
          )}

          {!loading && bookmarks.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-4 text-lg font-bold text-slate-700">
                No results for "{search}"
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear Search
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && search && (
            <p className="mb-4 text-sm text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
              <span className="font-semibold text-slate-700">{search}</span>"
            </p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((q, idx) => {
                const diff = DIFF_COLORS[q.difficulty] || DIFF_COLORS.MEDIUM;
                const isExpanded = expanded === q.id;
                const isRemoving = removing === q.id;

                return (
                  <div
                    key={q.id}
                    className={`group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ${
                      isRemoving
                        ? "scale-95 opacity-50"
                        : "hover:border-teal-200 hover:shadow-md"
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Top row: badges + delete */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          {q.subject?.name && (
                            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                              {q.subject.name}
                            </span>
                          )}
                          {q.chapter?.name && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                              {q.chapter.name}
                            </span>
                          )}
                          {q.topic?.name && (
                            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-600">
                              {q.topic.name}
                            </span>
                          )}
                          {q.difficulty && (
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${diff.bg} ${diff.text} ${diff.border}`}
                            >
                              {q.difficulty}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeBookmark(q.id)}
                          disabled={isRemoving}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed"
                          title="Remove bookmark"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>

                      {/* Question text — rendered with KaTeX */}
                      <div
                        className={`mt-3 text-sm leading-relaxed text-slate-700 ${!isExpanded ? "line-clamp-2" : ""}`}
                      >
                        <KaTexRenderer text={q.questionText || ""} />
                      </div>

                      {q.questionText?.length > 100 && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : q.id)}
                          className="mt-1.5 text-[12px] font-semibold text-teal-600 hover:text-teal-700"
                        >
                          {isExpanded ? "Show less ↑" : "Show more ↓"}
                        </button>
                      )}

                      {/* Options (when expanded) — also KaTeX */}
                      {isExpanded && q.options?.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${
                                opt.isCorrect
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-slate-100 bg-slate-50 text-slate-600"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                  opt.isCorrect
                                    ? "bg-emerald-200 text-emerald-800"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="leading-snug">
                                <KaTexRenderer text={opt.optionText || ""} />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution (when expanded) — also KaTeX */}
                      {isExpanded && q.solutionText && (
                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-blue-500">
                            Solution
                          </p>
                          <div className="text-sm leading-relaxed text-blue-800">
                            <KaTexRenderer text={q.solutionText} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer exams={exams} />
    </>
  );
}
