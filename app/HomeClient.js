"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestCard from "@/components/TestCard";
import CourseCard from "@/components/CourseCard";
import {
  TOPPERS,
  PLATFORM_STATS,
  KEY_FEATURES,
  EXAM_COLORS,
  DEFAULT_EXAM_COLOR,
  SUPPORT_WHATSAPP,
} from "@/lib/constants";
import {
  MdArrowForward,
  MdWhatsapp,
  MdCheckCircle,
  MdVerified,
  MdTimer,
  MdCardGiftcard,
  MdLocalFireDepartment,
  MdStar,
  MdClose,
  MdSearch,
} from "react-icons/md";

// ── Constants ────────────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-sky-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-fuchsia-500",
  "from-orange-300 to-red-400",
  "from-blue-400 to-indigo-500",
];

const TEST_TYPES = [
  { value: "", label: "All Types" },
  { value: "FULL_MOCK", label: "Full Mock" },
  { value: "CHAPTER", label: "Chapter Test" },
  { value: "PYP", label: "Previous Year" },
  { value: "SECTIONAL", label: "Sectional" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
];

// ── Scholarship helpers ──────────────────────────────────────────────────────
function getScholarshipState(test) {
  if (!test) return null;
  const now = new Date();
  const scheduled = test.scheduledAt ? new Date(test.scheduledAt) : null;
  const started = test.startedAt ? new Date(test.startedAt) : null;
  const ended = test.endedAt ? new Date(test.endedAt) : null;

  if (ended && now > ended) return "ended";
  if (started && now >= started) return "live";
  if (scheduled && now < scheduled) return "upcoming";
  return "open"; // published, no schedule constraints
}

function getDaysLeft(dateStr) {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date()) / 86400000));
}

