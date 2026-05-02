"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestCard from "@/components/TestCard";
import CourseCard from "@/components/CourseCard";
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from "@/lib/constants";
import {
  MdArrowForward,
  MdSearch,
  MdFilterList,
  MdClose,
  MdSchool,
  MdQuiz,
  MdStar,
} from "react-icons/md";
import Link from "next/link";

const TEST_TYPES = [
  { value: "", label: "All Tests", emoji: "📚" },
  { value: "FULL_MOCK", label: "Full Mocks", emoji: "📝" },
  { value: "CHAPTER", label: "Chapter Tests", emoji: "📖" },
  { value: "PYP", label: "Previous Year", emoji: "🗓️" },
  { value: "SPEED", label: "Speed Tests", emoji: "⚡" },
  { value: "DPT", label: "Daily Practice", emoji: "🎯" },
  { value: "SECTIONAL", label: "Sectional", emoji: "🔬" },
];

// ── Skeleton ─────────────────────────────────────────────────────────────────
function TestSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="h-0.5 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-10 rounded-full bg-slate-100 ml-auto" />
        </div>
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="h-32 rounded-xl bg-slate-100" />
      <div className="h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="h-9 rounded-xl bg-slate-100" />
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-base font-extrabold leading-none text-white">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] text-white/70">{label}</p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ExamPage() {
  const { slug } = useParams();
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("tests"); // 'tests' | 'courses'

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch data
  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setExams(d.data);
          const found = d.data.find((e) => e.slug === slug);
          setExam(found);
          if (found) {
            Promise.all([
              fetch(`/api/tests?examId=${found.id}&limit=100`).then((r) =>
                r.json(),
              ),
              fetch(`/api/courses?examId=${found.id}`).then((r) => r.json()),
            ])
              .then(([t, c]) => {
                if (t.success) setTests(t.data?.tests || t.data || []);
                if (c.success) setCourses(c.data || []);
              })
              .finally(() => setLoading(false));
          } else setLoading(false);
        }
      });
  }, [slug]);

  // Derived
  const color = exam
    ? EXAM_COLORS[exam.name] || DEFAULT_EXAM_COLOR
    : DEFAULT_EXAM_COLOR;

  const filtered = tests.filter((t) => {
    if (typeFilter && t.testType !== typeFilter) return false;
    if (freeOnly && Number(t.price) !== 0) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const freeCount = tests.filter((t) => Number(t.price) === 0).length;
  const hasFilters = typeFilter || freeOnly || search;

  function clearFilters() {
    setTypeFilter("");
    setFreeOnly(false);
    setSearchInput("");
    setSearch("");
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!exam && !loading)
    return (
      <>
        <Navbar exams={exams} />
        <div className="flex min-h-screen items-center justify-center px-4 pt-20">
          <div className="text-center">
            <p className="text-6xl">🔍</p>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">
              Exam not found
            </h1>
            <p className="mt-2 text-slate-500">
              The exam you're looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Go Home <MdArrowForward size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar exams={exams} />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color.text} 0%, #0891B2 100%)`,
          }}
        >
          {/* bg decoration */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-xs text-white/60">
              <Link href="/" className="hover:text-white/90 transition">
                Home
              </Link>
              <span>/</span>
              <span className="text-white/80">Exams</span>
              <span>/</span>
              <span className="text-white font-medium">
                {exam?.name || "..."}
              </span>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {/* Exam badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                  <MdSchool size={14} className="text-white/80" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                    Exam Prep
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {exam?.name || (
                    <span className="inline-block h-10 w-64 animate-pulse rounded-xl bg-white/20" />
                  )}
                </h1>

                {exam?.description && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                    {exam.description}
                  </p>
                )}
              </div>

              {/* Stats pills */}
              {!loading && (
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <StatPill
                    icon="📝"
                    value={tests.length}
                    label="Total Tests"
                  />
                  <StatPill icon="🆓" value={freeCount} label="Free Tests" />
                  {courses.length > 0 && (
                    <StatPill
                      icon="🎓"
                      value={courses.length}
                      label="Courses"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Other exams quick nav */}
            {exams.length > 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {exams.map((e) => {
                  const isActive = e.slug === slug;
                  return (
                    <Link
                      key={e.id}
                      href={`/exam/${e.slug}`}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                        isActive
                          ? "bg-white text-slate-800"
                          : "bg-white/15 text-white hover:bg-white/25"
                      }`}
                    >
                      {e.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Tabs — Tests / Courses */}
          {!loading && courses.length > 0 && (
            <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit">
              {[
                {
                  key: "tests",
                  label: `Tests (${tests.length})`,
                  icon: <MdQuiz size={15} />,
                },
                {
                  key: "courses",
                  label: `Courses (${courses.length})`,
                  icon: <MdSchool size={15} />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Tests tab ── */}
          {(activeTab === "tests" || courses.length === 0) && (
            <>
              {/* Search + filter bar */}
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <MdSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Free toggle */}
                <button
                  onClick={() => setFreeOnly((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    freeOnly
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  🆓 Free Only
                </button>

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <MdClose size={14} /> Clear
                  </button>
                )}

                {/* Results count */}
                {!loading && (
                  <span className="ml-auto text-sm text-slate-500 font-medium">
                    {filtered.length} {filtered.length === 1 ? "test" : "tests"}
                  </span>
                )}
              </div>

              {/* Type filter pills */}
              <div className="mb-6 flex flex-wrap gap-2">
                {TEST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${
                      typeFilter === t.value
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <span className="text-sm">{t.emoji}</span>
                    {t.label}
                    {t.value && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          typeFilter === t.value
                            ? "bg-white/25 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tests.filter((x) => x.testType === t.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TestSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-5xl">📭</p>
                  <p className="mt-4 text-lg font-semibold text-slate-700">
                    No tests found
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {hasFilters
                      ? "Try clearing your filters"
                      : "No tests available yet for this exam"}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Courses tab ── */}
          {activeTab === "courses" && courses.length > 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                  Crash Courses for {exam?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Structured day-by-day preparation plans with daily tests and
                  notes
                </p>
              </div>
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CourseSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {courses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Empty state (no data at all) ── */}
          {!loading && tests.length === 0 && courses.length === 0 && (
            <div className="py-28 text-center">
              <p className="text-6xl">📚</p>
              <h2 className="mt-5 text-xl font-bold text-slate-700">
                No content yet
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                We're adding tests for {exam?.name} soon. Check back!
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                Browse All Tests <MdArrowForward size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer exams={exams} />
    </>
  );
}
