"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdArrowForward,
  MdTimer,
  MdLocalFireDepartment,
  MdCheckCircle,
  MdBookmark,
  MdLeaderboard,
  MdAnalytics,
  MdSchool,
  MdCampaign,
  MdPlayArrow,
  MdShoppingBag,
  MdEventNote,
  MdLibraryBooks,
  MdTune,
} from "react-icons/md";

// Full class strings so Tailwind's JIT can discover them
const tileColors = {
  teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
  cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  indigo:
    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  violet:
    "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  amber:
    "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
  emerald:
    "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
};

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    // Proxy guarantees we're logged in. Fetch student + everything in parallel.
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/student/purchases").then((r) => r.json()),
      fetch("/api/student/enrollments").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
      fetch("/api/student/attempts").then((r) => r.json()),
      fetch("/api/exams").then((r) => r.json()),
    ])
      .then(([me, p, e, a, at, ex]) => {
        if (me?.success) {
          const parsed = me.data.student;
          setStudent(parsed);

          // Exam countdown
          const year = parsed.targetYear || 2026;
          const examDate = new Date(`${year}-05-01`);
          const diff = Math.ceil(
            (examDate - new Date()) / (1000 * 60 * 60 * 24),
          );
          if (diff > 0) setDaysLeft(diff);
        }
        if (p.success) setPurchases(p.data);
        if (e.success) setEnrollments(e.data);
        if (a.success) setAnnouncements(a.data);
        if (at.success) setAttempts(at.data);
        if (ex.success) setExams(ex.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Streak calculation
  const streak = (() => {
    if (!attempts.length) return 0;
    const dates = [
      ...new Set(attempts.map((a) => new Date(a.submittedAt).toDateString())),
    ].sort((a, b) => new Date(b) - new Date(a));
    let count = 0;
    let current = new Date();
    for (const d of dates) {
      const diff = Math.floor((current - new Date(d)) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        count++;
        current = new Date(d);
      } else break;
    }
    return count;
  })();

  const firstName = student?.name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    {
      label: "Free Tests",
      href: "/browse?free=true",
      icon: MdPlayArrow,
      color: "teal",
    },
    {
      label: "My Tests",
      href: "/my-tests",
      icon: MdShoppingBag,
      color: "cyan",
    },
    {
      label: "My Courses",
      href: "/my-courses",
      icon: MdEventNote,
      color: "blue",
    },

    // {
    //   label: "Custom Test",
    //   href: "/custom-test",
    //   icon: MdTune,
    //   color: "violet",
    // },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: MdBookmark,
      color: "amber",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: MdAnalytics,
      color: "emerald",
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      icon: MdLeaderboard,
      color: "rose",
    },
  ];

  return (
    <>
      <Navbar exams={exams} />
      <main className="mt-[68px] min-h-screen bg-slate-50">
        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600">
          {/* decorative glows */}
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-5 py-10 md:py-14">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/75">
                  {greeting}, 👋
                </p>
                <h1 className="mt-1 truncate text-3xl md:text-4xl font-black tracking-tight text-white">
                  {firstName}
                </h1>
                {student?.targetYear && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20 backdrop-blur">
                    <MdSchool className="text-white/90" size={14} />
                    <span className="text-xs font-semibold text-white">
                      Target {student.targetYear}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid w-full grid-cols-3 gap-3 md:w-auto">
                <StatCard
                  icon={<MdTimer />}
                  value={daysLeft ?? "—"}
                  label="Days to exam"
                />
                <StatCard
                  icon={<MdLocalFireDepartment />}
                  value={streak}
                  label="Day streak"
                  highlight={streak > 0}
                />
                <StatCard
                  icon={<MdCheckCircle />}
                  value={attempts.length}
                  label="Tests done"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── BODY ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl space-y-8 px-5 py-8">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="space-y-2">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                    <MdCampaign size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-teal-900">{a.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick access
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="group relative flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${tileColors[a.color]}`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {a.label}
                    </span>
                    <MdArrowForward
                      className="absolute right-3 top-3 text-slate-300 transition-colors group-hover:text-teal-600"
                      size={16}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Two-column: Recent attempts + My Courses */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Recent attempts */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent attempts
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {attempts.length === 0
                      ? "Nothing yet"
                      : `Your last ${Math.min(attempts.length, 5)} tests`}
                  </p>
                </div>
                {attempts.length > 0 && (
                  <Link
                    href="/analytics"
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View all <MdArrowForward size={14} />
                  </Link>
                )}
              </div>

              {attempts.length === 0 ? (
                <EmptyState
                  icon={<MdAnalytics size={28} />}
                  title="No attempts yet"
                  description="Take your first mock to unlock analytics"
                  ctaHref="/browse?free=true"
                  ctaLabel="Attempt free mock"
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {attempts.slice(0, 5).map((a) => {
                    const pct =
                      a.totalMarks > 0
                        ? Math.round((Number(a.score) / a.totalMarks) * 100)
                        : 0;
                    const tone =
                      pct >= 70 ? "emerald" : pct >= 40 ? "amber" : "rose";
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/result/${a.id}`}
                          className="group -mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50"
                        >
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}
                          >
                            <span className="text-sm font-black leading-none">
                              {pct}
                            </span>
                            <span className="mt-0.5 text-[9px] font-semibold">
                              %
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                              {a.test?.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <span>
                                {new Date(a.submittedAt).toLocaleDateString(
                                  "en-IN",
                                  { day: "numeric", month: "short" },
                                )}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="font-semibold text-slate-700">
                                {Number(a.score)} / {a.totalMarks}
                              </span>
                            </div>
                          </div>

                          <MdArrowForward
                            className="flex-shrink-0 text-slate-300 transition-colors group-hover:text-teal-600"
                            size={18}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* My Courses */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    My courses
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {enrollments.length === 0
                      ? "Not enrolled yet"
                      : `${enrollments.length} enrolled`}
                  </p>
                </div>
                {enrollments.length > 0 && (
                  <Link
                    href="/my-courses"
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View all <MdArrowForward size={14} />
                  </Link>
                )}
              </div>

              {enrollments.length === 0 ? (
                <EmptyState
                  icon={<MdEventNote size={28} />}
                  title="No courses yet"
                  description="Crash courses accelerate your prep"
                  ctaHref="/courses"
                  ctaLabel="Browse courses"
                />
              ) : (
                <ul className="space-y-3">
                  {enrollments.slice(0, 3).map((e) => {
                    const total = Math.max(e.crashCourse?.durationDays || 1, 1);
                    const pct = Math.min(
                      100,
                      Math.round(((e.currentDay - 1) / total) * 100),
                    );
                    return (
                      <li key={e.id}>
                        <Link
                          href={`/course/${e.crashCourse?.id}`}
                          className="group block rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:border-teal-200 hover:bg-teal-50/40"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-white text-teal-600 ring-1 ring-slate-200">
                              <span className="text-sm font-black leading-none">
                                {total}
                              </span>
                              <span className="mt-0.5 text-[9px] font-bold leading-none">
                                DAYS
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                                {e.crashCourse?.title}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right text-[11px] font-bold text-teal-700">
                                  {pct}%
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Day {e.currentDay} of {total}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatCard({ icon, value, label, highlight }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15 backdrop-blur-sm md:px-4 md:py-3.5">
      <div className="flex items-center gap-1.5 text-white/70">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`mt-1 text-2xl md:text-3xl font-black leading-none ${highlight ? "text-amber-200" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ icon, title, description, ctaHref, ctaLabel }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs text-slate-500">{description}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
      >
        {ctaLabel} <MdArrowForward size={14} />
      </Link>
    </div>
  );
}
