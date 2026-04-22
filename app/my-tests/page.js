"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdArrowForward,
  MdQuiz,
  MdTimer,
  MdStar,
  MdCheckCircle,
  MdCalendarToday,
} from "react-icons/md";

const TYPE_LABELS = {
  FULL_MOCK: "Full Mock",
  CHAPTER: "Chapter Test",
  TOPIC: "Topic Test",
  PYP: "Previous Year",
  SPEED: "Speed Test",
  DPT: "Daily Practice",
  SECTIONAL: "Sectional",
  NTA_SIMULATOR: "NTA Simulator",
  SCHOLARSHIP: "Scholarship",
};

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-100" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
      <div className="h-10 rounded-xl bg-slate-100 mt-2" />
    </div>
  );
}

function TestCard({ p }) {
  const test = p.test;
  const typeLabel =
    TYPE_LABELS[test?.testType] || test?.testType?.replace(/_/g, " ");
  const purchaseDate = new Date(p.purchasedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const hasAttempted = p.attemptCount > 0;
  const bestScore = p.bestScore;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />

      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {test?.exam?.name && (
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
              {test.exam.name}
            </span>
          )}
          {typeLabel && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              {typeLabel}
            </span>
          )}
          {hasAttempted && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <MdCheckCircle size={11} /> Attempted
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 flex-1 text-sm font-bold leading-snug text-slate-800 line-clamp-2">
          {test?.title || "Test"}
        </h3>

        {/* Meta */}
        <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-slate-500">
          {test?.durationMins && (
            <span className="flex items-center gap-1">
              <MdTimer size={13} /> {test.durationMins}m
            </span>
          )}
          {test?.totalMarks && (
            <span className="flex items-center gap-1">
              <MdStar size={13} /> {test.totalMarks} marks
            </span>
          )}
          <span className="flex items-center gap-1">
            <MdCalendarToday size={12} /> {purchaseDate}
          </span>
        </div>

        {/* Best score (if attempted) */}
        {bestScore !== undefined && bestScore !== null && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2">
            <MdStar size={14} className="text-amber-500" />
            <span className="text-[12px] font-semibold text-teal-700">
              Best: {bestScore}/{test?.totalMarks}
            </span>
            <span className="ml-auto text-[11px] text-teal-500">
              {p.attemptCount} attempt{p.attemptCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/test/${test?.id}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700 no-underline"
        >
          {hasAttempted ? "Reattempt" : "Attempt Now"}
          <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function MyTestsPage() {
  const [purchases, setPurchases] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/purchases")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPurchases(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, []);

  const attempted = purchases.filter((p) => p.attemptCount > 0);
  const notAttempted = purchases.filter((p) => !p.attemptCount);

  return (
    <>
      <Navbar exams={exams} />
      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="mb-2 flex items-center gap-2">
              <MdQuiz size={18} className="text-white/70" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                Your Tests
              </p>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              My Tests
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {loading
                ? "Loading..."
                : `${purchases.length} test${purchases.length !== 1 ? "s" : ""} purchased`}
            </p>

            {!loading && purchases.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {notAttempted.length > 0 && (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white">
                    📋 {notAttempted.length} not attempted
                  </span>
                )}
                {attempted.length > 0 && (
                  <span className="rounded-full bg-emerald-500/25 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                    ✅ {attempted.length} attempted
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 pb-16">
          {/* Loading */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && purchases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-4xl">
                📋
              </div>
              <p className="text-lg font-bold text-slate-700">
                No tests purchased yet
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Browse and unlock premium tests to get started
              </p>
              <Link
                href="/browse"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 no-underline"
              >
                Browse Tests <MdArrowForward size={16} />
              </Link>
            </div>
          )}

          {/* Not yet attempted */}
          {!loading && notAttempted.length > 0 && (
            <div className={attempted.length > 0 ? "mb-10" : ""}>
              {attempted.length > 0 && (
                <p className="mb-4 text-sm font-bold text-slate-700">
                  Not Attempted Yet
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {notAttempted.map((p) => (
                  <TestCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}

          {/* Attempted */}
          {!loading && attempted.length > 0 && (
            <div>
              {notAttempted.length > 0 && (
                <p className="mb-4 text-sm font-bold text-slate-700">
                  Attempted
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {attempted.map((p) => (
                  <TestCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer exams={exams} />
    </>
  );
}
