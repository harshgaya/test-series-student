"use client";
import Link from "next/link";
import { MdWhatsapp, MdEmail, MdArrowForward } from "react-icons/md";
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from "@/lib/constants";

const QUICK_LINKS = [
  { label: "Browse Tests", href: "/browse" },
  { label: "Crash Courses", href: "/courses" },
  { label: "Free Mock Test", href: "/browse?type=FULL_MOCK&free=true" },
  { label: "Previous Year Papers", href: "/browse?type=PYP" },
  { label: "Question Bank", href: "/question-bank" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

const FALLBACK_EXAMS = [
  { id: "neet", name: "NEET UG", slug: "neet-ug" },
  { id: "jee", name: "JEE Main", slug: "jee-main" },
  { id: "jee2", name: "JEE Advanced", slug: "jee-advanced" },
  { id: "eam", name: "EAMCET", slug: "eamcet" },
];

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block text-[13px] text-white/50 transition hover:text-white/90 no-underline"
    >
      {children}
    </Link>
  );
}

function FooterHeading({ children }) {
  return (
    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
      {children}
    </p>
  );
}

export default function Footer({ exams = [] }) {
  const examList = exams.length > 0 ? exams : FALLBACK_EXAMS;

  return (
    <footer className="bg-slate-950 text-white">
      {/* CTA strip */}
      <div className="border-b border-white/5 bg-gradient-to-r from-teal-900/40 to-cyan-900/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold text-white">
              Start practicing for free today
            </p>
            <p className="text-[12px] text-white/50">
              No registration needed · 50,000+ questions
            </p>
          </div>
          <Link
            href="/browse?type=FULL_MOCK&free=true"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-teal-500 no-underline"
          >
            Try Free Mock Test <MdArrowForward size={15} />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-0 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2.5 no-underline"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 shadow-lg shadow-teal-900/50">
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
              <span className="text-lg font-extrabold tracking-tight text-white">
                IIT<span className="text-teal-400">NEET</span>
              </span>
            </Link>

            <p className="mb-5 max-w-[200px] text-[13px] leading-relaxed text-white/45">
              India's most trusted platform for NEET, JEE &amp; EAMCET mock test
              preparation.
            </p>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { val: "50K+", label: "Questions" },
                { val: "7K+", label: "Top Rankers" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 text-center"
                >
                  <p className="text-base font-extrabold text-teal-400">
                    {s.val}
                  </p>
                  <p className="text-[10px] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-green-400 transition hover:bg-green-500/20 hover:text-green-300 no-underline"
              >
                <MdWhatsapp size={18} />
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-teal-400 transition hover:bg-teal-500/20 hover:text-teal-300 no-underline"
              >
                <MdEmail size={17} />
              </a>
            </div>
          </div>

          {/* Exams */}
          <div>
            <FooterHeading>Exams</FooterHeading>
            <div className="space-y-3">
              {examList.map((e) => (
                <FooterLink key={e.id} href={`/exam/${e.slug}`}>
                  {e.name}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <div className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <FooterLink key={l.label} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <FooterHeading>Support</FooterHeading>
            <div className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <FooterLink key={l.label} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </div>

            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with IITNEET`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-2 rounded-xl border border-green-800/40 bg-green-900/20 px-4 py-2.5 text-[13px] font-semibold text-green-400 transition hover:bg-green-900/40 hover:text-green-300 no-underline"
            >
              <MdWhatsapp size={16} /> WhatsApp Support
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 py-6">
          <p className="text-[12px] text-white/30">
            © {new Date().getFullYear()} iitneet.in · All rights reserved
          </p>
          <p className="text-[12px] text-white/30">
            Made with ❤️ for NEET &amp; JEE aspirants across India
          </p>
        </div>
      </div>
    </footer>
  );
}
