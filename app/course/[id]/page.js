"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCalendarToday,
  MdPeople,
  MdLock,
  MdCheckCircle,
  MdPlayCircle,
  MdPictureAsPdf,
  MdExpandMore,
  MdExpandLess,
  MdWhatsapp,
  MdStar,
  MdArrowForward,
  MdOndemandVideo,
  MdMenuBook,
  MdTrendingUp,
  MdLoop,
  MdEmojiEvents,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

// ── Day status helpers ────────────────────────────────────────────────────────
function getDayStyle(done, isToday, locked) {
  if (done)
    return {
      ring: "ring-emerald-400/60 bg-emerald-50",
      num: "bg-emerald-500 text-white",
    };
  if (isToday)
    return {
      ring: "ring-teal-400/60 bg-teal-50",
      num: "bg-teal-600 text-white",
    };
  if (locked)
    return {
      ring: "ring-slate-200 bg-slate-50",
      num: "bg-slate-200 text-slate-400",
    };
  return {
    ring: "ring-blue-200/60 bg-blue-50/40",
    num: "bg-blue-500 text-white",
  };
}

// ── Features list ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <MdOndemandVideo size={20} className="text-violet-600" />,
    bg: "bg-violet-50",
    title: "Video Solutions",
    desc: "Every question explained with step-by-step video",
  },
  {
    icon: <MdMenuBook size={20} className="text-rose-600" />,
    bg: "bg-rose-50",
    title: "PDF Notes Daily",
    desc: "Downloadable notes for every day of the course",
  },
  {
    icon: <MdEmojiEvents size={20} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "All India Rank",
    desc: "Know your rank after every test among all students",
  },
  {
    icon: <MdTrendingUp size={20} className="text-teal-600" />,
    bg: "bg-teal-50",
    title: "Performance Analysis",
    desc: "Subject & chapter-wise detailed breakdown",
  },
  {
    icon: <MdLoop size={20} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "Unlimited Reattempts",
    desc: "Attempt each test as many times as you want",
  },
  {
    icon: <MdCalendarToday size={20} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Day-by-Day Plan",
    desc: "Progressive unlock — structured daily learning",
  },
];

