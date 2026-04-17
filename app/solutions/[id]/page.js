"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdRadioButtonUnchecked,
  MdBookmark,
  MdBookmarkBorder,
  MdFlag,
} from "react-icons/md";

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

export default function SolutionsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [katex, setKatex] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    import("katex").then((k) => setKatex(k.default));
  }, []);
  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/bookmark")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookmarks(d.data.map((q) => q.id));
      });
  }, [id]);

  async function toggleBookmark(questionId) {
    const isBookmarked = bookmarks.includes(questionId);
    const method = isBookmarked ? "DELETE" : "POST";
    const res = await fetch("/api/bookmark", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    });
    const d = await res.json();
    if (d.success) {
      setBookmarks((prev) =>
        isBookmarked
          ? prev.filter((id) => id !== questionId)
          : [...prev, questionId],
      );
      toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked!");
    }
  }

  async function reportQuestion(questionId) {
    const type = prompt(
      "Report type:\n1. Wrong answer\n2. Typo\n3. Unclear\n4. Image issue\n5. Other\nEnter number:",
    );
    const types = {
      1: "wrong_answer",
      2: "typo",
      3: "unclear",
      4: "image_issue",
      5: "other",
    };
    if (!type || !types[type]) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, reportType: types[type] }),
    });
    toast.success("Report submitted!");
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--primary-light)",
            borderTop: "3px solid var(--primary)",
            borderRadius: "50%",
          }}
          className="animate-spin"
        />
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
        <p>Not found</p>
      </div>
    );

  const { attempt } = data;
  const questions = attempt.test?.testQuestions?.map((tq) => tq.question) || [];
  const answers = attempt.answers || [];

  const filtered = questions.filter((q) => {
    const a = answers.find((an) => an.questionId === q.id);
    if (filter === "correct") return a?.isCorrect === true;
    if (filter === "wrong")
      return (
        a?.isCorrect === false &&
        (a?.selectedOption || a?.integerAnswer || a?.selectedOptions?.length)
      );
    if (filter === "skipped")
      return (
        !a?.selectedOption && !a?.integerAnswer && !a?.selectedOptions?.length
      );
    return true;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        paddingBottom: 60,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)",
          padding: "32px 20px",
        }}
      >
        <div className="container">
          <Link
            href={`/result/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            <MdArrowBack /> Back to Result
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "white" }}>
            Solutions Review
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginTop: 4,
            }}
          >
            {questions.length} questions
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "20px" }}>
        {/* Filter */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {[
            ["all", "All"],
            ["correct", "✓ Correct"],
            ["wrong", "✗ Wrong"],
            ["skipped", "— Skipped"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: `2px solid ${filter === val ? "var(--primary)" : "var(--border)"}`,
                background: filter === val ? "var(--primary)" : "white",
                color: filter === val ? "white" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              {label} {val === "all" ? `(${questions.length})` : ""}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((q, idx) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const isCorrect = answer?.isCorrect;
            const isSkipped =
              !answer?.selectedOption &&
              !answer?.integerAnswer &&
              !answer?.selectedOptions?.length;
            const isBookmarked = bookmarks.includes(q.id);

            return (
              <div
                key={q.id}
                style={{
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  border: `2px solid ${isCorrect ? "#BBF7D0" : isSkipped ? "var(--border)" : "#FECACA"}`,
                  overflow: "hidden",
                }}
              >
                {/* Status bar */}
                <div
                  style={{
                    padding: "10px 20px",
                    background: isCorrect
                      ? "#F0FDF4"
                      : isSkipped
                        ? "var(--bg-light)"
                        : "#FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {isCorrect ? (
                      <MdCheckCircle
                        style={{ color: "#16A34A", fontSize: 20 }}
                      />
                    ) : isSkipped ? (
                      <MdRadioButtonUnchecked
                        style={{ color: "#94A3B8", fontSize: 20 }}
                      />
                    ) : (
                      <MdCancel style={{ color: "#DC2626", fontSize: 20 }} />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isCorrect
                          ? "#16A34A"
                          : isSkipped
                            ? "#94A3B8"
                            : "#DC2626",
                      }}
                    >
                      {isCorrect ? "Correct" : isSkipped ? "Skipped" : "Wrong"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Q{questions.indexOf(q) + 1}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 20,
                        color: isBookmarked
                          ? "var(--primary)"
                          : "var(--text-muted)",
                        display: "flex",
                      }}
                    >
                      {isBookmarked ? <MdBookmark /> : <MdBookmarkBorder />}
                    </button>
                    <button
                      onClick={() => reportQuestion(q.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "var(--text-muted)",
                        display: "flex",
                      }}
                    >
                      <MdFlag />
                    </button>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* Question */}
                  {katex ? (
                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        marginBottom: 16,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderMath(q.questionText, katex),
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        marginBottom: 16,
                      }}
                    >
                      {q.questionText}
                    </p>
                  )}

                  {/* Options */}
                  {q.options?.map((opt) => {
                    const isMyAnswer = answer?.selectedOption === opt.label;
                    const isRight = opt.isCorrect;
                    return (
                      <div
                        key={opt.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: `1.5px solid ${isRight ? "#BBF7D0" : isMyAnswer && !isRight ? "#FECACA" : "var(--border)"}`,
                          background: isRight
                            ? "#F0FDF4"
                            : isMyAnswer && !isRight
                              ? "#FEF2F2"
                              : "var(--bg-light)",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: isRight
                              ? "#16A34A"
                              : isMyAnswer && !isRight
                                ? "#DC2626"
                                : "var(--bg-gray)",
                            color:
                              isRight || (isMyAnswer && !isRight)
                                ? "white"
                                : "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {opt.label}
                        </span>
                        {katex ? (
                          <span
                            style={{ fontSize: 14, flex: 1 }}
                            dangerouslySetInnerHTML={{
                              __html: renderMath(opt.optionText, katex),
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 14, flex: 1 }}>
                            {opt.optionText}
                          </span>
                        )}
                        {isRight && (
                          <MdCheckCircle
                            style={{ color: "#16A34A", fontSize: 18 }}
                          />
                        )}
                        {isMyAnswer && !isRight && (
                          <MdCancel
                            style={{ color: "#DC2626", fontSize: 18 }}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Solution */}
                  {(q.solutionText ||
                    q.solutionImageUrl ||
                    q.solutionAudioUrl ||
                    q.solutionVideoUrl) && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: "16px",
                        background: "#FFFBEB",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#92400E",
                          marginBottom: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Solution
                      </p>
                      {q.solutionText && katex ? (
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderMath(q.solutionText, katex),
                          }}
                        />
                      ) : (
                        q.solutionText && (
                          <p
                            style={{
                              fontSize: 14,
                              lineHeight: 1.7,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {q.solutionText}
                          </p>
                        )
                      )}
                      {q.solutionImageUrl && (
                        <img
                          src={q.solutionImageUrl}
                          alt="Solution"
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            marginTop: 10,
                          }}
                        />
                      )}
                      {q.solutionAudioUrl && (
                        <audio
                          controls
                          src={q.solutionAudioUrl}
                          style={{ width: "100%", marginTop: 10 }}
                        />
                      )}
                      {q.solutionVideoUrl && (
                        <div style={{ marginTop: 12 }}>
                          <iframe
                            src={q.solutionVideoUrl}
                            style={{
                              width: "100%",
                              height: 280,
                              borderRadius: 8,
                              border: "none",
                            }}
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
