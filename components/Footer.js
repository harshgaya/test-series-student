'use client'
import Link from 'next/link'
import { MdWhatsapp, MdEmail } from 'react-icons/md'
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from '@/lib/constants'

export default function Footer({ exams = [] }) {
  return (
    <footer style={{ background: 'var(--gray-900)', color: 'white' }}>
      <div className="container" style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 32px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--teal-500), var(--teal-400))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 6V10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10V6L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                IIT<span style={{ color: 'var(--teal-400)' }}>NEET</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20, maxWidth: 200 }}>
              India's most trusted platform for NEET, JEE & EAMCET preparation.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E', fontSize: 18, textDecoration: 'none' }}>
                <MdWhatsapp />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)', fontSize: 18, textDecoration: 'none' }}>
                <MdEmail />
              </a>
            </div>
          </div>

          {/* Dynamic Exams */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Exams</p>
            {(exams.length > 0 ? exams : [
              { id: 'neet', name: 'NEET UG', slug: 'neet-ug' },
              { id: 'jee',  name: 'JEE Main', slug: 'jee-main' },
              { id: 'jee2', name: 'JEE Advanced', slug: 'jee-advanced' },
              { id: 'eam',  name: 'EAMCET', slug: 'eamcet' },
            ]).map(e => (
              <Link key={e.id} href={`/exam/${e.slug}`}
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10 }}>
                {e.name}
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Quick Links</p>
            {[
              { label: 'Browse Tests',         href: '/browse' },
              { label: 'Crash Courses',        href: '/courses' },
              { label: 'Free Mock Test',       href: '/browse?type=FULL_MOCK&free=true' },
              { label: 'Previous Year Papers', href: '/browse?type=PYP' },
              { label: 'Question Bank',        href: '/question-bank' },
              { label: 'Leaderboard',          href: '/leaderboard' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10 }}>{l.label}</Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Support</p>
            {[
              { label: 'Help Center',    href: '/help' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Use',   href: '/terms' },
              { label: 'Refund Policy',  href: '/refund' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10 }}>{l.label}</Link>
            ))}
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 13, fontWeight: 600, color: '#22C55E', textDecoration: 'none' }}>
              <MdWhatsapp style={{ fontSize: 16 }} /> WhatsApp Support
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© {new Date().getFullYear()} iitneet.in — All rights reserved</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Made with ❤️ for NEET & JEE aspirants</p>
        </div>
      </div>
    </footer>
  )
}
