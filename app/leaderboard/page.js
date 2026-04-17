"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MdEmojiEvents } from "react-icons/md";

const DUMMY_NAMES = [
  "Priya S.",
  "Rahul M.",
  "Ananya K.",
  "Vikram P.",
  "Sneha R.",
  "Arjun T.",
  "Divya N.",
  "Karan B.",
  "Meera J.",
  "Rohan D.",
  "Pooja V.",
  "Amit C.",
  "Riya G.",
  "Siddharth L.",
  "Kavya N.",
];

export default function LeaderboardPage() {
  const [exams, setExams] = useState([]);
  const [tests, setTests] = useState([]);
  const [testId, setTestId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("iitneet_student");
    if (s) setStudent(JSON.parse(s));
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
    fetch("/api/tests?type=FULL_MOCK&sort=popular&limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTests(d.data.tests || []);
      });
  }, []);

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    fetch(`/api/leaderboard?testId=${testId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, [testId]);

  const entries = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <>
      <Navbar exams={exams} />
      <div
        style={{
          marginTop: 68,
          minHeight: "100vh",
          background: "var(--bg-light)",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)",
            padding: "40px 20px",
          }}
        >
          <div className="container">
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "white" }}>
              🏆 All India Leaderboard
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
              See how you rank among students across India
            </p>
          </div>
        </div>
        <div
          className="container"
          style={{ padding: "24px 20px", maxWidth: 700 }}
        >
          {/* Select test */}
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              padding: 20,
              marginBottom: 20,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Select Test
            </label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select a test --</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.exam?.name})
                </option>
              ))}
            </select>
          </div>

          {/* My rank card */}
          {myRank && (
            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  Your Rank
                </p>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  #{myRank.rank}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginTop: 4,
                  }}
                >
                  Score: {myRank.score}/{myRank.totalMarks}
                </p>
              </div>
              <MdEmojiEvents
                style={{ fontSize: 56, color: "rgba(255,255,255,0.3)" }}
              />
            </div>
          )}

          {/* Leaderboard table */}
          {testId && (
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700 }}>Top Rankers</p>
                {entries.length > 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {entries.length} entries
                  </p>
                )}
              </div>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "3px solid var(--primary-light)",
                      borderTop: "3px solid var(--primary)",
                      borderRadius: "50%",
                      margin: "0 auto",
                    }}
                    className="animate-spin"
                  />
                </div>
              ) : entries.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  <p>No attempts yet for this test</p>
                </div>
              ) : (
                entries.map((e, i) => {
                  const displayName =
                    e.name || DUMMY_NAMES[i % DUMMY_NAMES.length];
                  const isMe = student && e.name === student.name;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 20px",
                        borderBottom:
                          i < entries.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                        background: isMe ? "var(--primary-light)" : "white",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background:
                            i === 0
                              ? "#FFD700"
                              : i === 1
                                ? "#C0C0C0"
                                : i === 2
                                  ? "#CD7F32"
                                  : "var(--bg-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 800,
                          color: i < 3 ? "white" : "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </div>
                      <p
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: isMe ? 700 : 500,
                          color: isMe
                            ? "var(--primary-dark)"
                            : "var(--text-primary)",
                        }}
                      >
                        {isMe ? `${displayName} (You)` : displayName}
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: isMe
                            ? "var(--primary)"
                            : "var(--text-primary)",
                        }}
                      >
                        {e.score}
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            fontWeight: 400,
                          }}
                        >
                          /{e.totalMarks}
                        </span>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {!testId && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🏆</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>
                Select a test to see leaderboard
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
