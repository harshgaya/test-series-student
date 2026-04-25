"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdInsights,
  MdAssignment,
  MdQuestionAnswer,
  MdCheckCircle,
  MdGpsFixed,
  MdTrendingUp,
  MdTrendingDown,
  MdMenuBook,
  MdWarningAmber,
  MdArrowForward,
  MdHistory,
} from "react-icons/md";

/* Tailwind-safe lookup tables (full class strings for JIT) */

const accuracyTextTone = {
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
};
const accuracyBarTone = {
  emerald: "bg-gradient-to-r from-emerald-400 to-emerald-500",
  amber: "bg-gradient-to-r from-amber-400 to-amber-500",
  rose: "bg-gradient-to-r from-rose-400 to-rose-500",
};
const pctChipTone = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};
const statCardTone = {
  teal: { icon: "bg-teal-50 text-teal-600", value: "text-teal-700" },
  blue: { icon: "bg-blue-50 text-blue-600", value: "text-blue-700" },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-700",
  },
  amber: { icon: "bg-amber-50 text-amber-600", value: "text-amber-700" },
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/analytics").then((r) => r.json()),
      fetch("/api/student/attempts").then((r) => r.json()),
      fetch("/api/exams").then((r) => r.json()),
    ])
      .then(([a, at, e]) => {
        if (a.success) setData(a.data);
        if (at.success) setAttempts(at.data);
        if (e.success) setExams(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const accuracy =
    data && data.totalAnswered > 0
      ? Math.round((data.totalCorrect / data.totalAnswered) * 100)
      : null;

  // Trend = avg of second half minus avg of first half of scoreTrend
  const trend = (() => {
    if (!data?.scoreTrend || data.scoreTrend.length < 4) return null;
    const t = data.scoreTrend;
    const half = Math.floor(t.length / 2);
    const oldAvg = t.slice(0, half).reduce((s, x) => s + x.pct, 0) / half;
    const newAvg =
      t.slice(half).reduce((s, x) => s + x.pct, 0) / (t.length - half);
    return Math.round(newAvg - oldAvg);
  })();

  const isEmpty = !loading && (!data || data.totalAttempts === 0);

  return (
    <>
      <Navbar exams={exams} />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MdInsights size={18} className="text-white/80" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                    Performance Dashboard
                  </p>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  My Analytics
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  {isEmpty
                    ? "Attempt tests to see your progress"
                    : "Track your performance, find weak areas, improve faster"}
                </p>
              </div>

              {!loading && !isEmpty && accuracy !== null && (
                <div className="rounded-2xl bg-white/10 px-5 py-3 ring-1 ring-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <MdGpsFixed size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      Overall accuracy
                    </p>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">
                      {accuracy}%
                    </p>
                    {trend !== null && trend !== 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                          trend > 0 ? "text-emerald-200" : "text-rose-200"
                        }`}
                      >
                        {trend > 0 ? (
                          <MdTrendingUp size={14} />
                        ) : (
                          <MdTrendingDown size={14} />
                        )}
                        {trend > 0 ? "+" : ""}
                        {trend}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── BODY ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          {loading ? (
            <LoadingState />
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <StatCard
                  icon={<MdAssignment size={18} />}
                  label="Total Attempts"
                  value={data.totalAttempts}
                  tone="teal"
                />
                <StatCard
                  icon={<MdQuestionAnswer size={18} />}
                  label="Questions Answered"
                  value={data.totalAnswered}
                  tone="blue"
                />
                <StatCard
                  icon={<MdCheckCircle size={18} />}
                  label="Correct Answers"
                  value={data.totalCorrect}
                  tone="emerald"
                />
                <StatCard
                  icon={<MdGpsFixed size={18} />}
                  label="Accuracy"
                  value={accuracy !== null ? `${accuracy}%` : "—"}
                  tone="amber"
                />
              </div>

              {/* Score trend */}
              {data.scoreTrend?.length > 0 && (
                <Card
                  title="Score Trend"
                  subtitle={
                    data.scoreTrend.length === 1
                      ? "Attempt one more test to see your trend"
                      : `Your last ${data.scoreTrend.length} attempts`
                  }
                  icon={<MdTrendingUp size={18} />}
                >
                  {data.scoreTrend.length < 2 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                      Need at least 2 attempts to draw a trend
                    </div>
                  ) : (
                    <ScoreTrendChart data={data.scoreTrend} />
                  )}
                </Card>
              )}

              {/* Subject accuracy */}
              {data.subjectStats?.length > 0 && (
                <Card
                  title="Subject-wise Accuracy"
                  subtitle="Where you're strong and weak"
                  icon={<MdMenuBook size={18} />}
                >
                  <div className="space-y-4">
                    {data.subjectStats.map((s, i) => {
                      const tone =
                        s.accuracy >= 70
                          ? "emerald"
                          : s.accuracy >= 40
                            ? "amber"
                            : "rose";
                      return (
                        <div key={i}>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">
                              {s.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] text-slate-500">
                                {s.correct}/{s.total}
                              </span>
                              <span
                                className={`text-[12px] font-black ${accuracyTextTone[tone]}`}
                              >
                                {s.accuracy}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${accuracyBarTone[tone]}`}
                              style={{ width: `${s.accuracy}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Weak chapters */}
              {data.weakChapters?.length > 0 && (
                <Card
                  title="Weak Areas"
                  subtitle="Chapters that need your attention"
                  icon={<MdWarningAmber size={18} />}
                >
                  <div className="space-y-2">
                    {data.weakChapters.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 ring-1 ring-rose-100">
                          <MdWarningAmber size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {c.name}
                          </p>
                          {c.subject && (
                            <p className="truncate text-xs text-slate-500">
                              {c.subject}
                            </p>
                          )}
                        </div>
                        <span className="hidden rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700 sm:inline-block">
                          {c.accuracy}%
                        </span>
                        <Link
                          href={`/custom-test${c.id ? `?chapterId=${c.id}` : ""}`}
                          className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose-700"
                        >
                          Practice <MdArrowForward size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Past attempts */}
              {attempts.length > 0 && (
                <Card
                  title="All Past Attempts"
                  subtitle={`${attempts.length} total`}
                  icon={<MdHistory size={18} />}
                >
                  <ul className="divide-y divide-slate-100">
                    {attempts.slice(0, 10).map((a) => {
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
                              className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${pctChipTone[tone]}`}
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
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                {a.test?.exam?.name && (
                                  <span className="font-semibold">
                                    {a.test.exam.name}
                                  </span>
                                )}
                                {a.test?.exam?.name && (
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                )}
                                <span>
                                  {new Date(a.submittedAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                            <p className="flex-shrink-0 text-sm font-black text-slate-900">
                              {Number(a.score)}
                              <span className="text-slate-400">
                                /{a.totalMarks}
                              </span>
                            </p>
                            <MdArrowForward
                              className="flex-shrink-0 text-slate-300 transition-colors group-hover:text-teal-600"
                              size={18}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {attempts.length > 10 && (
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Showing 10 of {attempts.length}
                    </p>
                  )}
                </Card>
              )}
            </div>
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

function StatCard({ icon, label, value, tone }) {
  const t = statCardTone[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${t.icon}`}
      >
        {icon}
      </div>
      <p className={`mt-3 text-2xl font-black sm:text-3xl ${t.value}`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Card({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function ScoreTrendChart({ data }) {
  const width = 700;
  const height = 220;
  const padding = { top: 24, right: 24, bottom: 28, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const n = Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = padding.left + (i / n) * chartWidth;
    const y = padding.top + chartHeight - (d.pct / 100) * chartHeight;
    return { x, y, pct: d.pct };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full min-w-[320px]"
      >
        <defs>
          <linearGradient id="analytics-chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines */}
        {[0, 25, 50, 75, 100].map((y) => {
          const yPos = padding.top + chartHeight - (y / 100) * chartHeight;
          return (
            <g key={y}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={width - padding.right}
                y2={yPos}
                stroke="#E2E8F0"
                strokeDasharray={y === 0 ? "0" : "2 3"}
              />
              <text
                x={padding.left - 8}
                y={yPos + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {y}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#analytics-chart-grad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#0D9488"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points with value labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="white"
              stroke="#0D9488"
              strokeWidth="2.5"
            />
            {/* Only label every other point if list is dense */}
            {(points.length <= 6 || i % 2 === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-slate-700 text-[10px] font-bold"
              >
                {p.pct}%
              </text>
            )}
          </g>
        ))}

        {/* X-axis endpoints */}
        <text
          x={points[0].x}
          y={height - 8}
          textAnchor="start"
          className="fill-slate-400 text-[10px]"
        >
          Older
        </text>
        <text
          x={points[points.length - 1].x}
          y={height - 8}
          textAnchor="end"
          className="fill-slate-400 text-[10px]"
        >
          Latest
        </text>
      </svg>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600" />
      <p className="mt-4 text-sm text-slate-500">Loading your analytics…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center sm:py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-400">
        <MdInsights size={32} />
      </div>
      <h2 className="text-lg font-bold text-slate-800">No analytics yet</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Attempt tests to start seeing your score trends, subject accuracy, and
        weak areas.
      </p>
      <Link
        href="/browse"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
      >
        Browse Tests <MdArrowForward size={16} />
      </Link>
    </div>
  );
}
