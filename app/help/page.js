import Link from "next/link";
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from "@/lib/constants";
import {
  MdArrowBack,
  MdWhatsapp,
  MdEmail,
  MdExpandMore,
  MdPayment,
  MdTimer,
  MdReplay,
  MdLeaderboard,
  MdMoneyOff,
  MdHelp,
} from "react-icons/md";

const FAQS = [
  {
    icon: <MdPayment size={18} className="text-violet-600" />,
    bg: "bg-violet-50",
    q: "I paid but the test is not unlocked?",
    a: "Please wait 30 seconds and refresh the page. If it's still locked, WhatsApp us with your order ID and we'll resolve it within minutes.",
  },
  {
    icon: <MdTimer size={18} className="text-red-600" />,
    bg: "bg-red-50",
    q: "My test was auto-submitted unexpectedly?",
    a: "Auto-submit happens when the timer runs out or you switch tabs 3 times. All answers saved up to that point are counted — your score is accurate.",
  },
  {
    icon: <MdReplay size={18} className="text-teal-600" />,
    bg: "bg-teal-50",
    q: "Can I reattempt a test?",
    a: "Yes! Every test supports unlimited reattempts. Each attempt is independently scored and your best score is highlighted on the test page.",
  },
  {
    icon: <MdLeaderboard size={18} className="text-amber-600" />,
    bg: "bg-amber-50",
    q: "How does All India Rank work?",
    a: "After submitting, your score is ranked against every student who attempted the same test. Ranks update in real time as more students attempt.",
  },
  {
    icon: <MdMoneyOff size={18} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    q: "How do I get a refund?",
    a: "We offer full refunds within 24 hours of purchase, provided you have not attempted the test. Contact WhatsApp support with your order ID.",
  },
  {
    icon: <MdHelp size={18} className="text-blue-600" />,
    bg: "bg-blue-50",
    q: "My score looks wrong — what do I do?",
    a: "Each correct answer earns +4 marks and each wrong answer deducts marks as shown on the test page. Skipped questions earn 0. If you believe there's an error, report the specific question from the Solutions page.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600">
        <div className="mx-auto max-w-2xl px-5 py-14 sm:px-6 sm:py-18">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 transition hover:text-white/90 no-underline"
          >
            <MdArrowBack size={16} /> Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Help &amp; Support
          </h1>
          <p className="mt-2 text-sm text-white/75 sm:text-base">
            We're here to help you succeed — usually within minutes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10 pb-16 sm:px-6">
        {/* ── CONTACT CARDS ── */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with IITNEET`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-center transition hover:border-green-400 hover:shadow-md no-underline"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/30 transition group-hover:scale-105">
              <MdWhatsapp size={28} />
            </div>
            <div>
              <p className="text-base font-bold text-green-800">
                WhatsApp Support
              </p>
              <p className="mt-0.5 text-[13px] text-green-600">
                Fastest · Usually within minutes
              </p>
            </div>
            <span className="rounded-full bg-green-500 px-4 py-1.5 text-[12px] font-bold text-white">
              Chat Now →
            </span>
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center transition hover:border-teal-400 hover:shadow-md no-underline"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition group-hover:scale-105">
              <MdEmail size={26} />
            </div>
            <div>
              <p className="text-base font-bold text-teal-800">Email Support</p>
              <p className="mt-0.5 text-[13px] text-teal-600">
                Response within 24 hours
              </p>
            </div>
            <span className="rounded-full bg-teal-600 px-4 py-1.5 text-[12px] font-bold text-white">
              Send Email →
            </span>
          </a>
        </div>

        {/* ── FAQs ── */}
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">
            Frequently Asked Questions
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-500">
            {FAQS.length}
          </span>
        </div>
        <p className="mb-6 text-sm text-slate-400">
          Click any question to expand the answer.
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition open:border-teal-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 marker:content-none">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${faq.bg}`}
                >
                  {faq.icon}
                </div>
                <p className="flex-1 text-sm font-semibold text-slate-800">
                  {faq.q}
                </p>
                <MdExpandMore
                  size={20}
                  className="flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* ── STILL STUCK ── */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-2xl">🤔</p>
          <p className="mt-2 text-base font-bold text-slate-800">
            Still need help?
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Our team typically responds within 10 minutes on WhatsApp.
          </p>
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with IITNEET`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-600 no-underline"
          >
            <MdWhatsapp size={18} /> WhatsApp Us
          </a>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap justify-center gap-5 border-t border-slate-200 pt-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
          >
            Home
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700 no-underline"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
