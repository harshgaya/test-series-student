"use client";
import Link from "next/link";
import {
  MdPeople,
  MdTimer,
  MdArrowForward,
  MdStar,
  MdLock,
} from "react-icons/md";
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from "@/lib/constants";

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
  MICRO: "Micro Test",
  CONCEPT: "Concept Test",
  DIFFICULTY_LADDER: "Difficulty Ladder",
  SUBJECT: "Subject Test",
  FREE: "Free Test",
  SCHOLARSHIP: "Scholarship",
};

const TYPE_COLORS = {
  FULL_MOCK: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  CHAPTER: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  SCHOLARSHIP: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  PYP: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  LIVE: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  SPEED: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  DEFAULT: { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
};

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

function getDaysLeft(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function TestCard({ test }) {
  const isFree = Number(test.price) === 0;
  const isScholarship = test.testType === "SCHOLARSHIP";
  const examColor = EXAM_COLORS[test.exam?.name] || DEFAULT_EXAM_COLOR;
  const typeLabel =
    TYPE_LABELS[test.testType] || test.testType?.replace(/_/g, " ");
  const typeColor = TYPE_COLORS[test.testType] || TYPE_COLORS.DEFAULT;
  const qCount = test.testQuestions?.length || test._count?.testQuestions || 0;
  const attempts = test.attemptCount || test._count?.attempts || 0;
  const schedState = getScheduleState(test);

  // Scholarship gradient accent
  const accentGrad = isScholarship
    ? "linear-gradient(90deg, #F59E0B, #EF4444)"
    : isFree
      ? "linear-gradient(90deg, #0D9488, #059669)"
      : "linear-gradient(90deg, #F97316, #EF4444)";

  return (
    <Link
      href={`/test/${test.id}`}
      className="block"
      style={{ textDecoration: "none" }}
    >
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:-translate-y-1"
        style={{
          border: isScholarship ? "1.5px solid #FDE68A" : "1px solid #E2E8F0",
          boxShadow: isScholarship
            ? "0 4px 20px -4px rgba(245,158,11,0.2)"
            : "0 1px 4px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = isScholarship
            ? "0 12px 32px -8px rgba(245,158,11,0.3)"
            : "0 12px 32px -8px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isScholarship
            ? "0 4px 20px -4px rgba(245,158,11,0.2)"
            : "0 1px 4px rgba(0,0,0,0.06)";
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: accentGrad, flexShrink: 0 }} />

        {/* Scholarship shimmer bg */}
        {isScholarship && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at top right, #FEF3C7, transparent 60%)",
            }}
          />
        )}

        <div className="relative flex flex-col flex-1 p-4">
          {/* ── Badge row ── */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {/* Exam badge */}
            {test.exam?.name && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: examColor.bg, color: examColor.text }}
              >
                {test.exam.name}
              </span>
            )}

            {/* Type badge */}
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: typeColor.bg,
                color: typeColor.text,
                border: `1px solid ${typeColor.border}`,
              }}
            >
              {isScholarship && <MdStar size={10} className="mr-0.5" />}
              {typeLabel}
            </span>

            {/* Free / Price badge */}
            {isFree ? (
              <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                FREE
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600 ring-1 ring-orange-200">
                ₹{Number(test.price)}
              </span>
            )}
          </div>

          {/* ── Subject / Chapter breadcrumb ── */}
          {(test.subject || test.chapter) && (
            <p className="mb-1.5 text-[11px] text-slate-400 font-medium">
              {[test.subject?.name, test.chapter?.name]
                .filter(Boolean)
                .join(" › ")}
            </p>
          )}

          {/* ── Title ── */}
          <h3 className="mb-3 text-sm font-semibold leading-snug text-slate-800 line-clamp-2 flex-1">
            {test.title}
          </h3>

          {/* ── Schedule badge for upcoming/live ── */}
          {schedState === "live" && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                Live Now
                {test.endedAt && ` · ${getDaysLeft(test.endedAt)}d left`}
              </span>
            </div>
          )}
          {schedState === "upcoming" && test.scheduledAt && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5">
              <MdTimer size={12} className="text-amber-600" />
              <span className="text-[11px] font-bold text-amber-700">
                Opens in {getDaysLeft(test.scheduledAt)} day
                {getDaysLeft(test.scheduledAt) !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="mb-3 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 overflow-hidden">
            {[
              { label: "Questions", value: qCount },
              { label: "Duration", value: `${test.durationMins}m` },
              { label: "Marks", value: test.totalMarks },
            ].map((s) => (
              <div key={s.label} className="py-2.5 text-center">
                <p className="text-sm font-bold leading-none text-slate-800">
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Attempt count ── */}
          {attempts > 0 && (
            <p className="mb-3 flex items-center gap-1 text-[11px] text-slate-400">
              <MdPeople size={13} />
              {attempts.toLocaleString("en-IN")} students attempted
            </p>
          )}

          {/* ── CTA ── */}
          <div
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
            style={
              isScholarship
                ? { background: "#FFFBEB", border: "1px solid #FDE68A" }
                : isFree
                  ? { background: "#F0FDFA", border: "1px solid #99F6E4" }
                  : { background: "#FFF7ED", border: "1px solid #FED7AA" }
            }
          >
            <span
              className="text-sm font-semibold"
              style={{
                color: isScholarship
                  ? "#B45309"
                  : isFree
                    ? "#0F766E"
                    : "#C2410C",
              }}
            >
              {schedState === "upcoming"
                ? "Notify Me"
                : schedState === "ended"
                  ? "View Results"
                  : isFree
                    ? "Attempt Free"
                    : `Buy ₹${Number(test.price)}`}
            </span>
            {!isFree && schedState === "open" ? (
              <MdLock size={16} style={{ color: "#F97316" }} />
            ) : (
              <MdArrowForward
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                style={{
                  color: isScholarship
                    ? "#D97706"
                    : isFree
                      ? "#0D9488"
                      : "#EA580C",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
