import Link from "next/link";
import { SUPPORT_WHATSAPP } from "@/lib/constants";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdWhatsapp,
  MdTimer,
  MdInfo,
} from "react-icons/md";

const SECTIONS = [
  {
    icon: MdCheckCircle,
    color: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
    },
    title: "Eligibility",
    body: "You are eligible for a full refund if you request within 24 hours of purchase AND have not accessed any test, course content, or solutions.",
    tag: { label: "✓ Eligible", style: "bg-emerald-100 text-emerald-700" },
  },
  {
    icon: MdCancel,
    color: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
    title: "Non-Refundable Cases",
    body: "Once you have attempted a test or accessed course content, the purchase becomes non-refundable. Partial refunds are not available.",
    tag: { label: "✗ Not eligible", style: "bg-red-100 text-red-700" },
  },
  {
    icon: MdWhatsapp,
    color: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-100",
    },
    title: "How to Request",
    body: "Contact us on WhatsApp with your order ID within 24 hours of purchase. Our support team will verify your request and confirm eligibility.",
  },
  {
    icon: MdTimer,
    color: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    title: "Processing Time",
    body: "Approved refunds are processed within 5–7 business days and credited back to the original payment method (UPI, card, or bank account).",
  },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Home
          </Link>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <MdInfo size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                Legal · IITNEET.in
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Refund Policy
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Last updated:{" "}
                <strong className="text-slate-300">January 2026</strong>
              </p>
            </div>
          </div>

          {/* Quick summary */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "✅ 24-hour window",
              "🚫 Post-access = no refund",
              "⏱️ 5–7 days processing",
              "💬 WhatsApp support",
            ].map((p) => (
              <span
                key={p}
                className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/80 ring-1 ring-white/10"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm leading-relaxed text-emerald-800">
            We want you to be completely satisfied with your purchase on{" "}
            <strong>IITNEET.in</strong>. If you're not happy, here's exactly how
            our refund process works — no hidden conditions.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`rounded-2xl border bg-white p-6 transition hover:shadow-md ${s.color.border}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${s.color.bg}`}
                  >
                    <Icon size={20} className={s.color.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {s.title}
                      </h2>
                      {s.tag && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.tag.style}`}
                        >
                          {s.tag.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {s.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-5 text-sm font-bold text-slate-800">
            Refund Timeline
          </h3>
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
            {[
              {
                time: "0–24 hrs",
                label: "Submit refund request via WhatsApp",
                color: "bg-emerald-500",
              },
              {
                time: "24–48 hrs",
                label: "Our team verifies access & eligibility",
                color: "bg-teal-500",
              },
              {
                time: "3–5 days",
                label: "Refund approved and initiated",
                color: "bg-blue-500",
              },
              {
                time: "5–7 days",
                label: "Amount credited to original payment method",
                color: "bg-violet-500",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`absolute left-0 mt-1 h-4 w-4 rounded-full ${step.color} ring-2 ring-white`}
                  style={{ top: `${i * 40 + 4}px` }}
                />
                <div className="ml-2">
                  <p className="text-[11px] font-bold text-slate-400">
                    {step.time}
                  </p>
                  <p className="text-sm text-slate-700">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-green-900">
                Need to request a refund?
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Send your order ID on WhatsApp — we respond within minutes.
              </p>
            </div>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I want to request a refund. My order ID is:`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 no-underline"
            >
              <MdWhatsapp size={18} /> WhatsApp Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition hover:text-teal-700 no-underline"
          >
            <MdArrowBack size={16} /> Back to Home
          </Link>
          <div className="flex gap-5">
            <Link
              href="/terms"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
