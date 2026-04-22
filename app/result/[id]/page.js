"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MdWhatsapp,
  MdArrowBack,
  MdEmojiEvents,
  MdCheckCircle,
  MdCancel,
  MdRadioButtonUnchecked,
  MdTimer,
  MdArrowForward,
  MdReplay,
  MdTrendingUp,
  MdPeople,
  MdStar,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ pct }) {
  const r = 52,
    c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = pct >= 70 ? "#16A34A" : pct >= 40 ? "#F97316" : "#DC2626";
  const bg = pct >= 70 ? "#F0FDF4" : pct >= 40 ? "#FFF7ED" : "#FEF2F2";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 140, height: 140 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: bg }}
      />
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
      </svg>
      <div className="relative text-center">
        <p className="text-3xl font-extrabold leading-none" style={{ color }}>
          {pct}%
        </p>
        <p className="mt-1 text-[11px] font-semibold text-slate-400">Score</p>
      </div>
    </div>
  );
}

// ── Grade label ───────────────────────────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 90)
    return {
      label: "Outstanding!",
      emoji: "🏆",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  if (pct >= 70)
    return {
      label: "Great Job!",
      emoji: "🎯",
      color: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-200",
    };
  if (pct >= 50)
    return {
      label: "Good Effort!",
      emoji: "💪",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    };
  return {
    label: "Keep Practicing!",
    emoji: "📚",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bg, textColor }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border py-5 px-3 text-center ${bg}`}
    >
      <div className="mb-2">{icon}</div>
      <p className={`text-2xl font-extrabold leading-none ${textColor}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

// ── Subject bar ───────────────────────────────────────────────────────────────
function SubjectBar({ subject, data }) {
  const acc =
    data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  const color =
    acc >= 70 ? "bg-emerald-500" : acc >= 40 ? "bg-orange-500" : "bg-red-500";
  const text =
    acc >= 70
      ? "text-emerald-700"
      : acc >= 40
        ? "text-orange-600"
        : "text-red-600";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{subject}</p>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400">
            {data.correct}/{data.total}
          </span>
          <span className={`min-w-[36px] text-right text-sm font-bold ${text}`}>
            {acc}%
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${acc}%` }}
        />
      </div>
      <div className="mt-1.5 flex gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {data.correct} correct
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
          {data.wrong} wrong
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
          {data.skipped || data.total - data.correct - data.wrong} skipped
        </span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
      </div>
    );

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-4xl">😕</p>
          <p className="mt-3 text-lg font-bold text-slate-700">
            Result not found
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-block text-sm font-semibold text-teal-600 underline"
          >
            Browse Tests
          </Link>
        </div>
      </div>
    );

  const { attempt, subjectBreakdown, leaderboard } = data;
  const score = Number(attempt.score);
  const total = attempt.totalMarks;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const timeSecs = attempt.timeTakenSecs || 0;
  const timeStr =
    timeSecs > 0 ? `${Math.floor(timeSecs / 60)}m ${timeSecs % 60}s` : null;
  const grade = getGrade(pct);

  // ── Deduplicate leaderboard by student ID ─────────────────────────────────
  const seen = new Set();
  const dedupedLeaderboard = (leaderboard || [])
    .filter((entry) => {
      const sid = entry.student?.id || entry.studentId;
      if (!sid || seen.has(sid)) return false;
      seen.add(sid);
      return true;
    })
    .sort((a, b) => Number(b.score) - Number(a.score));

  // Find current student's rank in deduped board
  const myRank =
    attempt.rank ||
    dedupedLeaderboard.findIndex((e) => e.student?.id === attempt.studentId) +
      1 ||
    null;

  function shareWhatsApp() {
    const msg = `I scored ${score}/${total} (${pct}%) in "${attempt.test?.title || "a test"}" on IITNEET!\nRank: #${myRank || "—"}\nPractice at iitneet.in 📚`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  }

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/browse"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Browse
          </Link>

          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            Test Result
          </p>
          <h1 className="text-xl font-extrabold leading-snug text-white sm:text-2xl lg:text-3xl">
            {attempt.test?.title || "Test Result"}
          </h1>
          {attempt.test?.exam?.name && (
            <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white/85">
              {attempt.test.exam.name}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* ── SCORE CARD ── */}
        <div className="-mt-6 mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Grade banner */}
          <div
            className={`flex items-center gap-3 border-b px-6 py-4 ${grade.bg} ${grade.border}`}
          >
            <span className="text-2xl">{grade.emoji}</span>
            <p className={`text-base font-extrabold ${grade.color}`}>
              {grade.label}
            </p>
            {timeStr && (
              <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[12px] font-semibold text-slate-600">
                <MdTimer size={14} /> {timeStr}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-8 p-6 sm:gap-12 sm:p-8">
            {/* Score ring */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <ScoreRing pct={pct} />
            </div>

            {/* Score + rank */}
            <div className="flex-1 min-w-[180px]">
              <p className="text-5xl font-extrabold leading-none text-slate-900 sm:text-6xl">
                {score}
                <span className="text-2xl font-normal text-slate-400 sm:text-3xl">
                  {" "}
                  / {total}
                </span>
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {myRank && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                    <MdEmojiEvents size={18} className="text-amber-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
                        Rank
                      </p>
                      <p className="text-lg font-extrabold leading-none text-amber-800">
                        #{myRank}
                      </p>
                    </div>
                  </div>
                )}
                {attempt.tabSwitchCount > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
                    <p className="text-[12px] font-semibold text-red-600">
                      ⚠️ {attempt.tabSwitchCount} tab switch
                      {attempt.tabSwitchCount > 1 ? "es" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-4">
            <StatCard
              icon={<MdCheckCircle size={22} className="text-emerald-500" />}
              label="Correct"
              value={attempt.correctCount ?? "—"}
              bg="bg-emerald-50 border-emerald-100"
              textColor="text-emerald-700"
            />
            <StatCard
              icon={<MdCancel size={22} className="text-red-500" />}
              label="Wrong"
              value={attempt.wrongCount ?? "—"}
              bg="bg-red-50 border-red-100"
              textColor="text-red-700"
            />
            <StatCard
              icon={
                <MdRadioButtonUnchecked size={22} className="text-slate-400" />
              }
              label="Skipped"
              value={attempt.skippedCount ?? "—"}
              bg="bg-slate-50 border-slate-200"
              textColor="text-slate-700"
            />
            <StatCard
              icon={<MdTrendingUp size={22} className="text-teal-600" />}
              label="Accuracy"
              value={
                attempt.correctCount &&
                attempt.correctCount + attempt.wrongCount > 0
                  ? `${Math.round((attempt.correctCount / (attempt.correctCount + attempt.wrongCount)) * 100)}%`
                  : "—"
              }
              bg="bg-teal-50 border-teal-100"
              textColor="text-teal-700"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-5">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-600"
            >
              <MdWhatsapp size={18} /> Share Result
            </button>
            <Link
              href={`/solutions/${id}`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 no-underline"
            >
              View Solutions <MdArrowForward size={16} />
            </Link>
            {attempt.test?.id && (
              <Link
                href={`/test/${attempt.test.id}`}
                className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 no-underline"
              >
                <MdReplay size={16} /> Reattempt
              </Link>
            )}
          </div>
        </div>

        {/* ── SUBJECT BREAKDOWN ── */}
        {Object.keys(subjectBreakdown || {}).length > 0 && (
          <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <MdTrendingUp size={18} className="text-teal-600" />
              <h2 className="text-base font-bold text-slate-800">
                Subject-wise Analysis
              </h2>
            </div>
            <div className="space-y-6">
              {Object.entries(subjectBreakdown).map(([subject, s]) => (
                <SubjectBar key={subject} subject={subject} data={s} />
              ))}
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {dedupedLeaderboard.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <MdEmojiEvents size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-slate-800">
                Leaderboard
              </h2>
              <span className="ml-auto flex items-center gap-1 text-[12px] text-slate-400">
                <MdPeople size={14} /> {dedupedLeaderboard.length} students
              </span>
            </div>

            <div className="divide-y divide-slate-50">
              {dedupedLeaderboard.slice(0, 10).map((entry, i) => {
                const entryPct =
                  entry.totalMarks > 0
                    ? Math.round((Number(entry.score) / entry.totalMarks) * 100)
                    : 0;
                const isMe = myRank && i + 1 === myRank;
                const isTop3 = i < 3;

                return (
                  <div
                    key={entry.id || i}
                    className={`flex items-center gap-3 px-5 py-3.5 transition ${
                      isMe
                        ? "bg-teal-50"
                        : isTop3
                          ? "bg-amber-50/40"
                          : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex w-8 flex-shrink-0 items-center justify-center">
                      {isTop3 ? (
                        <span className="text-xl">{MEDALS[i]}</span>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">
                          {i + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                        isMe
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {(entry.student?.name || "S")[0].toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`truncate text-sm font-semibold ${isMe ? "text-teal-800" : "text-slate-800"}`}
                      >
                        {entry.student?.name || `Student ${i + 1}`}
                        {isMe && (
                          <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            You
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Score + bar */}
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="hidden w-20 sm:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${entryPct >= 70 ? "bg-emerald-500" : entryPct >= 40 ? "bg-orange-500" : "bg-red-400"}`}
                            style={{ width: `${entryPct}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-[10px] text-slate-400">
                          {entryPct}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-extrabold ${i === 0 ? "text-amber-600" : isMe ? "text-teal-700" : "text-slate-800"}`}
                        >
                          {Number(entry.score)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          /{entry.totalMarks}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* My rank if not in top 10 */}
            {myRank && myRank > 10 && (
              <div className="border-t border-dashed border-teal-200 bg-teal-50 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-sm font-bold text-teal-600">
                    #{myRank}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-extrabold text-white">
                    {(attempt.student?.name || "Y")[0]}
                  </div>
                  <p className="flex-1 text-sm font-semibold text-teal-800">
                    {attempt.student?.name || "You"}
                    <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      You
                    </span>
                  </p>
                  <p className="text-sm font-extrabold text-teal-700">
                    {score}
                    <span className="text-[11px] font-normal text-teal-500">
                      /{total}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4 text-center">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, need help with test: ${attempt.test?.title || id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-green-600 no-underline"
              >
                <MdWhatsapp size={15} /> Need help? Chat with us
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
