import Link from "next/link";
import {
  MdArrowBack,
  MdGavel,
  MdCheckCircle,
  MdDevices,
  MdPerson,
  MdPayment,
  MdRefresh,
  MdArticle,
  MdUpdate,
  MdWhatsapp,
} from "react-icons/md";

const SECTIONS = [
  {
    icon: MdCheckCircle,
    color: {
      bg: "bg-teal-50",
      icon: "text-teal-600",
      border: "border-teal-100",
    },
    title: "Acceptance of Terms",
    body: "By accessing or using IITNEET.in, you confirm that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to any part of these terms, please discontinue use of the platform immediately.",
  },
  {
    icon: MdDevices,
    color: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    title: "Use of Platform",
    body: "IITNEET.in is an educational platform designed for NEET UG, JEE Main, JEE Advanced, and EAMCET preparation. You agree to use the platform solely for lawful, personal, and educational purposes. Scraping, copying, distributing, or reselling any content is strictly prohibited.",
  },
  {
    icon: MdPerson,
    color: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
      border: "border-violet-100",
    },
    title: "Account Responsibility",
    body: "Each student is permitted one account only. You are solely responsible for maintaining the confidentiality of your login credentials. Any activity under your account is your responsibility. If you suspect unauthorised access, contact us immediately via WhatsApp.",
  },
  {
    icon: MdPayment,
    color: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
    },
    title: "Payments & Billing",
    body: "All payments are processed securely through Razorpay. Prices are listed in Indian Rupees (INR) and are inclusive of applicable GST. We do not store card details. For any billing disputes, contact support within 48 hours of the transaction.",
  },
  {
    icon: MdRefresh,
    color: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100",
    },
    title: "Refund Policy",
    body: "You may request a full refund within 24 hours of purchase, provided no content (tests, solutions, or course material) has been accessed. After 24 hours or once content is accessed, no refund will be issued. To raise a refund request, contact us via WhatsApp with your payment reference.",
  },
  {
    icon: MdArticle,
    color: {
      bg: "bg-rose-50",
      icon: "text-rose-600",
      border: "border-rose-100",
    },
    title: "Intellectual Property",
    body: "All content on IITNEET.in — including questions, answer explanations, video solutions, course material, and test series — is the intellectual property of IITNEET. Unauthorised reproduction, distribution, or commercial use of any content is a violation of copyright law and will be prosecuted.",
  },
  {
    icon: MdDevices,
    color: {
      bg: "bg-cyan-50",
      icon: "text-cyan-600",
      border: "border-cyan-100",
    },
    title: "Fair Use & Test Integrity",
    body: "Our platform monitors tab-switching, copy-paste actions, and screen activity during live tests to maintain exam integrity. Any attempt to cheat, share OTPs, or manipulate rankings will result in immediate account suspension without refund.",
  },
  {
    icon: MdUpdate,
    color: {
      bg: "bg-slate-50",
      icon: "text-slate-600",
      border: "border-slate-200",
    },
    title: "Changes to Terms",
    body: "We reserve the right to update these Terms of Use at any time. Changes will be posted on this page with a revised date. Continued use of the platform after changes constitutes your acceptance of the updated terms. We recommend reviewing this page periodically.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Home
          </Link>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
              <MdGavel size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
                Legal · IITNEET.in
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Terms of Use
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
              "📚 Educational use only",
              "💳 Razorpay secured payments",
              "🔄 24-hour refund window",
              "⚖️ IP protected content",
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
        <div className="mb-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <p className="text-sm leading-relaxed text-indigo-900">
            These Terms of Use govern your access to and use of{" "}
            <strong>IITNEET.in</strong>. Please read them carefully before using
            the platform. These terms are a legal agreement between you and
            IITNEET. By registering or using our services, you agree to be bound
            by these terms.
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
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {String(i + 1).padStart(2, "0")}
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

        {/* Governing law */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-2 text-base font-bold text-slate-800">
            Governing Law
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes arising shall be subject to the
            exclusive jurisdiction of courts in Hyderabad, Telangana.
          </p>
        </div>

        {/* Contact box */}
        <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-green-900">
                Have a question about these terms?
              </h3>
              <p className="mt-1 text-sm text-green-700">
                We're happy to clarify. Contact us anytime on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hi, I have a question about IITNEET Terms of Use"
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
              href="/privacy"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
            >
              Privacy Policy
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
