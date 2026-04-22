"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdMenu,
  MdClose,
  MdKeyboardArrowDown,
  MdLogout,
  MdDashboard,
  MdPerson,
  MdAnalytics,
  MdBookmark,
  MdLeaderboard,
  MdWhatsapp,
  MdArrowForward,
} from "react-icons/md";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Browse", href: "/browse" },
  { label: "Courses", href: "/courses" },
];

const USER_MENU = [
  { href: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { href: "/profile", label: "Profile", icon: MdPerson },
  { href: "/analytics", label: "Analytics", icon: MdAnalytics },
  { href: "/bookmarks", label: "Bookmarks", icon: MdBookmark },
  { href: "/leaderboard", label: "Leaderboard", icon: MdLeaderboard },
];

function NavLink({ href, children, onClick }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-all whitespace-nowrap no-underline ${
        active
          ? "bg-teal-50 font-semibold text-teal-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar({ exams = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [student, setStudent] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const dropRef = useRef(null);

  // Read student from localStorage
  useEffect(() => {
    const s = localStorage.getItem("iitneet_student");
    if (s)
      try {
        setStudent(JSON.parse(s));
      } catch {}
  }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("iitneet_student");
    setStudent(null);
    setUserOpen(false);
    setMenuOpen(false);
    router.push("/");
  }

  // Hide on attempt page
  if (pathname?.startsWith("/attempt/")) return null;

  return (
    <>
      {/* ── HEADER ── */}
      <header
        className={`fixed left-0 right-0 top-0 z-[100] h-16 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md"
            : "border-b border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="mr-6 flex flex-shrink-0 items-center gap-2.5 no-underline"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 shadow-sm">
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
            <span className="text-[17px] font-extrabold tracking-tight text-slate-900">
              IIT<span className="text-teal-600">NEET</span>
            </span>
          </Link>

          {/* Desktop nav — HIDDEN on mobile */}
          <nav className="hidden items-center gap-1 lg:flex">
            {exams.slice(0, 4).map((exam) => (
              <NavLink key={exam.id} href={`/exam/${exam.slug}`}>
                {exam.name}
              </NavLink>
            ))}
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* WhatsApp — desktop only */}
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600 transition hover:bg-green-100 lg:flex no-underline"
              title="WhatsApp Support"
            >
              <MdWhatsapp size={18} />
            </a>

            {student ? (
              /* ── User dropdown ── */
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 transition-all ${
                    userOpen
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-[12px] font-bold text-white">
                    {student.name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <span className="hidden text-[13px] font-semibold text-slate-800 sm:block">
                    {student.name?.split(" ")[0]}
                  </span>
                  <MdKeyboardArrowDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 origin-top-right ${
                    userOpen
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-95 opacity-0"
                  }`}
                >
                  {/* User info */}
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {student.phone}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="py-1.5">
                    {USER_MENU.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 no-underline"
                      >
                        <item.icon size={16} className="text-teal-600" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <MdLogout size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Auth buttons ── */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden rounded-full px-4 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 no-underline lg:block"
                >
                  Login
                </Link>
                <Link
                  href="/browse?free=true"
                  className="flex items-center gap-1 rounded-full bg-teal-600 px-4 py-1.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-teal-700 no-underline"
                >
                  Free Mock <MdArrowForward size={14} />
                </Link>
              </div>
            )}

            {/* Hamburger — ONLY on mobile/tablet, hidden on desktop */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <div className="relative h-5 w-5">
                <MdMenu
                  size={20}
                  className={`absolute inset-0 transition-all duration-200 ${menuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                />
                <MdClose
                  size={20}
                  className={`absolute inset-0 transition-all duration-200 ${menuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed left-0 right-0 top-16 z-[99] overflow-hidden border-b border-slate-200 bg-white shadow-xl transition-all duration-300 ease-out lg:hidden ${
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="overflow-y-auto px-4 pb-6 pt-3">
          {/* Student info (if logged in) */}
          {student && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-teal-50 px-4 py-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-base font-bold text-white">
                {student.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {student.name}
                </p>
                <p className="text-[11px] text-slate-500">{student.phone}</p>
              </div>
            </div>
          )}

          {/* Exam links */}
          {exams.length > 0 && (
            <div className="mb-2">
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Exams
              </p>
              {exams.slice(0, 5).map((e) => (
                <Link
                  key={e.id}
                  href={`/exam/${e.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-teal-700 no-underline rounded-xl"
                >
                  {e.name}
                </Link>
              ))}
            </div>
          )}

          {/* Nav links */}
          <div className="mb-2">
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Explore
            </p>
            {[
              { label: "Browse Tests", href: "/browse" },
              { label: "Crash Courses", href: "/courses" },
              { label: "Question Bank", href: "/question-bank" },
              { label: "Leaderboard", href: "/leaderboard" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-teal-700 no-underline rounded-xl"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* User links or auth */}
          {student ? (
            <div className="mb-2">
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Account
              </p>
              {USER_MENU.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 no-underline rounded-xl"
                >
                  <item.icon size={16} className="text-teal-600" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          {/* Bottom actions */}
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
            {student ? (
              <>
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 no-underline"
                >
                  <MdWhatsapp size={18} /> WhatsApp Support
                </a>
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <MdLogout size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 no-underline"
                >
                  Login
                </Link>
                <Link
                  href="/browse?free=true"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 no-underline"
                >
                  Free Mock <MdArrowForward size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
