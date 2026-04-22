"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MdEmojiEvents,
  MdPeople,
  MdSearch,
  MdTrendingUp,
  MdArrowForward,
  MdInsights,
  MdAccessTime,
  MdPlayArrow,
} from "react-icons/md";

/* Tailwind-safe color lookup */
const pctChipTone = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

const AVATAR_GRADS = [
  "from-teal-500 to-cyan-500",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-500",
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("mine");
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLb, setLoadingLb] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [search, setSearch] = useState("");

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem("iitneet_student");
    if (s) setStudent(JSON.parse(s));

    Promise.all([
      fetch("/api/exams")
        .then((r) => r.json())
        .catch(() => ({ success: false })),
      fetch("/api/student/attempts")
        .then((r) => r.json())
        .catch(() => ({ success: false })),
      fetch("/api/tests?sort=popular&limit=50")
        .then((r) => r.json())
        .catch(() => ({ success: false })),
    ])
      .then(([e, at, t]) => {
        if (e.success) setExams(e.data || []);

        let att = [];
        if (at.success) {
          att = at.data || [];
          setAttempts(att);
        }

        if (t.success) {
          // Defensive — handle both {data: {tests: [...]}} and {data: [...]} response shapes
          const testsList =
            t.data?.tests || (Array.isArray(t.data) ? t.data : []);
          setTests(testsList);
        }

        // Smart defaults
        if (att.length > 0) {
          setActiveTab("mine");
          setSelectedTestId(att[0].test?.id || null);
        } else {
          setActiveTab("browse");
        }
      })
      .finally(() => setLoadingLists(false));
  }, []);

  // ── Load leaderboard on selection ───────────────────────────
  useEffect(() => {
    if (!selectedTestId) {
      setLeaderboardData(null);
      return;
    }
    setLoadingLb(true);
    fetch(`/api/leaderboard?testId=${selectedTestId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLeaderboardData(d.data);
      })
      .finally(() => setLoadingLb(false));
  }, [selectedTestId]);

  // ── Derived ────────────────────────────────────────────────
  const selectedTest = (() => {
    const fromAttempts = attempts.find(
      (a) => a.test?.id === selectedTestId,
    )?.test;
    if (fromAttempts) return fromAttempts;
    return tests.find((t) => t.id === selectedTestId);
  })();

  const filteredTests = tests.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(s) ||
      t.exam?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <Navbar exams={exams} />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mb-2 flex items-center gap-2">
              <MdEmojiEvents size={20} className="text-amber-300" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                All India Rankings
              </p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-2 text-sm text-white/80">
              {attempts.length > 0
                ? "See where you stand across your tests"
                : "Discover top rankers across India"}
            </p>

            {/* Tabs */}
            <div className="mt-6 inline-flex items-center gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur-sm">
              <TabButton
                active={activeTab === "mine"}
                onClick={() => setActiveTab("mine")}
                icon={<MdInsights size={14} />}
                label="My Rankings"
                badge={attempts.length}
              />
              <TabButton
                active={activeTab === "browse"}
                onClick={() => setActiveTab("browse")}
                icon={<MdTrendingUp size={14} />}
                label="All Tests"
                badge={tests.length}
              />
            </div>
          </div>
        </section>

        {/* ─── BODY ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            {/* LEFT — list */}
            <aside className="space-y-3">
              {activeTab === "mine" ? (
                <MyAttemptsList
                  attempts={attempts}
                  selectedId={selectedTestId}
                  onSelect={(id) => setSelectedTestId(id)}
                  loading={loadingLists}
                />
              ) : (
                <TestsBrowseList
                  tests={filteredTests}
                  totalTests={tests.length}
                  search={search}
                  onSearch={setSearch}
                  selectedId={selectedTestId}
                  onSelect={(id) => setSelectedTestId(id)}
                  loading={loadingLists}
                />
              )}
            </aside>

            {/* RIGHT — leaderboard */}
            <section>
              <LeaderboardPanel
                test={selectedTest}
                data={leaderboardData}
                loading={loadingLb}
                student={student}
              />
            </section>
          </div>
        </div>
      </main>
      <Footer exams={exams} />
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   TAB BUTTON
   ════════════════════════════════════════════════════════════ */

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
        active
          ? "bg-white text-teal-700 shadow-sm"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
            active ? "bg-teal-100 text-teal-700" : "bg-white/20 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   LEFT PANEL — MY ATTEMPTS
   ════════════════════════════════════════════════════════════ */

function MyAttemptsList({ attempts, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <>
        <ListHeader label="Your attempts" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-400">
          <MdInsights size={28} />
        </div>
        <p className="text-sm font-bold text-slate-800">No attempts yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Take a test to see your rank
        </p>
        <Link
          href="/browse"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
        >
          Browse tests <MdArrowForward size={12} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <ListHeader label="Your attempts" count={attempts.length} />
      <ul className="space-y-2">
        {attempts.map((a) => {
          const pct =
            a.totalMarks > 0
              ? Math.round((Number(a.score) / a.totalMarks) * 100)
              : 0;
          const tone = pct >= 70 ? "emerald" : pct >= 40 ? "amber" : "rose";
          const isSel = a.test?.id === selectedId;
          return (
            <li key={a.id}>
              <button
                onClick={() => onSelect(a.test?.id)}
                disabled={!a.test?.id}
                className={`group w-full rounded-xl border p-3 text-left transition ${
                  isSel
                    ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-400/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${pctChipTone[tone]}`}
                  >
                    <span className="text-xs font-black leading-none">
                      {pct}
                    </span>
                    <span className="mt-0.5 text-[8px] font-semibold">%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-bold ${isSel ? "text-teal-800" : "text-slate-900"}`}
                    >
                      {a.test?.title || "Untitled test"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      {a.test?.exam?.name && (
                        <>
                          <span className="font-semibold">
                            {a.test.exam.name}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                        </>
                      )}
                      <MdAccessTime size={11} />
                      <span>
                        {new Date(a.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-600">
                      {Number(a.score)} / {a.totalMarks} marks
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   LEFT PANEL — ALL TESTS
   ════════════════════════════════════════════════════════════ */

function TestsBrowseList({
  tests,
  totalTests,
  search,
  onSearch,
  selectedId,
  onSelect,
  loading,
}) {
  return (
    <>
      <ListHeader label="All tests" count={totalTests} />

      <div className="relative">
        <MdSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-4xl">{search ? "🔍" : "📭"}</p>
          <p className="mt-3 text-sm font-bold text-slate-800">
            {search ? `No results for "${search}"` : "No tests published yet"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {search ? "Try different search terms" : "Check back soon"}
          </p>
          {search && (
            <button
              onClick={() => onSearch("")}
              className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {tests.map((t) => {
            const isSel = t.id === selectedId;
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelect(t.id)}
                  className={`group w-full rounded-xl border p-3 text-left transition ${
                    isSel
                      ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-400/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p
                    className={`truncate text-sm font-bold ${isSel ? "text-teal-800" : "text-slate-900"}`}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    {t.exam?.name && (
                      <span className="font-semibold">{t.exam.name}</span>
                    )}
                    {t.type && t.exam?.name && (
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                    )}
                    {t.type && (
                      <span className="uppercase tracking-wide">
                        {t.type.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   RIGHT PANEL — LEADERBOARD
   ════════════════════════════════════════════════════════════ */

function LeaderboardPanel({ test, data, loading, student }) {
  if (!test && !loading) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-400">
          <MdEmojiEvents size={32} />
        </div>
        <p className="text-lg font-bold text-slate-800">Select a test</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Pick from your attempts or browse all tests to see the leaderboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Test header */}
      {test && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Showing leaderboard for
              </p>
              <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                {test.title}
              </p>
              {test.exam?.name && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                  {test.exam.name}
                </span>
              )}
            </div>

            {/* Take test CTA — if user hasn't attempted */}
            {!loading && !data?.myRank && (
              <Link
                href={`/test/${test.id}`}
                className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-teal-600 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-teal-700"
              >
                <MdPlayArrow size={14} />
                <span className="hidden sm:inline">Take test</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* My rank banner */}
      {data?.myRank && (
        <MyRankBanner
          myRank={data.myRank}
          totalStudents={data.leaderboard?.length || 0}
        />
      )}

      {/* Rankings */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : !data || !data.leaderboard?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-sm font-bold text-slate-800">
            No attempts yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Be the first to attempt this test
          </p>
        </div>
      ) : (
        <RanksList
          entries={data.leaderboard}
          student={student}
          myRank={data.myRank}
        />
      )}
    </div>
  );
}

function MyRankBanner({ myRank, totalStudents }) {
  const pct =
    myRank.totalMarks > 0
      ? Math.round((Number(myRank.score) / myRank.totalMarks) * 100)
      : 0;

  const topRatio =
    totalStudents > 0 ? (myRank.rank / totalStudents) * 100 : null;
  const topLabel =
    topRatio === null
      ? "—"
      : topRatio < 1
        ? "< 1%"
        : topRatio < 10
          ? `${topRatio.toFixed(1)}%`
          : `${Math.round(topRatio)}%`;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600 shadow-lg shadow-teal-600/20">
      <div className="relative p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.08]">
          <MdEmojiEvents size={160} className="text-white" />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
          Your Performance
        </p>

        <div className="relative mt-3 grid grid-cols-3 divide-x divide-white/20">
          <div className="pr-3">
            <p className="text-[10px] font-semibold uppercase text-white/60">
              Rank
            </p>
            <p className="mt-1 text-2xl font-black leading-none text-white sm:text-3xl">
              #{myRank.rank}
            </p>
            {totalStudents > 0 && (
              <p className="mt-1 text-[10px] text-white/70">
                of {totalStudents.toLocaleString()}
              </p>
            )}
          </div>

          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase text-white/60">
              Top
            </p>
            <p className="mt-1 text-2xl font-black leading-none text-amber-200 sm:text-3xl">
              {topLabel}
            </p>
            <p className="mt-1 text-[10px] text-white/70">percentile</p>
          </div>

          <div className="pl-3">
            <p className="text-[10px] font-semibold uppercase text-white/60">
              Score
            </p>
            <p className="mt-1 text-2xl font-black leading-none text-white sm:text-3xl">
              {pct}%
            </p>
            <p className="mt-1 text-[10px] text-white/70">
              {Number(myRank.score)} / {myRank.totalMarks}
            </p>
          </div>
        </div>
      </div>

      {totalStudents > 0 && (
        <div className="border-t border-white/10 bg-white/5 px-5 py-3 sm:px-6">
          <div className="flex items-center justify-between text-[11px] text-white/70">
            <span>
              Ahead of{" "}
              {Math.max(0, totalStudents - myRank.rank).toLocaleString()}{" "}
              students
            </span>
            <span>{totalStudents.toLocaleString()} total</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-white transition-all duration-700"
              style={{
                width: `${Math.max(3, 100 - ((myRank.rank - 1) / totalStudents) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RanksList({ entries, student, myRank }) {
  const MAX_SHOWN = 50;
  const visible = entries.slice(0, MAX_SHOWN);
  const hidden = entries.length - visible.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <MdPeople size={16} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-800">All rankings</p>
        </div>
        <p className="text-[11px] font-semibold text-slate-500">
          {entries.length.toLocaleString()}{" "}
          {entries.length === 1 ? "student" : "students"}
        </p>
      </header>

      <ul className="divide-y divide-slate-100">
        {visible.map((e, i) => {
          const rank = i + 1;
          const isMe = isCurrentStudent(e, student, myRank, rank);
          const pct =
            e.totalMarks > 0
              ? Math.round((Number(e.score) / e.totalMarks) * 100)
              : 0;
          const medal =
            rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

          return (
            <li
              key={i}
              className={
                isMe ? "bg-teal-50" : rank <= 3 ? "bg-amber-50/30" : ""
              }
            >
              <div className="flex items-center gap-3 px-5 py-3 sm:py-3.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span
                      className={`text-sm font-black ${isMe ? "text-teal-700" : "text-slate-500"}`}
                    >
                      {rank}
                    </span>
                  )}
                </div>

                <Avatar name={e.name} i={i} isMe={isMe} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-sm font-semibold ${isMe ? "text-teal-800" : "text-slate-800"}`}
                    >
                      {e.name || "Anonymous"}
                    </p>
                    {isMe && (
                      <span className="flex-shrink-0 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-black text-white">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 max-w-[140px] flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-1 rounded-full ${barTone(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p
                    className={`text-sm font-black ${
                      rank === 1
                        ? "text-amber-600"
                        : isMe
                          ? "text-teal-700"
                          : "text-slate-900"
                    }`}
                  >
                    {Number(e.score)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    of {e.totalMarks}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">
          <p className="text-xs text-slate-500">
            Showing top {MAX_SHOWN} of {entries.length.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Helpers + small pieces
   ════════════════════════════════════════════════════════════ */

function isCurrentStudent(entry, student, myRank, rank) {
  if (!student) return false;
  // Prefer explicit ID match if backend returns studentId
  if (entry.studentId && student.id && entry.studentId === student.id)
    return true;
  // Fall back to rank match using the API's myRank object (reliable)
  if (myRank && myRank.rank === rank) return true;
  // Last resort — name match (imperfect but sometimes the only signal)
  if (entry.name && student.name && entry.name === student.name) return true;
  return false;
}

function barTone(pct) {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-rose-400";
}

function ListHeader({ label, count }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </h2>
      {count > 0 && (
        <span className="text-[11px] font-semibold text-slate-400">
          {count}
        </span>
      )}
    </div>
  );
}

function Avatar({ name, i, isMe }) {
  const grad = isMe
    ? "from-teal-600 to-teal-700"
    : AVATAR_GRADS[i % AVATAR_GRADS.length];
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-sm font-black text-white shadow-sm`}
    >
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-slate-100" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 px-5 py-4"
          >
            <div className="h-8 w-8 rounded-full bg-slate-100" />
            <div className="h-9 w-9 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-slate-100" />
              <div className="h-2 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-2 w-10 rounded bg-slate-100 " />
          </div>
        ))}
      </div>
    </div>
  );
}
