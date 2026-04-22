"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestCard from "@/components/TestCard";
import CourseCard from "@/components/CourseCard";
import {
  MdSearch,
  MdClose,
  MdFilterList,
  MdTune,
  MdArrowDropDown,
  MdQuiz,
  MdSchool,
} from "react-icons/md";
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from "@/lib/constants";

const TEST_TYPES = [
  { value: "", label: "All Types", emoji: "📚" },
  { value: "FULL_MOCK", label: "Full Mock", emoji: "📝" },
  { value: "CHAPTER", label: "Chapter Test", emoji: "📖" },
  { value: "TOPIC", label: "Topic Test", emoji: "🔬" },
  { value: "PYP", label: "Previous Year", emoji: "🗓️" },
  { value: "SPEED", label: "Speed Test", emoji: "⚡" },
  { value: "DPT", label: "Daily Practice", emoji: "🎯" },
  { value: "NTA_SIMULATOR", label: "NTA Simulator", emoji: "💻" },
  { value: "SECTIONAL", label: "Sectional", emoji: "📊" },
  { value: "SCHOLARSHIP", label: "Scholarship", emoji: "🏆" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "latest", label: "Latest First" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
];

// ── Filter sidebar section wrapper ───────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Sidebar filter button ────────────────────────────────────────────────────
function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
        active
          ? "bg-teal-50 font-semibold text-teal-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

// ── Mobile filter drawer ─────────────────────────────────────────────────────
function MobileFilterDrawer({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto flex h-full w-80 max-w-full flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-base font-bold text-slate-800">Filters</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <MdClose size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {children}
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

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

// ── Main ─────────────────────────────────────────────────────────────────────
export default function BrowseClient({ exams, subjects, tests, courses }) {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState("tests");
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState(searchParams.get("exam") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterFree, setFilterFree] = useState(
    searchParams.get("free") === "true",
  );
  const [sortBy, setSortBy] = useState("popular");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredSubjects = filterExam
    ? subjects.filter((s) => s.examId === parseInt(filterExam))
    : subjects;

  const filteredTests = useMemo(() => {
    let r = tests.filter((t) => {
      if (filterExam && t.exam?.id !== parseInt(filterExam)) return false;
      if (filterType && t.testType !== filterType) return false;
      if (filterSubject && t.subjectId !== parseInt(filterSubject))
        return false;
      if (filterFree && Number(t.price) !== 0) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
    if (sortBy === "popular")
      r.sort(
        (a, b) =>
          (b._count?.attempts || b.attemptCount || 0) -
          (a._count?.attempts || a.attemptCount || 0),
      );
    if (sortBy === "latest")
      r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "price-low")
      r.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price-high")
      r.sort((a, b) => Number(b.price) - Number(a.price));
    return r;
  }, [
    tests,
    filterExam,
    filterType,
    filterSubject,
    filterFree,
    search,
    sortBy,
  ]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (filterExam && c.exam?.id !== parseInt(filterExam)) return false;
      if (filterFree && Number(c.price) !== 0) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [courses, filterExam, filterFree, search]);

  function clearFilters() {
    setFilterExam("");
    setFilterType("");
    setFilterSubject("");
    setFilterFree(false);
    setSearch("");
  }

  const hasFilters =
    filterExam || filterType || filterSubject || filterFree || search;

  // Active filter chips
  const chips = [
    filterExam && {
      key: "exam",
      label: exams.find((e) => String(e.id) === filterExam)?.name || "Exam",
      clear: () => setFilterExam(""),
    },
    filterType && {
      key: "type",
      label:
        TEST_TYPES.find((t) => t.value === filterType)?.label || filterType,
      clear: () => setFilterType(""),
    },
    filterSubject && {
      key: "subject",
      label:
        subjects.find((s) => String(s.id) === filterSubject)?.name || "Subject",
      clear: () => setFilterSubject(""),
    },
    filterFree && {
      key: "free",
      label: "Free Only",
      clear: () => setFilterFree(false),
    },
  ].filter(Boolean);

  // Sidebar filter content (shared between desktop and mobile drawer)
  const filterContent = (
    <div className="space-y-5">
      {/* Free only */}
      <FilterSection title="Price">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
          <div
            className={`relative flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${filterFree ? "bg-teal-500" : "bg-slate-200"}`}
            onClick={() => setFilterFree((v) => !v)}
          >
            <div
              className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${filterFree ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-[13px] font-semibold text-emerald-700">
            Free Only
          </span>
        </label>
      </FilterSection>

      {/* Exam */}
      <FilterSection title="Exam">
        <div className="space-y-0.5">
          <FilterBtn active={!filterExam} onClick={() => setFilterExam("")}>
            All Exams
          </FilterBtn>
          {exams.map((exam) => (
            <FilterBtn
              key={exam.id}
              active={filterExam === String(exam.id)}
              onClick={() => setFilterExam(String(exam.id))}
            >
              {exam.name}
            </FilterBtn>
          ))}
        </div>
      </FilterSection>

      {/* Test Type */}
      <FilterSection title="Test Type">
        <div className="space-y-0.5">
          {TEST_TYPES.map((type) => (
            <FilterBtn
              key={type.value}
              active={filterType === type.value}
              onClick={() => setFilterType(type.value)}
            >
              <span className="mr-1.5">{type.emoji}</span>
              {type.label}
              {type.value && (
                <span className="ml-1 text-[11px] text-slate-400">
                  ({tests.filter((t) => t.testType === type.value).length})
                </span>
              )}
            </FilterBtn>
          ))}
        </div>
      </FilterSection>

      {/* Subject */}
      {filteredSubjects.length > 0 && (
        <FilterSection title="Subject">
          <div className="space-y-0.5">
            <FilterBtn
              active={!filterSubject}
              onClick={() => setFilterSubject("")}
            >
              All Subjects
            </FilterBtn>
            {filteredSubjects.map((s) => (
              <FilterBtn
                key={s.id}
                active={filterSubject === String(s.id)}
                onClick={() => setFilterSubject(String(s.id))}
              >
                {s.name}
              </FilterBtn>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      <Navbar exams={exams} />

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {filterContent}
      </MobileFilterDrawer>

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO / SEARCH BAR ── */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Browse Tests &amp; Courses
            </h1>
            <p className="mt-1 text-sm text-white/70 sm:text-base">
              {tests.length} tests · {courses.length} courses available
            </p>

            {/* Search */}
            <div className="relative mt-5 max-w-xl">
              <MdSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search tests, courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <MdClose size={18} />
                </button>
              )}
            </div>

            {/* Exam quick-filter pills */}
            {exams.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterExam("")}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                    !filterExam
                      ? "bg-white text-teal-700"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  All Exams
                </button>
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setFilterExam(String(exam.id))}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                      filterExam === String(exam.id)
                        ? "bg-white text-teal-700"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {exam.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-6 items-start">
            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="hidden w-56 flex-shrink-0 lg:block xl:w-64">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <MdTune size={16} className="text-slate-500" />
                    <p className="text-sm font-bold text-slate-800">Filters</p>
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[12px] font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="p-4">{filterContent}</div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="min-w-0 flex-1">
              {/* Top bar: tabs + sort + mobile filter btn */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  {[
                    {
                      value: "tests",
                      label: `Tests`,
                      count: filteredTests.length,
                      icon: <MdQuiz size={15} />,
                    },
                    {
                      value: "courses",
                      label: `Courses`,
                      count: filteredCourses.length,
                      icon: <MdSchool size={15} />,
                    },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTab(t.value)}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        tab === t.value
                          ? "bg-teal-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          tab === t.value
                            ? "bg-white/25 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-[13px] font-medium text-slate-600 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <MdArrowDropDown
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                  </div>

                  {/* Mobile filter button */}
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-700 lg:hidden"
                  >
                    <MdFilterList size={16} />
                    Filters
                    {hasFilters && (
                      <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {chips.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Active filter chips */}
              {chips.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip.key}
                      className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[12px] font-semibold text-teal-700"
                    >
                      {chip.label}
                      <button
                        onClick={chip.clear}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        <MdClose size={13} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[12px] font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* ── TESTS ── */}
              {tab === "tests" &&
                (filteredTests.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredTests.map((test) => (
                      <TestCard key={test.id} test={test} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="text-5xl">🔍</p>
                    <p className="mt-4 text-lg font-bold text-slate-700">
                      No tests found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {hasFilters
                        ? "Try adjusting or clearing your filters"
                        : "No tests available yet"}
                    </p>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-5 rounded-xl border border-teal-300 bg-teal-50 px-6 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ))}

              {/* ── COURSES ── */}
              {tab === "courses" &&
                (filteredCourses.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="text-5xl">📚</p>
                    <p className="mt-4 text-lg font-bold text-slate-700">
                      No courses found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {hasFilters
                        ? "Try clearing your filters"
                        : "No courses available yet"}
                    </p>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-5 rounded-xl border border-teal-300 bg-teal-50 px-6 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Footer exams={exams} />
    </>
  );
}
