"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdCheckCircle, MdWarning } from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);

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
    try {
      const res = await fetch("/api/payment/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const d = await res.json();
      if (d.success) setStatus(d.data.status);
    } catch {}
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "48px 32px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        {status === "SUCCESS" ? (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#F0FDF4",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
              }}
            >
              <MdCheckCircle style={{ color: "#16A34A" }} />
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 8,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Payment Successful! 🎉
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "#6B7280",
                marginBottom: 28,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Your purchase is confirmed. You can now access your test or
              course.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: 14,
                background: "#0D9488",
                color: "white",
                borderRadius: 99,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Go to Dashboard →
            </Link>
          </>
        ) : status === "checking" || status === "PENDING" ? (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                border: "4px solid #CCFBF1",
                borderTop: "4px solid #0D9488",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 8,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Verifying Payment...
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 24,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Please wait. Do not close this page.
            </p>
            <button
              onClick={checkStatus}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: 12,
                background: "white",
                color: "#0D9488",
                border: "2px solid #0D9488",
                borderRadius: 99,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 12,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Check Now
            </button>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Payment not reflecting. Order ID: ${orderId}`}
              target="_blank"
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                display: "block",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Contact WhatsApp Support
            </a>
          </>
        ) : (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#FEF2F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
              }}
            >
              <MdWarning style={{ color: "#DC2626" }} />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#DC2626",
                marginBottom: 8,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Payment Failed
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 24,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Your payment could not be processed. No amount was charged.
            </p>
            <Link
              href="/browse"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: 14,
                background: "#0D9488",
                color: "white",
                borderRadius: 99,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: 12,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Try Again
            </Link>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              style={{
                fontSize: 13,
                color: "#0D9488",
                display: "block",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Need help? WhatsApp us
            </a>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
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
              border: "3px solid #CCFBF1",
              borderTop: "3px solid #0D9488",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <PaymentStatus />
    </Suspense>
  );
}
