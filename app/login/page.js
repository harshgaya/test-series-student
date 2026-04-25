"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { MdArrowForward, MdArrowBack, MdVerified } from "react-icons/md";
import { OTP_RESEND_SECONDS } from "@/lib/constants";

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ dark = false }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2L18 6V10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10V6L10 2Z"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M7 10L9 12L13 8"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={`font-extrabold tracking-tight text-lg ${dark ? "text-slate-900" : "text-white"}`}
      >
        IIT
        <span className={dark ? "text-teal-600" : "text-teal-300"}>NEET</span>
      </span>
    </Link>
  );
}

// ── Step progress bar ─────────────────────────────────────────────────────────
function StepBar({ steps, current }) {
  const idx = steps.indexOf(current);
  return (
    <div className="flex gap-1.5 mb-8">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i <= idx ? "bg-teal-500" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Social proof item ─────────────────────────────────────────────────────────
function Proof({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <p className="text-sm font-medium text-white/85">{text}</p>
    </div>
  );
}

// ── OTP Input box ─────────────────────────────────────────────────────────────
function OtpBox({ value, inputRef, onChange, onKeyDown, filled }) {
  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={`h-14 w-full rounded-xl border-2 text-center text-2xl font-extrabold tracking-widest outline-none transition-all duration-150 font-mono ${
        filled
          ? "border-teal-500 bg-teal-50 text-teal-800"
          : "border-slate-200 bg-white text-slate-800 focus:border-teal-400 focus:bg-teal-50/30"
      }`}
    />
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [targetYear, setTargetYear] = useState("2026");
  const [exams, setExams] = useState([]);
  const otpRefs = useRef([]);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExams(d.data);
      });
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  async function handleSendOTP() {
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid 10-digit number");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setStep("otp");
      setTimer(OTP_RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
      toast.success("OTP sent!");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpStr }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Invalid OTP");
        return;
      }
      if (data.data.newStudent) {
        setStep("register");
        return;
      }

      toast.success("Welcome back! 👋");
      window.location.href = redirect;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (!targetExam) {
      toast.error("Select your exam");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          targetExam,
          targetYear: parseInt(targetYear),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }

      toast.success("Welcome to IITNEET! 🎉");
      window.location.href = redirect;
    } finally {
      setLoading(false);
    }
  }

  function handleOtpInput(i, v) {
    if (v.length > 1) {
      const digits = v.replace(/\D/g, "").slice(0, 6).split("");
      const n = [...otp];
      digits.forEach((d, j) => {
        if (i + j < 6) n[i + j] = d;
      });
      setOtp(n);
      otpRefs.current[Math.min(i + digits.length, 5)]?.focus();
      return;
    }
    if (!/^\d*$/.test(v)) return;
    const n = [...otp];
    n[i] = v;
    setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
    if (v && i === 5) setTimeout(handleVerifyOTP, 120);
  }

  const STEPS = ["phone", "otp", "register"];
  const fallbackExams = [
    { id: "neet", name: "NEET UG" },
    { id: "jee", name: "JEE Main" },
    { id: "eamcet", name: "EAMCET" },
  ];
  const examList = exams.length > 0 ? exams : fallbackExams;

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT PANEL ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 px-10 py-10 lg:flex lg:w-[440px] xl:w-[480px]">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-10 bottom-32 h-32 w-32 rounded-full bg-teal-500/30" />

        {/* Logo */}
        <Logo />

        {/* Main copy */}
        <div className="relative">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
            India's #1 Platform
          </p>
          <h2 className="mb-5 text-3xl font-extrabold leading-snug tracking-tight text-white xl:text-4xl">
            Crack NEET &amp; JEE
            <br />
            <span className="text-teal-200">with Confidence</span>
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-white/70 max-w-xs">
            Join 7,000+ toppers who practice daily on India's most trusted mock
            test platform.
          </p>

          <div className="space-y-4">
            <Proof icon="🏆" text="7,000+ students got top ranks" />
            <Proof icon="📝" text="50,000+ questions with solutions" />
            <Proof icon="📊" text="All India Rank after every test" />
            <Proof icon="🔒" text="Real exam environment" />
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="relative flex items-center gap-6">
          <div className="text-center">
            <p className="text-xl font-extrabold text-white">7K+</p>
            <p className="text-[11px] text-white/60">Top Rankers</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-xl font-extrabold text-white">50K+</p>
            <p className="text-[11px] text-white/60">Questions</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-xl font-extrabold text-white">Free</p>
            <p className="text-[11px] text-white/60">To Start</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Logo dark />
          </div>

          {/* Step bar */}
          <StepBar steps={STEPS} current={step} />

          {/* ── STEP 1: PHONE ── */}
          {step === "phone" && (
            <div>
              <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back 👋
              </h1>
              <p className="mb-8 text-sm text-slate-500">
                Enter your mobile number to continue
              </p>

              <div className="mb-1.5">
                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="flex items-center gap-1.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    className="flex-1 rounded-r-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 tracking-wider"
                  />
                </div>
              </div>
              <p className="mb-8 text-[12px] text-slate-400">
                OTP will be sent to this number
              </p>

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Continue <MdArrowForward size={18} />
                  </>
                )}
              </button>

              <p className="mt-6 text-center text-[12px] leading-relaxed text-slate-400">
                By continuing you agree to our{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-teal-600 hover:underline"
                >
                  Terms
                </Link>
                {" & "}
                <Link
                  href="/privacy"
                  className="font-semibold text-teal-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <div>
              <button
                onClick={() => setStep("phone")}
                className="mb-5 flex items-center gap-1 text-[13px] font-semibold text-slate-500 transition hover:text-slate-700"
              >
                <MdArrowBack size={16} /> Back
              </button>

              <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Enter OTP 🔐
              </h1>
              <p className="mb-8 text-sm text-slate-500">
                Sent to <strong className="text-slate-800">+91 {phone}</strong>
                <button
                  onClick={() => setStep("phone")}
                  className="ml-2 text-[12px] font-semibold text-teal-600 hover:underline"
                >
                  Change
                </button>
              </p>

              {/* 6 OTP boxes */}
              <div className="mb-3 grid grid-cols-6 gap-2">
                {otp.map((d, i) => (
                  <OtpBox
                    key={i}
                    value={d}
                    filled={!!d}
                    inputRef={(el) => (otpRefs.current[i] = el)}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !d && i > 0)
                        otpRefs.current[i - 1]?.focus();
                    }}
                  />
                ))}
              </div>

              {/* Dev hint */}
              <p className="mb-8 text-center text-[12px] text-slate-400">
                Dev mode:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  123456
                </code>
              </p>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.join("").length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify OTP <MdArrowForward size={18} />
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                {timer > 0 ? (
                  <p className="text-[13px] text-slate-400">
                    Resend in{" "}
                    <strong className="font-bold text-teal-600">
                      {timer}s
                    </strong>
                  </p>
                ) : (
                  <button
                    onClick={handleSendOTP}
                    className="text-[13px] font-semibold text-teal-600 transition hover:text-teal-700"
                  >
                    ↩ Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: REGISTER ── */}
          {step === "register" && (
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                <MdVerified size={14} className="text-emerald-600" />
                <span className="text-[12px] font-semibold text-emerald-700">
                  +91 {phone} verified
                </span>
              </div>

              <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Complete Profile 🚀
              </h1>
              <p className="mb-8 text-sm text-slate-500">
                Just one step to get started!
              </p>

              {/* Name */}
              <div className="mb-5">
                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Priya Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Exam */}
              <div className="mb-5">
                <label className="mb-3 block text-[13px] font-semibold text-slate-700">
                  Preparing for *
                </label>
                <div className="flex flex-wrap gap-2">
                  {examList.map((e) => {
                    const active = targetExam === String(e.id);
                    return (
                      <button
                        key={e.id}
                        onClick={() => setTargetExam(String(e.id))}
                        className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                          active
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50/50"
                        }`}
                      >
                        {e.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target year */}
              <div className="mb-8">
                <label className="mb-3 block text-[13px] font-semibold text-slate-700">
                  Target Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2025", "2026", "2027"].map((y) => {
                    const active = targetYear === y;
                    return (
                      <button
                        key={y}
                        onClick={() => setTargetYear(y)}
                        className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                          active
                            ? "border-teal-500 bg-teal-600 text-white shadow-md shadow-teal-600/25"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !name.trim() || !targetExam}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : <>Start Preparing 🚀</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-teal-100 border-t-teal-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
