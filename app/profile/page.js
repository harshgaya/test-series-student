"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import {
  MdSave,
  MdPerson,
  MdPhone,
  MdCalendarToday,
  MdCheckCircle,
} from "react-icons/md";

export default function ProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [targetYear, setTargetYear] = useState("2026");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/me")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/exams")
        .then((r) => r.json())
        .catch(() => ({ success: false })),
    ]).then(([me, ex]) => {
      if (ex.success) setExams(ex.data);
      if (me?.success) {
        const p = me.data.student;
        setStudent(p);
        setName(p.name || "");
        setTargetExam(String(p.targetExamId || ""));
        setTargetYear(String(p.targetYear || 2026));

        const year = p.targetYear || 2026;
        const examDate = new Date(`${year}-05-01`);
        const diff = Math.ceil((examDate - new Date()) / 86400000);
        setDaysLeft(diff > 0 ? diff : null);
      }
    });
  }, []);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetExamId: targetExam || null,
          targetYear: parseInt(targetYear),
        }),
      });
      const d = await res.json();
      if (d.success) {
        const updated = {
          ...student,
          name,
          targetExamId: targetExam,
          targetYear: parseInt(targetYear),
        };
        localStorage.setItem("iitneet_student", JSON.stringify(updated));
        setStudent(updated);
        setSaved(true);
        toast.success("Profile updated!");
        setTimeout(() => setSaved(false), 3000);
      } else toast.error(d.error);
    } finally {
      setLoading(false);
    }
  }

  const initials = name?.[0]?.toUpperCase() || "?";
  const examName = exams.find((e) => String(e.id) === targetExam)?.name;
  const GRAD_COLORS = [
    "from-teal-500 to-cyan-600",
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-500",
  ];
  const avatarGrad =
    GRAD_COLORS[(name?.charCodeAt(0) || 0) % GRAD_COLORS.length];

  return (
    <>
      <Navbar exams={exams} />
      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGrad} text-2xl font-extrabold text-white shadow-lg`}
              >
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                  {name || "My Profile"}
                </h1>
                <p className="mt-0.5 text-sm text-white/70">
                  {student?.phone || ""}
                </p>
                {examName && (
                  <span className="mt-1.5 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    {examName} · {targetYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 pb-16">
          {/* ── DAYS TO EXAM CARD ── */}
          {daysLeft && (
            <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg shadow-teal-600/20">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                    Days to Exam
                  </p>
                  <p className="mt-0.5 text-5xl font-extrabold leading-none text-white">
                    {daysLeft}
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    {examName || "Target exam"} · {targetYear}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl">🎯</p>
                  <p className="mt-1 text-[11px] text-white/50">Keep going!</p>
                </div>
              </div>
              {/* mini bar */}
              <div className="bg-black/10 px-6 pb-4">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-1 rounded-full bg-white/60"
                    style={{
                      width: `${Math.min(100, Math.round((1 - daysLeft / 365) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE FORM ── */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-bold text-slate-800">Edit Profile</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">
                  Full Name *
                </label>
                <div className="relative">
                  <MdPerson
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              {/* Phone (read-only) */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">
                  Mobile Number
                </label>
                <div className="relative">
                  <MdPhone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={student?.phone || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Phone number cannot be changed
                </p>
              </div>

              {/* Target exam */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">
                  Preparing for
                </label>
                <div className="flex flex-wrap gap-2">
                  {exams.map((e) => {
                    const active = targetExam === String(e.id);
                    return (
                      <button
                        key={e.id}
                        onClick={() => setTargetExam(String(e.id))}
                        className={`rounded-full border-2 px-4 py-2 text-[13px] font-semibold transition ${
                          active
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/40"
                        }`}
                      >
                        {e.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target year */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">
                  Target Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2025", "2026", "2027"].map((y) => (
                    <button
                      key={y}
                      onClick={() => setTargetYear(y)}
                      className={`rounded-xl border-2 py-3 text-sm font-bold transition ${
                        targetYear === y
                          ? "border-teal-500 bg-teal-600 text-white shadow-md shadow-teal-600/25"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-60 ${
                  saved
                    ? "bg-emerald-600 shadow-emerald-600/25"
                    : "bg-teal-600 shadow-teal-600/25 hover:bg-teal-700"
                }`}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <MdCheckCircle size={18} /> Saved!
                  </>
                ) : (
                  <>
                    <MdSave size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account info */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-slate-400">
              Account Info
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Member since",
                  value: student?.createdAt
                    ? new Date(student.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                },
                {
                  label: "Student ID",
                  value: student?.id ? `#${student.id}` : "—",
                },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-[13px] text-slate-500">{r.label}</span>
                  <span className="text-[13px] font-semibold text-slate-700">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer exams={exams} />
    </>
  );
}
