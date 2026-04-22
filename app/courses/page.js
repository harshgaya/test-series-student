"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { MdSearch, MdClose } from "react-icons/md";

function CourseSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="h-36 rounded-xl bg-slate-100" />
      <div className="h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="h-9 rounded-xl bg-slate-100" />
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCourses(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    if (examFilter && c.exam?.id !== parseInt(examFilter)) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const hasFilters = examFilter || search;

  return (
    <>
      <Navbar exams={exams} />
      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              IITNEET · Courses
            </p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Crash Courses
            </h1>
            <p className="mb-8 text-sm text-white/75 sm:text-base">
              Structured day-by-day plans for NEET, JEE &amp; EAMCET — with
              daily tests, video lectures &amp; PDF notes
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <MdSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-10 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <MdClose size={18} />
                </button>
              )}
            </div>

            {/* Exam filter pills */}
            {exams.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setExamFilter("")}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                    !examFilter
                      ? "bg-white text-teal-700"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  All Courses
                </button>
                {exams.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setExamFilter(String(e.id))}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                      examFilter === String(e.id)
                        ? "bg-white text-teal-700"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Results bar */}
          {!loading && (
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {filtered.length} {filtered.length === 1 ? "course" : "courses"}
                {examFilter
                  ? ` for ${exams.find((e) => String(e.id) === examFilter)?.name}`
                  : ""}
                {search ? ` matching "${search}"` : ""}
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setExamFilter("");
                    setSearch("");
                  }}
                  className="flex items-center gap-1 text-[12px] font-semibold text-red-500 transition hover:text-red-600"
                >
                  <MdClose size={14} /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl">📅</p>
              <p className="mt-4 text-lg font-bold text-slate-700">
                No courses found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {hasFilters ? "Try clearing your filters" : "Check back soon!"}
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setExamFilter("");
                    setSearch("");
                  }}
                  className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer exams={exams} />
    </>
  );
}
