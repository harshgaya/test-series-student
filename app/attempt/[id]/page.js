"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MdTimer,
  MdFlag,
  MdGridView,
  MdClose,
  MdArrowBack,
  MdArrowForward,
  MdWarning,
} from "react-icons/md";
import ReportModal from "@/components/ReportModal";
import { MAX_TAB_SWITCHES } from "@/lib/constants";

function renderMath(value, katex) {
  if (!value || !katex) return value || "";
  try {
    let result = value;
    result = result.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: true,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    result = result.replace(/\$([^$\n]+)\$/g, (_, m) => {
      try {
        return katex.renderToString(m.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {
        return m;
      }
    });
    if (!result.includes("$") && /\\[a-zA-Z]/.test(result)) {
      try {
        return katex.renderToString(result.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {}
    }
    result = result.replace(/\n/g, "<br/>");
    return result;
  } catch {
    return value;
  }
}

function getPaletteColor(status) {
  if (status === "answered") return { bg: "#16A34A", text: "white" };
  if (status === "marked") return { bg: "#7C3AED", text: "white" };
  if (status === "visited")
    return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
}

function Timer({ totalSecs, onTimeUp }) {
  const [secs, setSecs] = useState(totalSecs);
  useEffect(() => {
    if (secs <= 0) {
      onTimeUp();
      return;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const h = Math.floor(secs / 3600),
    m = Math.floor((secs % 3600) / 60),
    s = secs % 60;
  const isLow = secs < 300;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        background: isLow ? "#FEF2F2" : "#F0FDFA",
        border: `1px solid ${isLow ? "#FECACA" : "#99F6E4"}`,
        borderRadius: "var(--radius-full)",
      }}
    >
      <MdTimer style={{ color: isLow ? "#DC2626" : "#0D9488", fontSize: 18 }} />
      <span
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: isLow ? "#DC2626" : "#0F766E",
          fontFamily: "monospace",
        }}
      >
        {h > 0 && `${String(h).padStart(2, "0")}:`}
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function AttemptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [testInfo, setTestInfo] = useState({});
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({ 0: true });
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarn, setShowTabWarn] = useState(false);
  const [katex, setKatex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportId, setReportId] = useState(null);
  const startTime = useRef(Date.now());
  const saveTimer = useRef(null);

  useEffect(() => {
    import("katex").then((k) => setKatex(k.default));
  }, []);

  // Client-side login guard
  useEffect(() => {
    const student = localStorage.getItem("iitneet_student");
    if (!student) {
      router.replace("/login?redirect=/attempt/" + id);
      return;
    }
  }, [id]);

  useEffect(() => {
    fetch("/api/attempt/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId: id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          toast.error(d.error || "Cannot start test");
          router.back();
          return;
        }
        setAttempt(d.data.attempt);
        setQuestions(d.data.questions);
        setTestInfo({
          durationMins: d.data.durationMins,
          marksCorrect: d.data.marksCorrect,
          negativeMarking: d.data.negativeMarking,
        });
        if (d.data.resumed && d.data.attempt.answers) {
          const savedAnswers = {};
          d.data.attempt.answers.forEach((a) => {
            savedAnswers[a.questionId] =
              a.selectedOption || a.integerAnswer || a.selectedOptions;
          });
          setAnswers(savedAnswers);
        }
      })
      .catch(() => {
        toast.error("Failed to start test");
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Tab switch detection
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          if (next >= MAX_TAB_SWITCHES) {
            handleSubmit(true, next);
          } else {
            setShowTabWarn(true);
          }
          return next;
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [attempt]);

  // Block right click + copy paste
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
    };
  }, []);

  // Auto save every 30s
  useEffect(() => {
    if (!attempt) return;
    saveTimer.current = setInterval(() => saveCurrentAnswer(), 30000);
    return () => clearInterval(saveTimer.current);
  }, [attempt, answers, current]);

  async function saveCurrentAnswer() {
    if (!attempt || !questions[current]) return;
    const q = questions[current];
    const a = answers[q.id];
    if (!a) return;
    await fetch("/api/attempt/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: attempt.id,
        questionId: q.id,
        selectedOption: typeof a === "string" ? a : null,
        selectedOptions: Array.isArray(a) ? a : [],
        integerAnswer: typeof a === "number" ? a : null,
        isMarked: marked[q.id] || false,
        timeSpentSecs: Math.floor((Date.now() - startTime.current) / 1000),
      }),
    });
  }

  async function handleSubmit(auto = false, switches = tabSwitches) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      const res = await fetch("/api/attempt/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          timeTakenSecs: timeTaken,
          tabSwitchCount: switches,
          autoSubmitted: auto,
        }),
      });
      const d = await res.json();
      if (d.success) router.push(`/result/${attempt.id}`);
      else {
        toast.error(d.error);
        setSubmitting(false);
      }
    } catch {
      toast.error("Submit failed");
      setSubmitting(false);
    }
  }

  function selectOption(label) {
    const q = questions[current];
    setAnswers((a) => ({ ...a, [q.id]: label }));
  }

  function selectMulti(label) {
    const q = questions[current];
    const prev = Array.isArray(answers[q.id]) ? answers[q.id] : [];
    const next = prev.includes(label)
      ? prev.filter((l) => l !== label)
      : [...prev, label];
    setAnswers((a) => ({ ...a, [q.id]: next }));
  }

  function goTo(i) {
    setCurrent(i);
    setVisited((v) => ({ ...v, [i]: true }));
    setShowPalette(false);
  }

  function getStatus(i) {
    const qid = questions[i]?.id;
    if (!qid) return "not-visited";
    if (answers[qid] !== undefined && marked[qid]) return "answered-marked";
    if (answers[qid] !== undefined) return "answered";
    if (marked[qid]) return "marked";
    if (visited[i]) return "visited";
    return "not-visited";
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.keys(marked).filter((k) => marked[k]).length;
  const q = questions[current];

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid var(--primary-light)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
          }}
          className="animate-spin"
        />
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Loading test...
        </p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {reportId && (
        <ReportModal questionId={reportId} onClose={() => setReportId(null)} />
      )}

      {/* Tab switch warning */}
      {showTabWarn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "#FEF2F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 32,
              }}
            >
              <MdWarning style={{ color: "#DC2626" }} />
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#DC2626",
                marginBottom: 8,
              }}
            >
              Tab Switch Detected!
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                marginBottom: 8,
              }}
            >
              You switched tabs or minimized the browser.
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#DC2626",
                marginBottom: 20,
              }}
            >
              Warning {tabSwitches}/{MAX_TAB_SWITCHES} — Test will auto-submit
              after {MAX_TAB_SWITCHES} switches
            </p>
            <button
              onClick={() => setShowTabWarn(false)}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Return to Test
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {showSubmit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              Submit Test?
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "#F0FDF4",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 24, fontWeight: 800, color: "#16A34A" }}>
                  {answeredCount}
                </p>
                <p style={{ fontSize: 12, color: "#16A34A" }}>Answered</p>
              </div>
              <div
                style={{
                  background: "#FEF2F2",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 24, fontWeight: 800, color: "#DC2626" }}>
                  {questions.length - answeredCount}
                </p>
                <p style={{ fontSize: 12, color: "#DC2626" }}>Unanswered</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowSubmit(false)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Continue
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background:
                "linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "white",
            }}
          >
            IN
          </div>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {questions[0]?.chapter?.name || "Test"}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Q {current + 1}/{questions.length} · {testInfo.marksCorrect} marks
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {tabSwitches > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#DC2626",
                background: "#FEF2F2",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
              }}
            >
              ⚠️ {tabSwitches}/{MAX_TAB_SWITCHES} switches
            </span>
          )}
          {attempt && (
            <Timer
              totalSecs={testInfo.durationMins * 60}
              onTimeUp={() => handleSubmit(true)}
            />
          )}
          <button
            onClick={() => setShowPalette((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "var(--primary-light)",
              border: "1px solid var(--primary-border)",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--primary-dark)",
              cursor: "pointer",
              fontFamily: "var(--font)",
            }}
          >
            <MdGridView /> Palette
          </button>
          <button
            onClick={() => setShowSubmit(true)}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            Submit
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Question area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* Question header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "6px 16px",
                    background: "var(--primary)",
                    color: "white",
                    borderRadius: "var(--radius-full)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Q {current + 1} / {questions.length}
                </span>
                {q?.chapter?.name && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {q.chapter.name}
                  </span>
                )}
                {q?.difficulty && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "var(--radius-full)",
                      background:
                        q.difficulty === "EASY"
                          ? "#F0FDF4"
                          : q.difficulty === "HARD"
                            ? "#FEF2F2"
                            : "#FFFBEB",
                      color:
                        q.difficulty === "EASY"
                          ? "#16A34A"
                          : q.difficulty === "HARD"
                            ? "#DC2626"
                            : "#D97706",
                    }}
                  >
                    {q.difficulty}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                +{testInfo.marksCorrect} / {testInfo.negativeMarking}
              </div>
            </div>

            {/* Question text */}
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                padding: "24px",
                marginBottom: 16,
              }}
            >
              {q?.questionImageUrl && (
                <img
                  src={q.questionImageUrl}
                  alt=""
                  style={{
                    maxHeight: 200,
                    objectFit: "contain",
                    marginBottom: 16,
                    borderRadius: 8,
                  }}
                />
              )}
              {q && katex ? (
                <div
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: "var(--text-primary)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderMath(q.questionText, katex),
                  }}
                />
              ) : (
                <p style={{ fontSize: 16, lineHeight: 1.8 }}>
                  {q?.questionText}
                </p>
              )}
            </div>

            {/* MCQ options */}
            {q?.questionType === "MCQ" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {q.options?.map((opt) => {
                  const selected = answers[q.id] === opt.label;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(opt.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        background: selected ? "var(--primary-light)" : "white",
                        border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        fontFamily: "var(--font)",
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: selected
                            ? "var(--primary)"
                            : "var(--bg-light)",
                          color: selected ? "white" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {opt.label}
                      </span>
                      {katex ? (
                        <span
                          style={{
                            fontSize: 15,
                            color: "var(--text-primary)",
                            flex: 1,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderMath(opt.optionText, katex),
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 15, flex: 1 }}>
                          {opt.optionText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi correct */}
            {q?.questionType === "MULTI_CORRECT" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Select all correct options
                </p>
                {q.options?.map((opt) => {
                  const sel = (
                    Array.isArray(answers[q.id]) ? answers[q.id] : []
                  ).includes(opt.label);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectMulti(opt.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        background: sel ? "var(--primary-light)" : "white",
                        border: `2px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font)",
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: sel
                            ? "var(--primary)"
                            : "var(--bg-light)",
                          color: sel ? "white" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {opt.label}
                      </span>
                      {katex ? (
                        <span
                          style={{ fontSize: 15, flex: 1 }}
                          dangerouslySetInnerHTML={{
                            __html: renderMath(opt.optionText, katex),
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 15, flex: 1 }}>
                          {opt.optionText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Integer */}
            {q?.questionType === "INTEGER" && (
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  Enter integer answer:
                </label>
                <input
                  type="number"
                  className="input-field"
                  style={{
                    width: 160,
                    fontSize: 20,
                    fontWeight: 800,
                    textAlign: "center",
                  }}
                  placeholder="0"
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                  }
                />
              </div>
            )}

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => q && setReportId(q.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 14px",
                    borderRadius: "var(--r-full)",
                    border: "1px solid var(--border)",
                    background: "white",
                    fontSize: 13,
                    color: "var(--gray-500)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <MdFlag style={{ fontSize: 16 }} /> Report
                </button>
                <button
                  onClick={() =>
                    setMarked((m) => ({ ...m, [q?.id]: !m[q?.id] }))
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-full)",
                    border: `2px solid ${marked[q?.id] ? "#7C3AED" : "var(--border)"}`,
                    background: marked[q?.id] ? "#F5F3FF" : "white",
                    color: marked[q?.id] ? "#7C3AED" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                  }}
                >
                  <MdFlag /> {marked[q?.id] ? "Marked" : "Mark for Review"}
                </button>
                {answers[q?.id] !== undefined && (
                  <button
                    onClick={() =>
                      setAnswers((a) => {
                        const c = { ...a };
                        delete c[q.id];
                        return c;
                      })
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border)",
                      background: "white",
                      fontSize: 13,
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => current > 0 && goTo(current - 1)}
                  disabled={current === 0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: "var(--radius-full)",
                    border: "1.5px solid var(--border)",
                    background: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: current === 0 ? "not-allowed" : "pointer",
                    opacity: current === 0 ? 0.4 : 1,
                    fontFamily: "var(--font)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <MdArrowBack /> Prev
                </button>
                <button
                  onClick={() =>
                    current < questions.length - 1 && goTo(current + 1)
                  }
                  disabled={current === questions.length - 1}
                  className="btn-primary"
                  style={{
                    padding: "10px 18px",
                    fontSize: 13,
                    opacity: current === questions.length - 1 ? 0.4 : 1,
                  }}
                >
                  Next <MdArrowForward />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Palette sidebar */}
        {showPalette && (
          <div
            style={{
              width: 280,
              background: "white",
              borderLeft: "1px solid var(--border)",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "white",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700 }}>Question Palette</p>
              <button
                onClick={() => setShowPalette(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "var(--text-muted)",
                  display: "flex",
                }}
              >
                <MdClose />
              </button>
            </div>

            {/* Legend */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                ["answered", "Answered"],
                ["marked", "Marked"],
                ["visited", "Not Answered"],
                ["not-visited", "Not Visited"],
              ].map(([s, l]) => {
                const c = getPaletteColor(s);
                return (
                  <div
                    key={s}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: c.bg,
                        border: `1px solid ${c.border || c.bg}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {l}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                textAlign: "center",
                gap: 8,
              }}
            >
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#16A34A" }}>
                  {answeredCount}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  Answered
                </p>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#7C3AED" }}>
                  {markedCount}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  Marked
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--text-muted)",
                  }}
                >
                  {questions.length - answeredCount}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Left</p>
              </div>
            </div>

            {/* Grid */}
            <div
              style={{
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
              }}
            >
              {questions.map((_, i) => {
                const status = getStatus(i);
                const c = getPaletteColor(status);
                const active = i === current;
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      background: active ? "var(--primary)" : c.bg,
                      color: active ? "white" : c.text,
                      border: active ? "none" : `1px solid ${c.border || c.bg}`,
                      outline: active ? "2px solid var(--primary)" : "none",
                      outlineOffset: active ? "2px" : "0",
                      transition: "all 0.15s",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
