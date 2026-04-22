"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdCheckCircle,
  MdWarning,
  MdWhatsapp,
  MdRefresh,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

function Spinner({ size = "md" }) {
  const s = size === "lg" ? "h-14 w-14 border-4" : "h-10 w-10 border-3";
  return (
    <div
      className={`animate-spin rounded-full border-teal-100 border-t-teal-600 ${s}`}
    />
  );
}

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    checkStatus();
    const interval = setInterval(() => {
      setAttempts((a) => {
        if (a >= 12) {
          clearInterval(interval);
          return a;
        }
        checkStatus();
        return a + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  async function checkStatus() {
    setChecking(true);
    try {
      const res = await fetch("/api/payment/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const d = await res.json();
      if (d.success) setStatus(d.data.status);
    } catch {
    } finally {
      setChecking(false);
    }
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (status === "SUCCESS")
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10">
          {/* Green top band */}
          <div className="bg-emerald-500 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <MdCheckCircle size={36} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              Payment Successful!
            </h1>
            <p className="mt-1 text-sm text-emerald-100">
              Your purchase is confirmed 🎉
            </p>
          </div>

          <div className="p-6">
            <p className="mb-1 text-center text-sm text-slate-500">Order ID</p>
            <p className="mb-6 text-center font-mono text-xs font-semibold text-slate-700 break-all">
              {orderId}
            </p>

            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-center text-[13px] text-emerald-700">
                Your test / course is now unlocked. Go to your dashboard to
                start.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 no-underline"
            >
              Go to Dashboard →
            </Link>

            <Link
              href="/browse"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 no-underline"
            >
              Browse More Tests
            </Link>
          </div>
        </div>
      </div>
    );

  // ── FAILED ───────────────────────────────────────────────────────────────────
  if (status !== "checking" && status !== "PENDING")
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10">
          {/* Red top band */}
          <div className="bg-red-500 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              <MdWarning size={36} className="text-red-500" />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              Payment Failed
            </h1>
            <p className="mt-1 text-sm text-red-100">
              Your card was not charged
            </p>
          </div>

          <div className="p-6">
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-center text-[13px] text-red-700">
                Something went wrong during payment. Please try again or contact
                support.
              </p>
            </div>

            <Link
              href="/browse"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 no-underline"
            >
              Try Again
            </Link>

            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Payment failed. Order ID: ${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 no-underline"
            >
              <MdWhatsapp size={18} /> WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    );

  // ── CHECKING / PENDING ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10">
        {/* Teal top band */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Spinner size="lg" />
          </div>
          <h1 className="text-xl font-extrabold text-white">
            Verifying Payment
          </h1>
          <p className="mt-1 text-sm text-teal-100">
            Please wait — do not close this page
          </p>
        </div>

        <div className="p-6">
          {/* Pulse animation dots */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
            <p className="text-center text-[13px] text-teal-700">
              {attempts < 3
                ? "Confirming with your bank..."
                : attempts < 8
                  ? "Almost there, hang tight..."
                  : "Taking longer than usual. You can check manually below."}
            </p>
          </div>

          {/* Check now button */}
          <button
            onClick={checkStatus}
            disabled={checking}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
          >
            {checking ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />{" "}
                Checking...
              </>
            ) : (
              <>
                <MdRefresh size={18} /> Check Status Now
              </>
            )}
          </button>

          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Payment not reflecting. Order ID: ${orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 no-underline"
          >
            <MdWhatsapp size={16} /> Contact Support
          </a>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Order ID:{" "}
            <span className="font-mono">{orderId?.slice(0, 16)}...</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
        </div>
      }
    >
      <PaymentStatus />
    </Suspense>
  );
}
