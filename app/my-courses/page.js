"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdArrowForward,
  MdCalendarToday,
  MdCheckCircle,
  MdSchool,
} from "react-icons/md";

function Skeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="h-1.5 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-2 rounded-full bg-slate-100 mt-4" />
        <div className="h-10 rounded-xl bg-slate-100 mt-2" />
      </div>
    </div>
  );
}

function CourseCard({ e }) {
  const total = e.crashCourse?.durationDays || 1;
  const current = e.currentDay || 1;
  const pct = Math.min(100, Math.round((current / total) * 100));
  const completed = pct === 100;
  const title = e.crashCourse?.title || "Course";
  const examName = e.crashCourse?.exam?.name;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      {/* Progress bar top */}
      <div className="h-1.5 bg-slate-100">
        <div
          className={`h-1.5 transition-all duration-700 ${completed ? "bg-emerald-500" : "bg-teal-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {examName && (
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
              {examName}
            </span>
          )}
          {completed ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <MdCheckCircle size={11} /> Completed
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
              {e.crashCourse?.durationDays} days
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-4 text-sm font-bold leading-snug text-slate-800 line-clamp-2">
          {title}
        </h3>

        {/* Progress row */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-1 text-slate-500">
              <MdCalendarToday size={12} />
              Day {current} of {total}
            </span>
            <span
              className={`font-bold ${completed ? "text-emerald-600" : "text-teal-600"}`}
            >
              {pct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${completed ? "bg-emerald-500" : "bg-teal-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/course/${e.crashCourse?.id}`}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition no-underline ${
            completed
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-teal-600 text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
          }`}
        >
          {completed ? "Review Course" : "Continue Learning"}
          <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/enrollments")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEnrollments(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, []);

  const completed = enrollments.filter(
    (e) => (e.currentDay || 1) >= (e.crashCourse?.durationDays || 1),
  );
  const inProgress = enrollments.filter(
    (e) => (e.currentDay || 1) < (e.crashCourse?.durationDays || 1),
  );

  return (
    <>
      <Navbar exams={exams} />
      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <MdSchool size={20} className="text-white/70" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                Your Learning
              </p>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              My Courses
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {loading
                ? "Loading..."
                : `${enrollments.length} course${enrollments.length !== 1 ? "s" : ""} enrolled`}
            </p>

            {/* Stats pills */}
            {!loading && enrollments.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white">
                  📚 {inProgress.length} in progress
                </span>
                {completed.length > 0 && (
                  <span className="rounded-full bg-emerald-500/25 px-3 py-1.5 text-[12px] font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                    ✅ {completed.length} completed
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

          {/* Empty state */}
          {!loading && enrollments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-4xl">
                📅
              </div>
              <p className="text-lg font-bold text-slate-700">
                No courses enrolled yet
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Enroll in a crash course to get a structured day-by-day plan
              </p>
              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 no-underline"
              >
                Browse Courses <MdArrowForward size={16} />
              </Link>
            </div>
          )}

          {/* In progress */}
          {!loading && inProgress.length > 0 && (
            <div className="mb-8">
              {completed.length > 0 && (
                <p className="mb-4 text-sm font-bold text-slate-700">
                  In Progress
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inProgress.map((e) => (
                  <CourseCard key={e.id} e={e} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {!loading && completed.length > 0 && (
            <div>
              <p className="mb-4 text-sm font-bold text-slate-700">Completed</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {completed.map((e) => (
                  <CourseCard key={e.id} e={e} />
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
