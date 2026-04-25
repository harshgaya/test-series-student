"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCheckCircle,
  MdTimer,
  MdWarning,
  MdLock,
  MdPlayArrow,
  MdReplay,
  MdLeaderboard,
  MdHistory,
  MdTrendingUp,
  MdWhatsapp,
  MdPeople,
  MdCalendarToday,
  MdInfo,
  MdStar,
  MdEmojiEvents,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getScheduleState(test) {
  const now = new Date();
  const scheduled = test.scheduledAt ? new Date(test.scheduledAt) : null;
  const started = test.startedAt ? new Date(test.startedAt) : null;
  const ended = test.endedAt ? new Date(test.endedAt) : null;
  if (ended && now > ended) return "ended";
  if (started && now >= started) return "live";
  if (scheduled && now < scheduled) return "upcoming";
  return "open";
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDaysUntil(d) {
  const diff = new Date(d) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getBestScore(attempts) {
  if (!attempts.length) return null;
  return attempts.reduce(
    (best, a) => (Number(a.score) > Number(best.score) ? a : best),
    attempts[0],
  );
}

const TYPE_LABELS = {
  FULL_MOCK: "Full Mock",
  CHAPTER: "Chapter Test",
  TOPIC: "Topic Test",
  PYP: "Previous Year",
  SPEED: "Speed Test",
  DPT: "Daily Practice",
  LIVE: "Live Exam",
  SECTIONAL: "Sectional",
  NTA_SIMULATOR: "NTA Simulator",
  SCHOLARSHIP: "Scholarship",
};

const MEDAL = ["🥇", "🥈", "🥉"];

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({ targetDate }) {
  const [time, setTime] = useState(getDaysUntil(targetDate));
  useEffect(() => {
    const t = setInterval(() => setTime(getDaysUntil(targetDate)), 60000);
    return () => clearInterval(t);
  }, [targetDate]);
  if (!time) return null;
  return <span className="font-bold text-amber-200">{time}</span>;
}

// ── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur-sm ring-1 ring-white/10">
      <p className="text-xl font-extrabold leading-none text-white sm:text-2xl">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] font-semibold text-white/60">{sub}</p>
      )}
      <p className="mt-1 text-[11px] font-medium text-white/70">{label}</p>
    </div>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────
