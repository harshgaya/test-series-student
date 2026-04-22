import Link from "next/link";
import {
  MdArrowBack,
  MdShield,
  MdLock,
  MdVisibility,
  MdStorage,
  MdCookie,
  MdPeople,
  MdVerified,
  MdWhatsapp,
} from "react-icons/md";

const SECTIONS = [
  {
    icon: MdVisibility,
    color: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    title: "Information We Collect",
    body: "When you register, we collect your name, phone number, and exam preferences. As you use the platform, we collect test performance data, scores, time spent, and answers to improve your learning experience and provide accurate analytics.",
  },
  {
    icon: MdShield,
    color: {
      bg: "bg-teal-50",
      icon: "text-teal-600",
      border: "border-teal-100",
    },
    title: "How We Use Your Data",
    body: "Your data is used to personalise your learning experience, recommend relevant tests, and generate performance analytics like All India Rank. We never sell your personal data to third parties. Ever.",
  },
  {
    icon: MdLock,
    color: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
    },
    title: "Data Security",
    body: "All data is stored securely on Supabase servers with encryption at rest. Authentication tokens are signed using industry-standard JWT. Payments are fully handled by Razorpay — we never store card details.",
  },
  {
    icon: MdCookie,
    color: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100",
    },
    title: "Cookies",
    body: "We use a single authentication cookie to keep you logged in across sessions. We do not use advertising cookies, tracking pixels, or any third-party analytics cookies. Your browsing stays private.",
  },
  {
    icon: MdPeople,
    color: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
      border: "border-violet-100",
    },
    title: "Third-Party Services",
    body: "We integrate with Razorpay for secure payment processing and Supabase for database hosting. Both comply with international data protection standards. We may also use an SMS provider to deliver OTPs — no message content is stored.",
  },
  {
    icon: MdVerified,
    color: {
      bg: "bg-rose-50",
      icon: "text-rose-600",
      border: "border-rose-100",
    },
    title: "Your Rights",
    body: "You can request access to, correction of, or deletion of your personal data at any time. To delete your account and all associated data, contact us on WhatsApp. We will process your request within 7 business days.",
  },
  {
    icon: MdStorage,
    color: {
      bg: "bg-slate-50",
      icon: "text-slate-600",
      border: "border-slate-200",
    },
    title: "Data Retention",
    body: "We retain your account data as long as your account is active. Test attempt data is kept for 2 years to support performance trend analysis. When you delete your account, all personally identifiable data is removed within 30 days.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Home
          </Link>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 ring-1 ring-teal-400/30">
              <MdShield size={28} className="text-teal-400" />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-400">
                Legal · IITNEET.in
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Last updated:{" "}
                <strong className="text-slate-300">January 2026</strong>
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "✅ We never sell your data",
              "🔒 End-to-end encrypted",
              "🍪 No ad cookies",
              "🗑️ Delete anytime",
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
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="mb-10 rounded-2xl border border-teal-100 bg-teal-50 p-6">
          <p className="text-sm leading-relaxed text-teal-800">
            At <strong>IITNEET.in</strong>, we take your privacy seriously. This
            policy explains exactly what data we collect, why we collect it, and
            how we protect it. We believe in full transparency — no legalese, no
            surprises.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        0{i + 1}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {s.title}
                      </h2>
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

        {/* Contact box */}
        <div className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-green-900">
                Questions about your privacy?
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Reach out to us anytime. We respond within 24 hours.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hi, I have a question about my privacy on IITNEET"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 no-underline"
            >
              <MdWhatsapp size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Footer links */}
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
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
