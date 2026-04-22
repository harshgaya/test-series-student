"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  MdClose,
  MdArrowBack,
  MdArrowForward,
  MdVerified,
} from "react-icons/md";
import { OTP_RESEND_SECONDS } from "@/lib/constants";

const STEPS = ["phone", "otp", "register"];

function StepBar({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex gap-1 px-6 pt-1 pb-4">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= idx ? "bg-white" : "bg-white/25"}`}
        />
      ))}
    </div>
  );
}

function OtpBox({ value, inputRef, onChange, onKeyDown }) {
  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={`h-12 w-full rounded-xl border-2 text-center text-xl font-extrabold tabular-nums outline-none transition-all font-mono ${
        value
          ? "border-teal-500 bg-teal-50 text-teal-800"
          : "border-slate-200 bg-white text-slate-800 focus:border-teal-400 focus:bg-teal-50/30"
      }`}
    />
  );
}

export default function LoginModal({ onClose, onSuccess }) {
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
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
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
      localStorage.setItem(
        "iitneet_student",
        JSON.stringify(data.data.student),
      );
      toast.success("Welcome back! 👋");
      onSuccess?.(data.data.student);
      onClose?.();
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
      toast.error("Select your target exam");
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
      localStorage.setItem(
        "iitneet_student",
        JSON.stringify(data.data.student),
      );
      toast.success("Welcome to IITNEET! 🎉");
      onSuccess?.(data.data.student);
      onClose?.();
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

  const fallbackExams = [
    { id: "neet", name: "NEET UG" },
    { id: "jee", name: "JEE Main" },
    { id: "eam", name: "EAMCET" },
  ];
  const examList = exams.length > 0 ? exams : fallbackExams;

  const TITLES = {
    phone: {
      title: "Login / Register",
      sub: "Enter your mobile number to continue",
    },
    otp: { title: "Verify OTP", sub: `Sent to +91 ${phone}` },
    register: { title: "Complete Profile", sub: "Just one more step!" },
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 px-6 pb-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {step !== "phone" && (
                <button
                  onClick={() => setStep(step === "otp" ? "phone" : "otp")}
                  className="mb-2 flex items-center gap-1 text-[12px] font-semibold text-white/65 transition hover:text-white/90"
                >
                  <MdArrowBack size={14} /> Back
                </button>
              )}
              <p className="text-lg font-extrabold text-white">
                {TITLES[step].title}
              </p>
              <p className="mt-0.5 text-[12px] text-white/70">
                {TITLES[step].sub}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <MdClose size={18} />
            </button>
          </div>
          <StepBar current={step} />
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── PHONE ── */}
          {step === "phone" && (
            <div className="space-y-4">
              <div className="flex">
                <span className="flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder="9876 543 210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  className="flex-1 rounded-r-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium tracking-wider text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP <MdArrowForward size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                By continuing you agree to our Terms &amp; Privacy Policy
              </p>
            </div>
          )}

          {/* ── OTP ── */}
          {step === "otp" && (
            <div className="space-y-4">
              {/* 6 boxes */}
              <div className="grid grid-cols-6 gap-1.5">
                {otp.map((d, i) => (
                  <OtpBox
                    key={i}
                    value={d}
                    inputRef={(el) => (otpRefs.current[i] = el)}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !d && i > 0)
                        otpRefs.current[i - 1]?.focus();
                    }}
                  />
                ))}
              </div>

              <p className="text-center text-[11px] text-slate-400">
                Dev mode: use{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  123456
                </code>
              </p>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.join("").length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP <MdArrowForward size={16} />
                  </>
                )}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-[12px] text-slate-400">
                    Resend in{" "}
                    <strong className="font-bold text-teal-600">
                      {timer}s
                    </strong>
                  </p>
                ) : (
                  <button
                    onClick={handleSendOTP}
                    className="text-[12px] font-semibold text-teal-600 transition hover:text-teal-700"
                  >
                    ↩ Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {step === "register" && (
            <div className="space-y-4">
              {/* Verified badge */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <MdVerified size={16} className="text-emerald-600" />
                <span className="text-[12px] font-semibold text-emerald-700">
                  +91 {phone} verified
                </span>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Priya Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400"
                />
              </div>

              {/* Exam */}
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                  Preparing for
                </label>
                <div className="flex flex-wrap gap-2">
                  {examList.map((e) => {
                    const active = targetExam === String(e.id);
                    return (
                      <button
                        key={e.id}
                        onClick={() => setTargetExam(String(e.id))}
                        className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition ${
                          active
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
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
                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                  Target Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2025", "2026", "2027"].map((y) => (
                    <button
                      key={y}
                      onClick={() => setTargetYear(y)}
                      className={`rounded-xl border py-2.5 text-sm font-bold transition ${
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

              <button
                onClick={handleRegister}
                disabled={loading || !name.trim() || !targetExam}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                    Creating account...
                  </>
                ) : (
                  "Start Preparing 🚀"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
