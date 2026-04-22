"use client";
import { useState, useEffect, useRef } from "react";
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
  MdChevronRight,
  MdChevronLeft,
  MdCheck,
  MdRefresh,
  MdOutlineBookmarkBorder,
  MdOutlineBookmark,
} from "react-icons/md";
import ReportModal from "@/components/ReportModal";
import { MAX_TAB_SWITCHES } from "@/lib/constants";

// ── Math renderer ─────────────────────────────────────────────────────────────
function renderMath(value, katex) {
  if (!value || !katex) return value || "";
  try {
    let r = value;
    r = r.replace(/\$\$([^$]+)\$\$/g, (_, m) => {
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
    r = r.replace(/\$([^$\n]+)\$/g, (_, m) => {
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
    if (!r.includes("$") && /\\[a-zA-Z]/.test(r)) {
      try {
        return katex.renderToString(r.trim(), {
          throwOnError: false,
          displayMode: false,
          output: "html",
          strict: false,
        });
      } catch {}
    }
    return r.replace(/\n/g, "<br/>");
  } catch {
    return value;
  }
}

// ── Question status → palette colour ─────────────────────────────────────────
function getPaletteStyle(status, active) {
  if (active)
    return "bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1";
  if (status === "answered") return "bg-emerald-500 text-white";
  if (status === "answered-marked") return "bg-violet-600 text-white";
  if (status === "marked")
    return "bg-violet-100 text-violet-700 ring-1 ring-violet-300";
  if (status === "visited") return "bg-red-50 text-red-600 ring-1 ring-red-200";
  return "bg-slate-100 text-slate-500";
}

// ── Timer ─────────────────────────────────────────────────────────────────────
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
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${isLow ? "bg-red-50 ring-1 ring-red-200" : "bg-teal-50 ring-1 ring-teal-200"}`}
    >
      <MdTimer
        size={16}
        className={isLow ? "text-red-500 animate-pulse" : "text-teal-600"}
      />
      <span
        className={`font-mono text-sm font-extrabold tabular-nums ${isLow ? "text-red-600" : "text-teal-700"}`}
      >
        {h > 0 && `${String(h).padStart(2, "0")}:`}
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
}

// ── Tab switch warning modal ───────────────────────────────────────────────────
function TabWarning({ count, max, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <MdWarning size={32} className="text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-extrabold text-red-600">
          Tab Switch Detected!
        </h2>
        <p className="mb-1 text-sm text-slate-600">
          You switched tabs or minimised the browser.
        </p>
        <p className="mb-6 text-sm font-bold text-red-600">
          Warning {count}/{max} — Test auto-submits after {max} switches
        </p>
        <div className="mb-3 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-red-500 transition-all"
            style={{ width: `${(count / max) * 100}%` }}
          />
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
        >
          Return to Test
        </button>
      </div>
    </div>
  );
}

// ── Submit confirmation modal ─────────────────────────────────────────────────
function SubmitModal({
  answered,
  total,
  marked,
  onCancel,
  onSubmit,
  submitting,
}) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="mb-1 text-2xl font-extrabold text-slate-900">
          Submit Test?
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Review your progress before submitting.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-emerald-50 py-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">
              {answered}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-700">
              Answered
            </p>
          </div>
          <div className="rounded-2xl bg-red-50 py-4 text-center">
            <p className="text-2xl font-extrabold text-red-500">{unanswered}</p>
            <p className="mt-1 text-[11px] font-semibold text-red-600">
              Unanswered
            </p>
          </div>
          <div className="rounded-2xl bg-violet-50 py-4 text-center">
            <p className="text-2xl font-extrabold text-violet-600">{marked}</p>
            <p className="mt-1 text-[11px] font-semibold text-violet-700">
              Marked
            </p>
          </div>
        </div>

        {unanswered > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <MdWarning size={16} className="flex-shrink-0 text-amber-600" />
            <p className="text-[13px] text-amber-700">
              {unanswered} question{unanswered > 1 ? "s" : ""} unanswered.
              Unanswered = 0 marks.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Continue Test
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Final"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Palette ──────────────────────────────────────────────────────────
function Palette({
  questions,
  current,
  answers,
  marked,
  visited,
  getStatus,
  goTo,
  onClose,
  show,
}) {
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;

  return (
    <>
      {/* Mobile backdrop */}
      {show && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed bottom-0 right-0 z-40 flex h-[70vh] w-full flex-col bg-white shadow-2xl
        transition-transform duration-300 lg:static lg:h-auto lg:w-72 lg:translate-y-0 lg:shadow-none lg:border-l lg:border-slate-200 xl:w-80
        ${show ? "translate-y-0" : "translate-y-full"}
        rounded-t-3xl lg:rounded-none
      `}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <MdGridView size={16} className="text-slate-500" />
            <p className="text-sm font-bold text-slate-800">Question Palette</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            {
              val: answeredCount,
              label: "Answered",
              color: "text-emerald-600",
            },
            { val: markedCount, label: "Marked", color: "text-violet-600" },
            {
              val: questions.length - answeredCount,
              label: "Left",
              color: "text-red-500",
            },
          ].map((s) => (
            <div key={s.label} className="py-3 text-center">
              <p className={`text-lg font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] font-medium text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-1.5 border-b border-slate-100 px-4 py-3">
          {[
            { style: "bg-emerald-500", label: "Answered" },
            { style: "bg-violet-600", label: "Ans + Marked" },
            { style: "bg-violet-100 ring-1 ring-violet-300", label: "Marked" },
            { style: "bg-red-50 ring-1 ring-red-200", label: "Not Answered" },
            { style: "bg-slate-100", label: "Not Visited" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 flex-shrink-0 rounded-sm ${l.style}`} />
              <span className="text-[11px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7 lg:grid-cols-5 xl:grid-cols-6">
            {questions.map((_, i) => {
              const status = getStatus(i);
              const active = i === current;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`flex aspect-square items-center justify-center rounded-lg text-[12px] font-bold transition-all ${getPaletteStyle(status, active)}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({ label, text, selected, multi, onClick, katex }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
        selected
          ? "border-teal-500 bg-teal-50"
          : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
      }`}
    >
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center ${multi ? "rounded-lg" : "rounded-full"} text-[13px] font-extrabold transition-colors ${
          selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {selected && multi ? <MdCheck size={14} /> : label}
      </span>
      {katex ? (
        <span
          className="flex-1 text-sm leading-relaxed text-slate-800"
          dangerouslySetInnerHTML={{ __html: renderMath(text, katex) }}
        />
      ) : (
        <span className="flex-1 text-sm leading-relaxed text-slate-800">
          {text}
        </span>
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    import("katex").then((k) => setKatex(k.default));
  }, []);

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
          const saved = {};
          d.data.attempt.answers.forEach((a) => {
            saved[a.questionId] =
              a.selectedOption || a.integerAnswer || a.selectedOptions;
          });
          setAnswers(saved);
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
    function onVisibility() {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          if (next >= MAX_TAB_SWITCHES) handleSubmit(true, next);
          else setShowTabWarn(true);
          return next;
        });
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [attempt]);

  // Block right-click / copy / paste
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

  // Auto-save every 30s
  useEffect(() => {
    if (!attempt) return;
    const t = setInterval(saveCurrentAnswer, 30000);
    return () => clearInterval(t);
  }, [attempt, answers, current]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight" && current < questions.length - 1)
        goTo(current + 1);
      if (e.key === "ArrowLeft" && current > 0) goTo(current - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, questions.length]);

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
      const res = await fetch("/api/attempt/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          timeTakenSecs: Math.floor((Date.now() - startTime.current) / 1000),
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

  function goTo(i) {
    setCurrent(i);
    setVisited((v) => ({ ...v, [i]: true }));
  }

  function getStatus(i) {
    const qid = questions[i]?.id;
    if (!qid) return "not-visited";
    const hasAns =
      answers[qid] !== undefined &&
      answers[qid] !== "" &&
      (Array.isArray(answers[qid]) ? answers[qid].length > 0 : true);
    if (hasAns && marked[qid]) return "answered-marked";
    if (hasAns) return "answered";
    if (marked[qid]) return "marked";
    if (visited[i]) return "visited";
    return "not-visited";
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).filter((k) => {
    const a = answers[k];
    return a !== undefined && a !== "" && (!Array.isArray(a) || a.length > 0);
  }).length;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const progress = Math.round(
    (answeredCount / Math.max(questions.length, 1)) * 100,
  );

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
        <p className="text-sm font-medium text-slate-500">Loading test...</p>
      </div>
    );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 select-none">
      {/* Modals */}
      {reportId && (
        <ReportModal questionId={reportId} onClose={() => setReportId(null)} />
      )}
      {showTabWarn && (
        <TabWarning
          count={tabSwitches}
          max={MAX_TAB_SWITCHES}
          onClose={() => setShowTabWarn(false)}
        />
      )}
      {showSubmit && (
        <SubmitModal
          answered={answeredCount}
          total={questions.length}
          marked={markedCount}
          onCancel={() => setShowSubmit(false)}
          onSubmit={() => handleSubmit()}
          submitting={submitting}
        />
      )}

      {/* ── TOP BAR ── */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-5">
        {/* Left: logo + test name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-[11px] font-extrabold text-white">
            IN
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-800 max-w-[200px] lg:max-w-sm">
              {testInfo.testTitle || questions[0]?.chapter?.name || "Test"}
            </p>
            <p className="text-[11px] text-slate-400">
              Q {current + 1}/{questions.length} · +{testInfo.marksCorrect}/
              {testInfo.negativeMarking}
            </p>
          </div>
          {/* Mobile: just Q counter */}
          <span className="text-sm font-bold text-slate-700 sm:hidden">
            Q {current + 1}/{questions.length}
          </span>
        </div>

        {/* Center: progress bar (hidden on mobile) */}
        <div className="hidden flex-1 items-center gap-3 px-6 md:flex">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-[12px] font-semibold text-slate-500">
            {answeredCount}/{questions.length}
          </span>
        </div>

        {/* Right: tab warn + timer + palette toggle + submit */}
        <div className="flex items-center gap-2">
          {tabSwitches > 0 && (
            <span className="hidden items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-200 sm:flex">
              ⚠️ {tabSwitches}/{MAX_TAB_SWITCHES}
            </span>
          )}

          {attempt && (
            <Timer
              totalSecs={testInfo.durationMins * 60}
              onTimeUp={() => handleSubmit(true)}
            />
          )}

          {/* Palette toggle (mobile) */}
          <button
            onClick={() => setShowPalette((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <MdGridView size={18} />
          </button>

          <button
            onClick={() => setShowSubmit(true)}
            className="rounded-xl bg-teal-600 px-3 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-teal-700 sm:px-4"
          >
            Submit
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── QUESTION AREA ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Question header strip */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-2 sm:px-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-teal-600 px-3 py-1 text-[12px] font-bold text-white">
                Q {current + 1}
              </span>
              {q?.chapter?.name && (
                <span className="text-[12px] text-slate-400">
                  {q.chapter.name}
                </span>
              )}
              {q?.difficulty && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    q.difficulty === "EASY"
                      ? "bg-emerald-50 text-emerald-700"
                      : q.difficulty === "HARD"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {q.difficulty}
                </span>
              )}
            </div>
            <span className="text-[12px] font-semibold text-slate-400">
              +{testInfo.marksCorrect} / {testInfo.negativeMarking}
            </span>
          </div>

          {/* Scrollable question content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Question card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {q?.questionImageUrl && (
                  <img
                    src={q.questionImageUrl}
                    alt=""
                    className="mb-4 max-h-52 rounded-xl object-contain"
                  />
                )}
                {katex ? (
                  <div
                    className="text-[15px] leading-[1.9] text-slate-800"
                    dangerouslySetInnerHTML={{
                      __html: renderMath(q?.questionText, katex),
                    }}
                  />
                ) : (
                  <p className="text-[15px] leading-[1.9] text-slate-800">
                    {q?.questionText}
                  </p>
                )}
              </div>

              {/* MCQ */}
              {q?.questionType === "MCQ" && (
                <div className="space-y-2.5">
                  {q.options?.map((opt) => (
                    <OptionBtn
                      key={opt.id}
                      label={opt.label}
                      text={opt.optionText}
                      selected={answers[q.id] === opt.label}
                      multi={false}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [q.id]: opt.label }))
                      }
                      katex={katex}
                    />
                  ))}
                </div>
              )}

              {/* Multi-correct */}
              {q?.questionType === "MULTI_CORRECT" && (
                <div className="space-y-2.5">
                  <p className="text-[12px] font-semibold text-slate-400">
                    Select all correct options
                  </p>
                  {q.options?.map((opt) => {
                    const sel = (
                      Array.isArray(answers[q.id]) ? answers[q.id] : []
                    ).includes(opt.label);
                    return (
                      <OptionBtn
                        key={opt.id}
                        label={opt.label}
                        text={opt.optionText}
                        selected={sel}
                        multi={true}
                        onClick={() => {
                          const prev = Array.isArray(answers[q.id])
                            ? answers[q.id]
                            : [];
                          const next = prev.includes(opt.label)
                            ? prev.filter((l) => l !== opt.label)
                            : [...prev, opt.label];
                          setAnswers((a) => ({ ...a, [q.id]: next }));
                        }}
                        katex={katex}
                      />
                    );
                  })}
                </div>
              )}

              {/* Integer */}
              {q?.questionType === "INTEGER" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 text-[13px] font-semibold text-slate-500">
                    Enter your answer:
                  </p>
                  <input
                    type="number"
                    placeholder="0"
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                    onWheel={(e) => e.target.blur()}
                    className="w-36 rounded-xl border-2 border-slate-200 bg-slate-50 py-3 text-center text-2xl font-extrabold text-slate-800 outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM NAV BAR ── */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
              {/* Left actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => q && setReportId(q.id)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  <MdFlag size={14} />{" "}
                  <span className="hidden sm:inline">Report</span>
                </button>

                <button
                  onClick={() =>
                    setMarked((m) => ({ ...m, [q?.id]: !m[q?.id] }))
                  }
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
                    marked[q?.id]
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {marked[q?.id] ? (
                    <MdOutlineBookmark size={15} />
                  ) : (
                    <MdOutlineBookmarkBorder size={15} />
                  )}
                  <span className="hidden sm:inline">
                    {marked[q?.id] ? "Marked" : "Mark"}
                  </span>
                </button>

                {answers[q?.id] !== undefined &&
                  answers[q?.id] !== "" &&
                  !(
                    Array.isArray(answers[q?.id]) && answers[q?.id].length === 0
                  ) && (
                    <button
                      onClick={() =>
                        setAnswers((a) => {
                          const c = { ...a };
                          delete c[q.id];
                          return c;
                        })
                      }
                      className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <MdRefresh size={14} />{" "}
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
              </div>

              {/* Right: Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => current > 0 && goTo(current - 1)}
                  disabled={current === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <MdArrowBack size={16} />{" "}
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {current === questions.length - 1 ? (
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <MdCheck size={16} /> Submit
                  </button>
                ) : (
                  <button
                    onClick={() => goTo(current + 1)}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
                  >
                    <span className="hidden sm:inline">Next</span>{" "}
                    <MdArrowForward size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ── PALETTE: desktop always visible, mobile sheet ── */}
        <Palette
          questions={questions}
          current={current}
          answers={answers}
          marked={marked}
          visited={visited}
          getStatus={getStatus}
          goTo={(i) => {
            goTo(i);
            setShowPalette(false);
          }}
          onClose={() => setShowPalette(false)}
          show={showPalette}
        />

        {/* Desktop palette toggle button (collapsed state) — shown as a tab on the right edge when palette is hidden on desktop */}
        {/* Desktop: palette is always rendered via CSS, the button below is just for mobile */}
      </div>

      {/* Palette toggle FAB — only on mobile when palette is closed */}
      {!showPalette && (
        <button
          onClick={() => setShowPalette(true)}
          className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 shadow-lg text-white transition hover:bg-teal-700 lg:hidden"
        >
          <MdGridView size={22} />
        </button>
      )}
    </div>
  );
}