function getDaysUntil(dateStr) {
  if (!dateStr) return 0;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

// ── Scholarship Popup ────────────────────────────────────────────────────────
// ── Scholarship Popup (compact, bottom-right) ───────────────────────────────
// Drop this in place of the old ScholarshipPopup in your HomeClient file.
// Positioning: bottom-right on desktop, bottom on mobile (with gap for WhatsApp FAB).

function ScholarshipPopup({ test, state, onClose }) {
  const daysLeft = test.endedAt ? getDaysLeft(test.endedAt) : null;
  const daysUntil = test.scheduledAt ? getDaysUntil(test.scheduledAt) : null;

  const cta =
    state === "upcoming"
      ? "Get Notified"
      : state === "live"
        ? "Attempt Now"
        : "Attempt Free";

  const badgeText =
    state === "live"
      ? "LIVE NOW"
      : state === "upcoming"
        ? `OPENS IN ${daysUntil}D`
        : "FREE TEST";

  return (
    <div
      className="
        fixed z-40
        left-4 right-4 bottom-4
        sm:left-auto sm:right-6 sm:bottom-24
        sm:w-[340px]
        animate-[slideUp_0.4s_ease-out]
      "
    >
      <div
        className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        ring-1 ring-amber-400/20
        shadow-2xl shadow-amber-500/10
      "
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <MdClose size={16} />
        </button>

        <div className="relative p-4">
          {/* Header row: icon + badge */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg shadow-lg">
              🏆
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2 py-0.5 ring-1 ring-amber-400/30">
              {state === "live" ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
              ) : (
                <MdTimer size={10} className="text-amber-400" />
              )}
              <span className="text-[10px] font-black tracking-wider text-amber-300">
                {badgeText}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold leading-snug text-white">
            {test.title}
          </h3>

          {/* Meta row — compact stats inline */}
          <p className="mt-1.5 text-[11px] text-slate-400">
            {test.durationMins}m{" · "}
            {test.totalMarks} marks
            {Number(test.price) === 0 && (
              <>
                {" "}
                · <span className="font-semibold text-emerald-400">Free</span>
              </>
            )}
          </p>

          {/* Urgency (only if live + days left) */}
          {state === "live" && daysLeft !== null && daysLeft <= 7 && (
            <p className="mt-2 text-[11px] text-rose-300">
              <MdTimer size={10} className="inline -mt-0.5 mr-1" />
              Closes in{" "}
              <strong className="text-white">
                {daysLeft} day{daysLeft === 1 ? "" : "s"}
              </strong>
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/test/${test.id}`}
            onClick={onClose}
            className="
              mt-3 flex items-center justify-center gap-1.5
              rounded-xl bg-gradient-to-r from-amber-400 to-orange-500
              px-4 py-2.5 text-[13px] font-black text-slate-900
              shadow-lg shadow-amber-500/30
              transition hover:brightness-110
            "
          >
            {cta}
            <MdArrowForward size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── TestSkeleton ─────────────────────────────────────────────────────────────
function TestSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="h-0.5 bg-slate-100" />
      <div className="p-4">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-10 rounded-full bg-slate-100 ml-auto" />
        </div>
        <div className="h-4 w-3/4 rounded bg-slate-100 mb-1.5" />
        <div className="h-4 w-1/2 rounded bg-slate-100 mb-4" />
        <div className="h-16 rounded-xl bg-slate-100 mb-3" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeClient({
  exams,
  featuredCourses = [],
  announcements = [],
}) {
  // Tests state
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsMeta, setTestsMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  // Scholarship state — fetched from API
  const [scholarship, setScholarship] = useState(null);
  const [scholarshipState, setScholarshipState] = useState(null);

  // Filters
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Popup
  const [showPopup, setShowPopup] = useState(false);

  // ── Fetch scholarship test ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchScholarship() {
      try {
        const res = await fetch(
          "/api/tests?type=SCHOLARSHIP&limit=1&status=PUBLISHED",
        );
        const data = await res.json();
        const tests = data.data?.tests || data.data || [];
        if (tests.length > 0) {
          const t = tests[0];
          const state = getScholarshipState(t);
          if (state !== "ended") {
            setScholarship(t);
            setScholarshipState(state);
            // Show popup after 3s, once per session
            const seen = sessionStorage.getItem("scholarship_popup_seen");
            if (!seen) {
              setTimeout(() => {
                setShowPopup(true);
                sessionStorage.setItem("scholarship_popup_seen", "1");
              }, 3000);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch scholarship:", err);
      }
    }
    fetchScholarship();
  }, []);

  // ── Fetch tests ─────────────────────────────────────────────────────────────
  const fetchTests = useCallback(async () => {
    setTestsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "12");
      if (selectedExam) params.set("examId", selectedExam);
      if (selectedType) params.set("type", selectedType);
      if (freeOnly) params.set("isFree", "true");
      if (search) params.set("search", search);

      const res = await fetch(`/api/tests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTests(data.data?.tests || data.data || []);
        setTestsMeta({
          total: data.data?.total || 0,
          totalPages: data.data?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setTestsLoading(false);
    }
  }, [page, selectedExam, selectedType, freeOnly, search]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);
  useEffect(() => {
    setPage(1);
  }, [selectedExam, selectedType, freeOnly, search]);
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const hasActiveFilters = selectedExam || selectedType || freeOnly || search;

  function clearFilters() {
    setSelectedExam(null);
    setSelectedType("");
    setFreeOnly(false);
    setSearchInput("");
    setSearch("");
  }

  // Scholarship strip label
  const stripLabel =
    scholarshipState === "live"
      ? `🔴 Live Now — ${scholarship?.title}`
      : scholarshipState === "upcoming"
        ? `⏳ Coming Soon — ${scholarship?.title}`
        : `🎁 ${scholarship?.title}`;

  return (
    <div className="bg-white text-slate-900 font-[family-name:var(--font-body)]">
      <Navbar exams={exams} />
      <div className="h-16" />

      {/* ── Scholarship Popup ── */}
      {showPopup && scholarship && scholarshipState !== "ended" && (
        <ScholarshipPopup
          test={scholarship}
          state={scholarshipState}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* ── Scholarship top strip (only if scholarship exists & not ended) ── */}
      {scholarship && scholarshipState !== "ended" && (
        <Link
          href={`/test/${scholarship.id}`}
          className="relative block overflow-hidden transition hover:brightness-105"
          style={{
            background:
              scholarshipState === "live"
                ? "linear-gradient(90deg, #DC2626, #EA580C, #D97706)"
                : "linear-gradient(90deg, #D97706, #EA580C, #EF4444)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-3 text-center sm:px-6 lg:px-8">
            {scholarshipState === "live" && (
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
            )}
            <MdCardGiftcard className="hidden text-white sm:block" size={15} />
            <p className="text-[13px] font-semibold text-white sm:text-sm">
              {stripLabel}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white ring-1 ring-white/30 backdrop-blur">
              {scholarshipState === "upcoming"
                ? "Get Notified"
                : "Attempt Free"}
              <MdArrowForward size={11} />
            </span>
          </div>
        </Link>
      )}

      {/* ── General announcement (only if no scholarship) ── */}
      {!scholarship && announcements.length > 0 && (
        <div className="bg-gradient-to-r from-teal-700 to-teal-500">
          <div className="mx-auto max-w-7xl px-5 py-3 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-white">
              🔥 {announcements[0].title} — {announcements[0].message}
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-sky-50 to-violet-50">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-40 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {/* LEFT */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur">
                <MdVerified className="text-teal-600" size={16} />
                <span className="text-xs font-semibold tracking-wide text-teal-800">
                  Trusted by 7,000+ NEET &amp; JEE Toppers
                </span>
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 font-[family-name:var(--font-display)] sm:text-5xl lg:text-6xl xl:text-[64px]">
                India's{" "}
                <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  #1 Platform
                </span>
                <br />
                for NEET &amp; JEE
                <br />
                <span className="text-teal-700">Mock Tests</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Practice with{" "}
                <strong className="text-slate-900">50,000+ MCQs</strong>, get
                your All India Rank, and track progress with detailed analytics.{" "}
                <span className="font-medium text-slate-800">
                  Where toppers practice daily.
                </span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/browse?free=true"
                  className="group inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-0.5 hover:bg-teal-700"
                >
                  Start Free Mock Test
                  <MdArrowForward
                    className="transition group-hover:translate-x-0.5"
                    size={18}
                  />
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Browse All Tests
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-slate-200/80 pt-8">
                {PLATFORM_STATS.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-extrabold leading-none text-teal-700 font-[family-name:var(--font-display)]">
                      {s.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — topper visual */}
            <div className="relative mx-auto hidden aspect-square w-full max-w-[520px] lg:block">
              <div className="absolute left-1/2 top-1/2 z-10 w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-extrabold text-white">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Mrinal K.
                    </p>
                    <p className="text-xs text-slate-500">NEET 2025</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
                  <span className="text-[13px] font-semibold text-teal-800">
                    All India Rank
                  </span>
                  <span className="text-2xl font-extrabold text-teal-600 font-[family-name:var(--font-display)]">
                    #4
                  </span>
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  <span className="font-bold text-slate-700">158,000</span> MCQs
                  practiced
                </p>
              </div>
              {[
                {
                  pos: "top-[4%] left-[2%]",
                  name: "Priya S.",
                  rank: "#35",
                  score: "715/720",
                  grad: "from-pink-500 to-rose-500",
                  delay: "0.2s",
                },
                {
                  pos: "top-[6%] right-[2%]",
                  name: "Rahul M.",
                  rank: "#8",
                  score: "340/360",
                  grad: "from-sky-400 to-cyan-500",
                  delay: "0.3s",
                },
                {
                  pos: "bottom-[6%] left-[6%]",
                  name: "Ananya K.",
                  rank: "#15",
                  score: "710/720",
                  grad: "from-emerald-400 to-teal-500",
                  delay: "0.4s",
                },
                {
                  pos: "bottom-[4%] right-[4%]",
                  name: "Vikram P.",
                  rank: "#22",
                  score: "333/360",
                  grad: "from-amber-400 to-orange-500",
                  delay: "0.5s",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className={`absolute ${t.pos} flex animate-[fadeUp_0.6s_ease-out_both] items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg shadow-slate-900/5`}
                  style={{ animationDelay: t.delay }}
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.grad} text-sm font-extrabold text-white`}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      AIR {t.rank} · {t.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SCHOLARSHIP SECTION — only if exists and not ended
      ══════════════════════════════════════════ */}
      {scholarship && scholarshipState !== "ended" && (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-rose-500/15 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
              {/* Left */}
              <div className="text-white">
                {/* State badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5">
                  {scholarshipState === "live" ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                    </span>
                  ) : (
                    <MdTimer size={12} className="text-amber-400" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-300">
                    {scholarshipState === "live"
                      ? "Live Now · Register Free"
                      : scholarshipState === "upcoming"
                        ? `Opens in ${getDaysUntil(scholarship.scheduledAt)} days`
                        : "Register Free · Limited Seats"}
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight font-[family-name:var(--font-display)] sm:text-4xl lg:text-5xl">
                  {scholarship.title}
                </h2>

                {scholarship.description && (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                    {scholarship.description}
                  </p>
                )}

                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    `Free test · ${scholarship.durationMins} mins`,
                    "Results within 24 hours",
                    "Win up to 100% fee waiver",
                    "Cash prizes for toppers",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-sm text-slate-200"
                    >
                      <MdCheckCircle
                        className="mt-0.5 flex-shrink-0 text-emerald-400"
                        size={18}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/test/${scholarship.id}`}
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-4 text-sm font-extrabold text-slate-900 shadow-[0_10px_30px_-8px_rgba(251,191,36,0.6)] transition hover:-translate-y-0.5"
                  >
                    {scholarshipState === "upcoming"
                      ? "Get Notified"
                      : "Attempt Free Now"}
                    <MdArrowForward
                      className="transition group-hover:translate-x-1"
                      size={18}
                    />
                  </Link>
                  {scholarshipState === "live" && scholarship.endedAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MdTimer size={16} className="text-amber-400" />
                      <span>
                        <strong className="text-white">
                          {getDaysLeft(scholarship.endedAt)} days
                        </strong>{" "}
                        left to register
                      </span>
                    </div>
                  )}
                  {scholarshipState === "upcoming" &&
                    scholarship.scheduledAt && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MdTimer size={16} className="text-amber-400" />
                        <span>
                          Opens on{" "}
                          <strong className="text-white">
                            {new Date(
                              scholarship.scheduledAt,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </strong>
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Right — stats card */}
              <div className="rotate-1 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 shadow-2xl backdrop-blur-xl transition hover:rotate-0 sm:p-10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                      Scholarship Test
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-white font-[family-name:var(--font-display)]">
                      {Number(scholarship.price) === 0
                        ? "FREE"
                        : `₹${Number(scholarship.price)}`}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg">
                    🏆
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Questions",
                      value:
                        scholarship.testQuestions?.length ||
                        scholarship._count?.testQuestions ||
                        scholarship.questionCount ||
                        "—",
                    },
                    {
                      label: "Duration",
                      value: `${scholarship.durationMins} minutes`,
                    },
                    { label: "Total Marks", value: scholarship.totalMarks },
                    {
                      label: "Negative Marking",
                      value: scholarship.negativeMarking
                        ? `${scholarship.negativeMarking} per wrong`
                        : "No",
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-slate-400">{r.label}</span>
                      <span className="text-sm font-bold text-white">
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
                {scholarshipState === "upcoming" && scholarship.scheduledAt && (
                  <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-amber-300 font-semibold">
                      Opens on{" "}
                      {new Date(scholarship.scheduledAt).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          ALL TESTS
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">
                Our Test Series
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-display)] sm:text-4xl">
                Practice for Your Exam
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {testsLoading
                  ? "Loading..."
                  : `${testsMeta.total} tests available`}
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800"
            >
              View All <MdArrowForward size={16} />
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <MdSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tests by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {/* Exam tabs */}
            <button
              onClick={() => setSelectedExam(null)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${!selectedExam ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
            >
              All Exams
            </button>
            {exams.map((exam) => {
              const c = EXAM_COLORS[exam.name] || DEFAULT_EXAM_COLOR;
              const active = selectedExam === exam.id;
              return (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExam(active ? null : exam.id)}
                  className="rounded-full border px-4 py-1.5 text-[13px] font-semibold transition"
                  style={{
                    borderColor: active ? c.text : c.border,
                    background: active ? c.text : c.bg,
                    color: active ? "white" : c.text,
                  }}
                >
                  {exam.name}
                </button>
              );
            })}

            <span className="mx-1 h-5 w-px bg-slate-200" />

            {/* Type tabs */}
            {TEST_TYPES.filter((t) => t.value !== "").map((t) => (
              <button
                key={t.value}
                onClick={() =>
                  setSelectedType(t.value === selectedType ? "" : t.value)
                }
                className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${selectedType === t.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
              >
                {t.label}
              </button>
            ))}

            {/* Free toggle */}
            <button
              onClick={() => setFreeOnly((v) => !v)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${freeOnly ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
            >
              🆓 Free Only
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-100"
              >
                <MdClose size={14} /> Clear
              </button>
            )}
          </div>

          {/* Grid */}
          {testsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <TestSkeleton key={i} />
              ))}
            </div>
          ) : tests.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>

              {testsMeta.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  {Array.from(
                    { length: Math.min(5, testsMeta.totalPages) },
                    (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${page === p ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                  {testsMeta.totalPages > 5 && (
                    <span className="text-sm text-slate-400">
                      ... {testsMeta.totalPages}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(testsMeta.totalPages, p + 1))
                    }
                    disabled={page === testsMeta.totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="mb-3 text-5xl">📝</p>
              <p className="text-lg font-semibold text-slate-700">
                No tests found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {hasActiveFilters
                  ? "Try clearing some filters"
                  : "Check back soon!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CRASH COURSES ── */}
      {featuredCourses.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">
                  Crash Courses
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-display)] sm:text-4xl">
                  Structured Day-by-Day Plans
                </h2>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800"
              >
                View All <MdArrowForward size={16} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HALL OF EXCELLENCE ── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5">
              <MdStar className="text-amber-400" size={14} />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                Hall of Excellence
              </p>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)] sm:text-4xl lg:text-5xl">
              Our Students Get{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Top Ranks
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400">
              Every year, thousands of IITNEET students crack NEET, JEE and
              other top exams. You could be next.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOPPERS.slice(0, 8).map((t, i) => {
              const isStar = i === 0;
              return (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 transition hover:-translate-y-1 hover:border-teal-400/50 ${isStar ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}`}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-teal-400/20 to-transparent blur-2xl" />
                  <div className="absolute right-4 top-4">
                    <div
                      className={`rounded-lg bg-gradient-to-br ${i < 3 ? "from-amber-400 to-orange-500" : "from-teal-500 to-emerald-500"} px-2.5 py-1 shadow-lg`}
                    >
                      <span className="text-sm font-extrabold text-slate-900 font-[family-name:var(--font-display)]">
                        AIR {t.air}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex ${isStar ? "h-24 w-24 text-4xl" : "h-16 w-16 text-2xl"} items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} font-extrabold text-white shadow-lg ring-4 ring-white/5`}
                  >
                    {t.name[0]}
                  </div>
                  <h3
                    className={`mt-5 font-bold text-white font-[family-name:var(--font-display)] ${isStar ? "text-2xl" : "text-lg"}`}
                  >
                    {t.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{t.exam}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className={`font-extrabold text-teal-300 font-[family-name:var(--font-display)] ${isStar ? "text-3xl" : "text-xl"}`}
                    >
                      {t.score}
                    </span>
                    <span className="text-[11px] text-slate-500">score</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <MdLocalFireDepartment
                      className="flex-shrink-0 text-orange-400"
                      size={16}
                    />
                    <span className="text-[12px] text-slate-300">
                      <strong className="text-white">
                        {(t.mcq / 1000).toFixed(0)}K+
                      </strong>{" "}
                      MCQs practiced
                    </span>
                  </div>
                  {isStar && (
                    <p className="mt-6 border-t border-white/10 pt-6 text-sm italic leading-relaxed text-slate-300">
                      "IITNEET's test series was exactly what I needed. The
                      analytics showed me where I was losing marks. That changed
                      everything."
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-10 border-t border-white/10 pt-10 sm:gap-16">
            {[
              { n: "7,000+", l: "Medical seats" },
              { n: "2,400+", l: "IIT seats" },
              { n: "#1", l: "Since 2016" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-3xl font-extrabold text-white font-[family-name:var(--font-display)]">
                  {s.n}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">
              Why Choose IITNEET
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-display)] sm:text-4xl lg:text-[40px]">
              Features that help you{" "}
              <span className="text-teal-700">crack NEET &amp; JEE</span>
            </h2>
          </div>
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 md:gap-y-12">
            {KEY_FEATURES.map((f, i) => (
              <div
                key={i}
                className="group flex gap-5 border-b border-slate-200 pb-10 last:border-b-0 md:pb-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <div className="flex-shrink-0">
                  <span className="text-5xl font-extrabold text-slate-200 transition group-hover:text-teal-200 font-[family-name:var(--font-display)]">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                </div>
                <div className="flex-1 pt-2">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                      style={{ background: f.iconBg }}
                    >
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
                      {f.title}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-600">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="mb-10 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
            Thousands trust IITNEET
          </p>
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0">
            {PLATFORM_STATS.map((s) => (
              <div key={s.label} className="text-center text-white">
                <p className="mb-3 text-3xl">{s.icon}</p>
                <p className="text-3xl font-extrabold leading-none font-[family-name:var(--font-display)] sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-3 text-xs text-white/75 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-5xl">🎯</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-display)] sm:text-4xl lg:text-[40px]">
              Start Practicing{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Right Now
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Attempt your first full mock test for{" "}
              <strong className="text-slate-900">free</strong> — no registration
              needed.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/browse?type=FULL_MOCK&free=true"
                className="group inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                🩺 Free NEET Mock
                <MdArrowForward
                  className="transition group-hover:translate-x-0.5"
                  size={16}
                />
              </Link>
              <Link
                href="/browse?type=FULL_MOCK&free=true&exam=jee"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              >
                ⚗️ Free JEE Mock <MdArrowForward size={16} />
              </Link>
            </div>
            {scholarship && scholarshipState !== "ended" && (
              <p className="mt-8 text-sm text-slate-500">
                Or{" "}
                <Link
                  href={`/test/${scholarship.id}`}
                  className="font-bold text-amber-600 underline underline-offset-2 hover:text-amber-700"
                >
                  attempt the scholarship test
                </Link>{" "}
                — win up to 100% fee waiver.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with IITNEET`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Support"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg shadow-green-500/40 transition hover:scale-110 hover:bg-green-600"
      >
        <MdWhatsapp />
      </a>

      <Footer exams={exams} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