function CtaButton({
  scheduleState,
  isFree,
  purchased,
  attempts,
  onAttempt,
  onBuy,
  paying,
  isLoggedIn,
}) {
  const attemptCount = attempts.length;
  const hasAttempted = attemptCount > 0;

  // Not logged in
  if (!isLoggedIn)
    return (
      <button
        onClick={onAttempt}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-teal-700"
      >
        <MdLock size={18} /> Login to {isFree ? "Attempt Free" : "Purchase"}
      </button>
    );

  // Ended
  if (scheduleState === "ended")
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 py-4 text-center">
        <p className="text-sm font-semibold text-slate-500">
          This test has ended
        </p>
        {hasAttempted && (
          <Link
            href={`/result/${attempts[0].id}`}
            className="mt-2 inline-block text-sm font-bold text-teal-600 no-underline hover:underline"
          >
            View Your Results →
          </Link>
        )}
      </div>
    );

  // Upcoming (scheduled but not started)
  if (scheduleState === "upcoming")
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MdCalendarToday size={16} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-800">
            Test not started yet
          </p>
        </div>
        <p className="text-xs text-amber-600">
          Come back when the test is live
        </p>
      </div>
    );

  // Need to purchase
  if (!isFree && !purchased)
    return (
      <button
        onClick={onBuy}
        disabled={paying}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:opacity-60"
      >
        <MdLock size={18} />
        {paying ? "Processing..." : "Buy to Unlock"}
      </button>
    );

  // Free or purchased — can attempt
  return (
    <button
      onClick={onAttempt}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700"
    >
      {hasAttempted ? <MdReplay size={18} /> : <MdPlayArrow size={18} />}
      {hasAttempted ? `Reattempt (${attemptCount} done)` : "Attempt Now"}
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton({ exams }) {
  return (
    <>
      <Navbar exams={exams} />
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="h-64 animate-pulse bg-slate-200" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login via cookie (server-side)
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(d.success))
      .catch(() => setIsLoggedIn(false));

    fetch(`/api/tests/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error || "Test not found");
      })
      .catch(() => setError("Could not load test. Check your connection."))
      .finally(() => setLoading(false));

    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, [id]);

  function requireLogin(action) {
    if (!isLoggedIn) {
      setPendingAction(action);
      setShowLogin(true);
      return false;
    }
    return true;
  }

  function handleLoginSuccess() {
    setIsLoggedIn(true);
    setShowLogin(false);
    if (pendingAction === "attempt") {
      window.location.href = `/attempt/${id}`;
      return;
    }
    if (pendingAction === "buy") startPayment();
    setPendingAction(null);
  }

  function handleAttempt() {
    if (!requireLogin("attempt")) return;
    const state = getScheduleState(data.test);
    if (state === "upcoming") {
      toast.error("Test has not started yet");
      return;
    }
    if (state === "ended") {
      toast.error("This test has ended");
      return;
    }
    if (!data.purchased && Number(data.test.price) !== 0) {
      toast.error("Please purchase this test first");
      return;
    }
    router.push(`/attempt/${id}`);
  }

  async function startPayment() {
    setPaying(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: id }),
      });
      const d = await res.json();
      if (!d.success) {
        toast.error(d.error);
        return;
      }
      const opts = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: d.data.amount,
        currency: "INR",
        name: "IITNEET",
        description: d.data.description,
        order_id: d.data.orderId,
        handler: async (response) => {
          const vres = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vd = await vres.json();
          if (vd.success) {
            toast.success("Payment successful! 🎉");
            router.push(`/payment/status?orderId=${d.data.orderId}`);
          } else toast.error("Payment verification failed");
        },
        theme: { color: "#0D9488" },
      };
      new window.Razorpay(opts).open();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPaying(false);
    }
  }

  function handleBuy() {
    if (!requireLogin("buy")) return;
    startPayment();
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton exams={exams} />;

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error)
    return (
      <>
        <Navbar exams={exams} />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <MdWarning size={32} className="text-red-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800">
              Could Not Load Test
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              {error}
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/browse"
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 no-underline"
              >
                Browse Tests
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );

  const { test, purchased, attempts, leaderboard, stats } = data;
  const isFree = Number(test.price) === 0;
  const scheduleState = getScheduleState(test);
  const isScholarship = test.testType === "SCHOLARSHIP";
  const bestAttempt = getBestScore(attempts);
  const qCount = test._count?.testQuestions || test.testQuestions?.length || 0;
  const attemptCount = stats._count?.id || 0;

  // Hero gradient
  const heroGrad = isScholarship
    ? "from-amber-700 via-orange-700 to-rose-700"
    : scheduleState === "ended"
      ? "from-slate-700 via-slate-600 to-slate-700"
      : "from-teal-700 via-teal-600 to-cyan-700";

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
      <Navbar exams={exams} />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${heroGrad}`}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/8 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            {/* Back */}
            <Link
              href="/browse"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition hover:text-white/90 no-underline"
            >
              <MdArrowBack size={16} /> Back to Browse
            </Link>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {test.exam?.name && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                  {test.exam.name}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                {TYPE_LABELS[test.testType] ||
                  test.testType?.replace(/_/g, " ")}
              </span>
              {isFree && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[12px] font-bold text-white">
                  FREE
                </span>
              )}
              {isScholarship && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[12px] font-bold text-slate-900">
                  🏆 Scholarship
                </span>
              )}
              {/* Schedule state badge */}
              {scheduleState === "upcoming" && (
                <span className="rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-[12px] font-bold text-amber-200">
                  ⏳ Starts in <Countdown targetDate={test.scheduledAt} />
                </span>
              )}
              {scheduleState === "live" && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-[12px] font-bold text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Live Now
                </span>
              )}
              {scheduleState === "ended" && (
                <span className="rounded-full bg-slate-500/50 px-3 py-1 text-[12px] font-bold text-white/70">
                  Test Ended
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-3 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              {test.title}
            </h1>

            {test.description && (
              <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/70">
                {test.description}
              </p>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 mt-6 max-w-2xl">
              <StatBox label="Questions" value={qCount} />
              <StatBox label="Duration" value={`${test.durationMins}m`} />
              <StatBox label="Marks" value={test.totalMarks} />
              <StatBox
                label="Attempted"
                value={attemptCount > 0 ? `${attemptCount}` : "—"}
                sub={attemptCount > 0 ? "students" : ""}
              />
            </div>

            {/* Schedule info bar */}
            {scheduleState === "upcoming" && test.scheduledAt && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 max-w-lg">
                <MdCalendarToday
                  size={16}
                  className="flex-shrink-0 text-amber-300"
                />
                <p className="text-sm text-amber-200">
                  Opens on{" "}
                  <strong className="text-white">
                    {formatDate(test.scheduledAt)}
                  </strong>
                </p>
              </div>
            )}
            {scheduleState === "live" && test.endedAt && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-400/15 px-4 py-3 max-w-lg">
                <MdTimer size={16} className="flex-shrink-0 text-red-300" />
                <p className="text-sm text-red-200">
                  Closes on{" "}
                  <strong className="text-white">
                    {formatDate(test.endedAt)}
                  </strong>{" "}
                  · <Countdown targetDate={test.endedAt} /> remaining
                </p>
              </div>
            )}
            {scheduleState === "ended" && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-400/30 bg-slate-500/20 px-4 py-3 max-w-lg">
                <MdInfo size={16} className="flex-shrink-0 text-slate-300" />
                <p className="text-sm text-slate-300">
                  This test ended on{" "}
                  <strong className="text-white">
                    {formatDate(test.endedAt)}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CONTENT
        ══════════════════════════════════════════ */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
            {/* ── LEFT ── */}
            <div className="space-y-5 min-w-0">
              {/* Best attempt highlight */}
              {bestAttempt && (
                <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-600 to-cyan-600 p-5 text-white">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">
                        🏆
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                          Your Best Score
                        </p>
                        <p className="text-2xl font-extrabold">
                          {Number(bestAttempt.score)}/{bestAttempt.totalMarks}
                        </p>
                        {bestAttempt.rank && (
                          <p className="text-xs text-white/75">
                            All India Rank #{bestAttempt.rank}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-white/70">
                        {attempts.length} attempt
                        {attempts.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-lg font-bold">
                        {Math.round(
                          (Number(bestAttempt.score) / bestAttempt.totalMarks) *
                            100,
                        )}
                        %
                      </p>
                      <Link
                        href={`/result/${bestAttempt.id}`}
                        className="text-[12px] font-bold text-white/90 underline no-underline hover:text-white"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats detail grid */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-slate-800">
                  Test Details
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Questions",
                      value: qCount,
                      color: "text-teal-700",
                      bg: "bg-teal-50",
                    },
                    {
                      label: "Duration",
                      value: `${test.durationMins} mins`,
                      color: "text-blue-700",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Total Marks",
                      value: test.totalMarks,
                      color: "text-violet-700",
                      bg: "bg-violet-50",
                    },
                    {
                      label: "Negative",
                      value: `${test.negativeMarking}/wrong`,
                      color: "text-rose-700",
                      bg: "bg-rose-50",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`flex flex-col items-center rounded-xl ${s.bg} px-3 py-4 text-center`}
                    >
                      <p
                        className={`text-xl font-extrabold leading-none ${s.color}`}
                      >
                        {s.value}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Marks breakdown */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-semibold text-emerald-700">
                      +{test.marksCorrect} correct
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-[12px] font-semibold text-red-700">
                      {test.negativeMarking} wrong
                    </span>
                  </div>
                  {test.subject?.name && (
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <span className="text-[12px] font-semibold text-slate-600">
                        {test.subject.name}{" "}
                        {test.chapter?.name ? `› ${test.chapter.name}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <MdInfo size={16} className="text-teal-600" />
                  Instructions
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      text: `Each correct answer earns +${test.marksCorrect} marks`,
                      type: "good",
                    },
                    {
                      text: `Each wrong answer deducts ${test.negativeMarking} marks`,
                      type: "bad",
                    },
                    {
                      text: "Timer starts immediately and cannot be paused",
                      type: "warn",
                    },
                    {
                      text: "3 tab-switch warnings will auto-submit your test",
                      type: "warn",
                    },
                    {
                      text: "Your progress is auto-saved every 30 seconds",
                      type: "good",
                    },
                    { text: "Unlimited reattempts allowed", type: "good" },
                    {
                      text: "Right-click and copy-paste are disabled during the test",
                      type: "warn",
                    },
                    test.showSolutions
                      ? {
                          text: "Solutions will be shown after submission",
                          type: "good",
                        }
                      : null,
                    test.showRank
                      ? {
                          text: "Your All India Rank will be calculated after submission",
                          type: "good",
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((inst, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            inst.type === "good"
                              ? "bg-emerald-100 text-emerald-700"
                              : inst.type === "bad"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {inst.text}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Past attempts history */}
              {attempts.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <MdHistory size={16} className="text-teal-600" />
                      Your Attempts ({attempts.length})
                    </h2>
                    {attempts.length >= 3 && (
                      <div className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1">
                        <MdTrendingUp size={12} className="text-teal-600" />
                        <span className="text-[11px] font-bold text-teal-700">
                          Keep going!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {attempts.map((a, i) => {
                      const pct = Math.round(
                        (Number(a.score) / a.totalMarks) * 100,
                      );
                      const isBest = a.id === bestAttempt?.id;
                      return (
                        <div
                          key={a.id}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                            isBest
                              ? "border-teal-200 bg-teal-50"
                              : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          {/* Attempt number */}
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              isBest
                                ? "bg-teal-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {attempts.length - i}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                {Number(a.score)}/{a.totalMarks}
                              </p>
                              {isBest && (
                                <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Best
                                </span>
                              )}
                              {a.rank && (
                                <span className="text-[11px] font-semibold text-slate-400">
                                  Rank #{a.rank}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {new Date(a.submittedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          {/* Percentage bar */}
                          <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                            <span
                              className={`text-xs font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-500"}`}
                            >
                              {pct}%
                            </span>
                            <div className="h-1.5 w-full rounded-full bg-slate-200">
                              <div
                                className={`h-1.5 rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <Link
                            href={`/result/${a.id}`}
                            className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-teal-600 transition hover:bg-teal-50 no-underline"
                          >
                            View
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reattempt nudge */}
                  {attempts.length > 0 && (
                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-[12px] leading-relaxed text-indigo-700">
                        <strong>💡 Pro tip:</strong>{" "}
                        {attempts.length === 1
                          ? "Reattempting helps you identify weak areas. Try again to improve your score!"
                          : attempts.length < 5
                            ? "You're building consistency! Each attempt sharpens your speed and accuracy."
                            : "You're a consistent practitioner! Focus on your weakest topics from the analysis."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <MdEmojiEvents size={16} className="text-amber-500" />
                    Top Performers
                  </h2>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((e, i) => {
                      const pct = Math.round(
                        (Number(e.score) / e.totalMarks) * 100,
                      );
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                            i === 0
                              ? "bg-amber-50 border border-amber-100"
                              : "bg-slate-50"
                          }`}
                        >
                          <span className="text-lg w-7 text-center flex-shrink-0">
                            {MEDAL[i] || (
                              <span className="text-sm font-bold text-slate-400">
                                {i + 1}
                              </span>
                            )}
                          </span>
                          <p className="flex-1 text-sm font-semibold text-slate-800 truncate">
                            {e.student?.name || "Student"}
                          </p>
                          <div className="text-right">
                            <p className="text-sm font-bold text-teal-700">
                              {Number(e.score)}/{e.totalMarks}
                            </p>
                            <p className="text-[11px] text-slate-400">{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {stats._avg?.score && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <span className="text-[12px] text-slate-500">
                        Class average
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {Number(stats._avg.score).toFixed(1)}/{test.totalMarks}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              {/* Purchase / CTA card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Price header */}
                <div
                  className={`px-5 py-4 ${isFree ? "bg-emerald-50 border-b border-emerald-100" : "bg-slate-50 border-b border-slate-100"}`}
                >
                  {isFree ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-emerald-600">
                        FREE
                      </span>
                      <span className="text-sm text-emerald-600">
                        — No payment needed
                      </span>
                    </div>
                  ) : purchased ? (
                    <div className="flex items-center gap-2">
                      <MdCheckCircle size={18} className="text-teal-600" />
                      <span className="text-sm font-bold text-teal-700">
                        Purchased
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        ₹{Number(test.price)}
                      </span>
                      <span className="text-sm text-slate-400">one-time</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* Main CTA */}
                  <CtaButton
                    scheduleState={scheduleState}
                    isFree={isFree}
                    purchased={purchased}
                    attempts={attempts}
                    onAttempt={handleAttempt}
                    onBuy={handleBuy}
                    paying={paying}
                    isLoggedIn={isLoggedIn}
                  />

                  {/* What's included */}
                  <div className="mt-4 space-y-2.5">
                    {[
                      `${qCount} questions`,
                      `${test.durationMins} minutes`,
                      `+${test.marksCorrect} correct / ${test.negativeMarking} wrong`,
                      "Unlimited reattempts",
                      test.showSolutions ? "Detailed solutions" : null,
                      test.showRank ? "All India Rank" : null,
                      test.showLeaderboard ? "Leaderboard access" : null,
                    ]
                      .filter(Boolean)
                      .map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <MdCheckCircle
                            size={14}
                            className="flex-shrink-0 text-teal-500"
                          />
                          <span className="text-[13px] text-slate-600">
                            {f}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Upcoming schedule notice */}
                  {scheduleState === "upcoming" && test.scheduledAt && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 mb-1">
                        Starts in
                      </p>
                      <p className="text-base font-extrabold text-amber-800">
                        <Countdown targetDate={test.scheduledAt} />
                      </p>
                      <p className="mt-0.5 text-[11px] text-amber-600">
                        {formatDate(test.scheduledAt)}
                      </p>
                    </div>
                  )}

                  {/* WhatsApp help */}
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with test: ${test.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-400 transition hover:text-green-600 no-underline"
                  >
                    <MdWhatsapp size={14} />
                    Need help? WhatsApp us
                  </a>
                </div>
              </div>

              {/* Stats summary card */}
              {attemptCount > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MdPeople size={15} className="text-slate-400" />
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                      Class Statistics
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Attempted",
                        value: attemptCount.toLocaleString("en-IN"),
                      },
                      stats._avg?.score
                        ? {
                            label: "Avg Score",
                            value: `${Number(stats._avg.score).toFixed(1)}/${test.totalMarks}`,
                          }
                        : null,
                      stats._max?.score
                        ? {
                            label: "Top Score",
                            value: `${Number(stats._max.score)}/${test.totalMarks}`,
                          }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((s) => (
                        <div key={s.label} className="flex justify-between">
                          <span className="text-[12px] text-slate-500">
                            {s.label}
                          </span>
                          <span className="text-[12px] font-bold text-slate-700">
                            {s.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer exams={exams} />
    </>
  );
}
