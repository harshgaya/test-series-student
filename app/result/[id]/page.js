"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  MdShare,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

function ScoreRing({ pct }) {
  const r = 54,
    c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = pct >= 70 ? "#16A34A" : pct >= 40 ? "#F97316" : "#DC2626";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#F3F4F6"
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
        strokeDashoffset={c * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x="70"
        y="66"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill={color}
        fontFamily="Sora, Poppins, sans-serif"
      >
        {pct}%
      </text>
      <text
        x="70"
        y="84"
        textAnchor="middle"
        fontSize="12"
        fill="#9CA3AF"
        fontFamily="Poppins, sans-serif"
      >
        Score
      </text>
    </svg>
  );
}

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gray-50)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--teal-100)",
            borderTop: "3px solid var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (!data)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Result not found</p>
      </div>
    );

  const { attempt, subjectBreakdown, leaderboard } = data;
  const score = Number(attempt.score);
  const total = attempt.totalMarks;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const timeSecs = attempt.timeTakenSecs || 0;
  const timeStr =
    timeSecs > 0 ? `${Math.floor(timeSecs / 60)}m ${timeSecs % 60}s` : "—";

  const grade =
    pct >= 90
      ? { label: "Outstanding! 🏆", color: "#16A34A" }
      : pct >= 70
        ? { label: "Great Job! 🎯", color: "#0D9488" }
        : pct >= 50
          ? { label: "Good Effort! 💪", color: "#F97316" }
          : { label: "Keep Practicing! 📚", color: "#DC2626" };

  function shareWhatsApp() {
    const msg = `I scored ${score}/${total} (${pct}%) in ${attempt.test?.title || "a test"} on IIT NEET!\nRank: #${attempt.rank || "—"}\nPractice at iitneet.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gray-50)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--teal-700) 0%, #0891B2 100%)",
          padding: "28px 20px 80px",
        }}
      >
        <div className="container">
          <Link
            href="/browse"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <MdArrowBack /> Back
          </Link>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 4,
            }}
          >
            Test Result
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px,3vw,26px)",
              fontWeight: 700,
              color: "white",
            }}
          >
            {attempt.test?.title}
          </h1>
        </div>
      </div>

      <div
        className="container"
        style={{ padding: "0 20px", marginTop: -56, paddingBottom: 60 }}
      >
        {/* Score card */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--r-2xl)",
            border: "1px solid var(--border)",
            padding: "clamp(24px,4vw,40px)",
            marginBottom: 20,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(20px,4vw,48px)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Ring */}
            <div style={{ flexShrink: 0 }}>
              <ScoreRing pct={pct} />
            </div>

            {/* Score details */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p
                style={{
                  fontSize: "clamp(13px,2vw,15px)",
                  fontWeight: 600,
                  color: grade.color,
                  marginBottom: 4,
                }}
              >
                {grade.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(36px,6vw,56px)",
                  fontWeight: 800,
                  color: "var(--gray-900)",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {score}
                <span
                  style={{
                    fontSize: "clamp(18px,3vw,28px)",
                    color: "var(--text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  / {total}
                </span>
              </p>
              {timeSecs > 0 && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    background: "var(--gray-100)",
                    borderRadius: "var(--r-full)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  <MdTimer style={{ fontSize: 16 }} /> Time taken: {timeStr}
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginTop: 28,
            }}
          >
            {[
              {
                icon: (
                  <MdCheckCircle style={{ color: "#16A34A", fontSize: 22 }} />
                ),
                label: "Correct",
                value: attempt.correctCount,
                bg: "#F0FDF4",
                border: "#BBF7D0",
              },
              {
                icon: <MdCancel style={{ color: "#DC2626", fontSize: 22 }} />,
                label: "Wrong",
                value: attempt.wrongCount,
                bg: "#FEF2F2",
                border: "#FECACA",
              },
              {
                icon: (
                  <MdRadioButtonUnchecked
                    style={{ color: "#9CA3AF", fontSize: 22 }}
                  />
                ),
                label: "Skipped",
                value: attempt.skippedCount,
                bg: "var(--gray-50)",
                border: "var(--border)",
              },
              {
                icon: (
                  <MdEmojiEvents style={{ color: "#F97316", fontSize: 22 }} />
                ),
                label: "Rank",
                value: attempt.rank ? `#${attempt.rank}` : "—",
                bg: "#FFF7ED",
                border: "#FED7AA",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  padding: "clamp(12px,2vw,20px) 8px",
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  borderRadius: "var(--r-xl)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {s.icon}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(20px,3vw,28px)",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "var(--gray-900)",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={shareWhatsApp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                background: "#22C55E",
                color: "white",
                border: "none",
                borderRadius: "var(--r-full)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              <MdWhatsapp style={{ fontSize: 18 }} /> Share Result
            </button>
            <Link
              href={`/solutions/${id}`}
              className="btn-outline"
              style={{ padding: "11px 22px", fontSize: 14 }}
            >
              View Solutions <MdArrowForward />
            </Link>
          </div>
        </div>

        {/* Subject breakdown */}
        {Object.keys(subjectBreakdown).length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--border)",
              padding: "clamp(20px,4vw,32px)",
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              Subject-wise Analysis
            </h3>
            {Object.entries(subjectBreakdown).map(([subject, s]) => {
              const acc =
                s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              const barColor =
                acc >= 70 ? "#16A34A" : acc >= 40 ? "#F97316" : "#DC2626";
              return (
                <div key={subject} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--gray-800)",
                      }}
                    >
                      {subject}
                    </p>
                    <div
                      style={{ display: "flex", gap: 16, alignItems: "center" }}
                    >
                      <span
                        style={{ fontSize: 12, color: "var(--text-muted)" }}
                      >
                        {s.correct}/{s.total} correct
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: barColor,
                        }}
                      >
                        {acc}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "var(--gray-100)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${acc}%`,
                        background: barColor,
                        borderRadius: 99,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--border)",
              padding: "clamp(20px,4vw,32px)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              🏆 Leaderboard
            </h3>
            {leaderboard.slice(0, 10).map((entry, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const isMe = attempt.rank && i + 1 === attempt.rank;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: "var(--r-lg)",
                    marginBottom: 6,
                    background: isMe
                      ? "var(--teal-50)"
                      : i % 2 === 0
                        ? "var(--gray-50)"
                        : "white",
                    border: isMe
                      ? "1.5px solid var(--teal-200)"
                      : "1.5px solid transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: i < 3 ? 22 : 14,
                      fontWeight: 700,
                      width: 32,
                      textAlign: "center",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {i < 3 ? medals[i] : i + 1}
                  </span>
                  <p
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: isMe ? 700 : 500,
                      color: isMe ? "var(--teal-700)" : "var(--text-primary)",
                    }}
                  >
                    {entry.student?.name || `Student ${i + 1}`}
                    {isMe ? " (You)" : ""}
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: i === 0 ? "#F97316" : "var(--text-primary)",
                    }}
                  >
                    {Number(entry.score)}
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      /{entry.totalMarks}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