const FAQS = [
  {
    q: "Can I attempt tests after the course ends?",
    a: "Yes! All tests remain accessible forever after enrollment. Learn at your own pace.",
  },
  {
    q: "What if I miss a day?",
    a: "Each day unlocks after the previous is completed, so you can go at your own pace without any pressure.",
  },
  {
    q: "Is refund available?",
    a: "Refunds are available within 24 hours of enrollment if you have not accessed any content.",
  },
  {
    q: "Can I use this alongside my coaching?",
    a: "Absolutely! This course is designed to complement your existing preparation, not replace it.",
  },
  {
    q: "Will I get video lectures for every day?",
    a: "Yes — each day has a video lecture, a practice test, and PDF notes for comprehensive preparation.",
  },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      <Navbar exams={[]} />
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="h-72 animate-pulse bg-slate-200" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-white" />
              <div className="h-96 animate-pulse rounded-2xl bg-white" />
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [tab, setTab] = useState("content");
  const [showLogin, setShowLogin] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, [id]);

  async function handleEnroll() {
    const meRes = await fetch("/api/me");
    if (!meRes.ok) {
      setShowLogin(true);
      return;
    }
    const { course } = data;
    if (Number(course.price) === 0) {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const d = await res.json();
      if (!d.success && d.error === "This item is free — no payment needed") {
        toast.success("Enrolled successfully!");
        router.push("/my-courses");
        return;
      }
    }
    setPaying(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
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
            toast.success("Enrolled! 🎉");
            router.push(`/payment/status?orderId=${d.data.orderId}`);
          } else toast.error("Payment failed");
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

  if (loading) return <Skeleton />;
  if (!data)
    return (
      <>
        <Navbar exams={exams} />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-16">
          <div className="text-center">
            <p className="text-4xl">📚</p>
            <p className="mt-3 text-lg font-bold text-slate-700">
              Course not found
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block text-sm font-semibold text-teal-600 underline no-underline"
            >
              Browse Courses
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );

  const { course, enrolled, currentDay, completedDays = [] } = data;
  const isFree = Number(course.price) === 0;
  const totalDays = course.courseTests?.length || 0;
  const completedCnt = completedDays.length;
  const progressPct =
    totalDays > 0 ? Math.round((completedCnt / totalDays) * 100) : 0;
  const enrollCount = course._count?.enrollments || 0;

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            window.location.href = `/course/${id}`;
          }}
        />
      )}
      <Navbar exams={exams} />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* ── HERO ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <Link
              href="/courses"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition hover:text-white/90 no-underline"
            >
              <MdArrowBack size={16} /> All Courses
            </Link>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {course.exam?.name && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                  {course.exam.name}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                {course.durationDays} Days
              </span>
              {isFree && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[12px] font-bold text-white">
                  FREE
                </span>
              )}
              {enrolled && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[12px] font-bold text-slate-900">
                  ✓ Enrolled
                </span>
              )}
            </div>

            <h1 className="mb-3 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              {course.title}
            </h1>

            {course.description && (
              <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                {course.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-white/85">
                <MdCalendarToday size={15} className="text-white/60" />
                {course.durationDays} day program
              </div>
              {enrollCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-white/85">
                  <MdPeople size={15} className="text-white/60" />
                  {enrollCount.toLocaleString("en-IN")} enrolled
                </div>
              )}
              {totalDays > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-white/85">
                  <MdMenuBook size={15} className="text-white/60" />
                  {totalDays} lessons
                </div>
              )}
            </div>

            {/* Progress bar (if enrolled) */}
            {enrolled && totalDays > 0 && (
              <div className="mt-6 max-w-sm">
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-white/80">
                    Your progress
                  </span>
                  <span className="font-bold text-white">
                    {completedCnt}/{totalDays} days
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-2 rounded-full bg-white transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
            {/* ── LEFT ── */}
            <div className="min-w-0 space-y-5">
              {/* Tab switcher */}
              <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {[
                  ["content", "Course Content"],
                  ["features", "Features"],
                  ["faqs", "FAQs"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setTab(v)}
                    className={`flex-1 border-b-2 py-3.5 text-[13px] font-semibold transition ${
                      tab === v
                        ? "border-teal-500 text-teal-700 bg-teal-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* ── CONTENT TAB ── */}
              {tab === "content" && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {totalDays} lessons · {course.durationDays} day program
                    </p>
                    {enrolled && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-teal-500 transition-all duration-700"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-500">
                          {progressPct}%
                        </span>
                      </div>
                    )}
                  </div>

                  {totalDays === 0 && (
                    <div className="px-5 py-12 text-center">
                      <p className="text-3xl">📅</p>
                      <p className="mt-3 text-sm text-slate-500">
                        Course content will be updated soon.
                      </p>
                    </div>
                  )}

                  <div className="divide-y divide-slate-50">
                    {course.courseTests?.map((ct, i) => {
                      const done = completedDays.includes(ct.dayNumber);
                      const isToday =
                        enrolled && ct.dayNumber === (currentDay || 1);
                      const locked =
                        !enrolled ||
                        (ct.dayNumber > (currentDay || 1) && !done);
                      const style = getDayStyle(done, isToday, locked);

                      return (
                        <div
                          key={ct.id}
                          className={`flex gap-4 px-5 py-4 transition ${locked ? "opacity-55" : "hover:bg-slate-50"}`}
                        >
                          {/* Day badge */}
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-2 ${style.ring} ${style.num.includes("bg-") ? "" : ""}`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.num}`}
                            >
                              {done ? (
                                <MdCheckCircle size={16} />
                              ) : locked ? (
                                <MdLock size={14} />
                              ) : (
                                <span className="text-[11px] font-extrabold">
                                  {ct.dayNumber}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-800">
                                Day {ct.dayNumber}
                                {ct.topicName ? ` — ${ct.topicName}` : ""}
                              </p>
                              {isToday && (
                                <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                  TODAY
                                </span>
                              )}
                              {done && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  DONE
                                </span>
                              )}
                            </div>

                            {ct.test && (
                              <p className="text-[12px] text-slate-400">
                                {ct.test.title} ·{" "}
                                {ct.test._count?.testQuestions || 0}q ·{" "}
                                {ct.test.durationMins}min
                              </p>
                            )}

                            {/* Resources */}
                            <div className="mt-2 flex flex-wrap gap-3">
                              {ct.notesUrl && !locked && (
                                <a
                                  href={ct.notesUrl}
                                  target="_blank"
                                  className="flex items-center gap-1 text-[12px] font-semibold text-rose-600 transition hover:text-rose-700 no-underline"
                                >
                                  <MdPictureAsPdf size={14} /> Notes PDF
                                </a>
                              )}
                              {ct.videoUrl && !locked && (
                                <a
                                  href={ct.videoUrl}
                                  target="_blank"
                                  className="flex items-center gap-1 text-[12px] font-semibold text-teal-600 transition hover:text-teal-700 no-underline"
                                >
                                  <MdPlayCircle size={14} /> Video Lecture
                                </a>
                              )}
                              {locked && !enrolled && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <MdLock size={12} /> Enroll to unlock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* CTA for today */}
                          {isToday && !done && (
                            <div className="flex-shrink-0 self-center">
                              <Link
                                href={`/attempt/${ct.test?.id}`}
                                className="rounded-xl bg-teal-600 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-teal-700 no-underline"
                              >
                                Start →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── FEATURES TAB ── */}
              {tab === "features" && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      What's included in this course
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {FEATURES.map((f, i) => (
                      <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${f.bg}`}
                        >
                          {f.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {f.title}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                            {f.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FAQS TAB ── */}
              {tab === "faqs" && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      Frequently Asked Questions
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {FAQS.map((faq, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                        >
                          <span
                            className={`text-sm font-semibold transition ${openFaq === i ? "text-teal-700" : "text-slate-800"}`}
                          >
                            {faq.q}
                          </span>
                          {openFaq === i ? (
                            <MdExpandLess
                              size={20}
                              className="flex-shrink-0 text-teal-600"
                            />
                          ) : (
                            <MdExpandMore
                              size={20}
                              className="flex-shrink-0 text-slate-400"
                            />
                          )}
                        </button>
                        {openFaq === i && (
                          <div className="px-5 pb-4">
                            <p className="text-[13px] leading-relaxed text-slate-600">
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              {/* Purchase card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Price */}
                <div
                  className={`px-5 py-4 ${isFree ? "bg-emerald-50 border-b border-emerald-100" : "bg-slate-50 border-b border-slate-100"}`}
                >
                  {isFree ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-emerald-600">
                        FREE
                      </span>
                      <span className="text-sm text-emerald-600">
                        — No payment
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ₹{Number(course.price)}
                        </span>
                        {course.originalPrice && (
                          <span className="text-base text-slate-400 line-through">
                            ₹{Number(course.originalPrice)}
                          </span>
                        )}
                      </div>
                      {course.originalPrice && (
                        <p className="mt-0.5 text-[12px] font-bold text-emerald-600">
                          {Math.round(
                            (1 -
                              Number(course.price) /
                                Number(course.originalPrice)) *
                              100,
                          )}
                          % OFF
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* CTA */}
                  {enrolled ? (
                    <Link
                      href="/my-courses"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 no-underline"
                    >
                      Continue Learning <MdArrowForward size={18} />
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={paying}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-60 ${
                        isFree
                          ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700"
                          : "bg-teal-600 shadow-teal-600/25 hover:bg-teal-700"
                      }`}
                    >
                      {paying
                        ? "Processing..."
                        : isFree
                          ? "Enroll Free"
                          : `Enroll for ₹${Number(course.price)}`}
                      {!paying && <MdArrowForward size={18} />}
                    </button>
                  )}

                  {/* Includes */}
                  <div className="space-y-2.5 pt-1">
                    {[
                      `${course.durationDays} day structured plan`,
                      "Video solution every question",
                      "PDF notes every day",
                      "All India Rank after each test",
                      "Unlimited reattempts",
                      "Completion certificate",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <MdCheckCircle
                          size={15}
                          className="flex-shrink-0 text-teal-500"
                        />
                        <span className="text-[13px] text-slate-600">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with course: ${course.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-semibold text-slate-400 transition hover:text-green-600 no-underline"
                  >
                    <MdWhatsapp size={15} /> Need help? Chat with us
                  </a>
                </div>
              </div>

              {/* Stats card */}
              {enrollCount > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MdStar size={15} className="text-amber-400" />
                    <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
                      Course Stats
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Students enrolled",
                        value: enrollCount.toLocaleString("en-IN"),
                      },
                      { label: "Total lessons", value: totalDays },
                      {
                        label: "Duration",
                        value: `${course.durationDays} days`,
                      },
                    ].map((s) => (
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
