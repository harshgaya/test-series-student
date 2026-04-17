'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MdMenu, MdClose, MdKeyboardArrowDown, MdLogout, MdDashboard, MdPerson, MdAnalytics, MdBookmark, MdLeaderboard, MdWhatsapp } from 'react-icons/md'
import { SUPPORT_WHATSAPP } from '@/lib/constants'

export default function Navbar({ exams = [] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const [student, setStudent]    = useState(null)
  const pathname = usePathname()
  const router   = useRouter()
  const dropRef  = useRef(null)

  useEffect(() => {
    const s = localStorage.getItem('iitneet_student')
    if (s) try { setStudent(JSON.parse(s)) } catch {}
  }, [pathname])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('iitneet_student')
    setStudent(null); setUserOpen(false)
    router.push('/')
  }

  if (pathname?.startsWith('/attempt/')) return null

  const isActive = (href) => pathname === href

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'var(--gray-100)'}`,
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.25s ease',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--teal-600) 0%, var(--teal-400) 100%)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 6V10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10V6L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                IIT<span style={{ color: 'var(--teal-600)' }}>NEET</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }} className="hide-md">
            {exams.slice(0, 4).map(exam => (
              <Link key={exam.id} href={`/exam/${exam.slug}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 13,
                  fontWeight: isActive(`/exam/${exam.slug}`) ? 600 : 500,
                  color: isActive(`/exam/${exam.slug}`) ? 'var(--teal-700)' : 'var(--text-secondary)',
                  background: isActive(`/exam/${exam.slug}`) ? 'var(--teal-50)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive(`/exam/${exam.slug}`)) { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'var(--gray-100)' }}}
                onMouseLeave={e => { if (!isActive(`/exam/${exam.slug}`)) { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'transparent' }}}
              >{exam.name}</Link>
            ))}
            {[
              { label: 'Browse', href: '/browse' },
              { label: 'Courses', href: '/courses' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 13,
                  fontWeight: isActive(link.href) ? 600 : 500,
                  color: isActive(link.href) ? 'var(--teal-700)' : 'var(--text-secondary)',
                  background: isActive(link.href) ? 'var(--teal-50)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >{link.label}</Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

            {/* WhatsApp */}
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" className="hide-md"
              style={{ width: 34, height: 34, borderRadius: 'var(--r-full)', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', fontSize: 18, textDecoration: 'none', transition: 'background 0.15s' }}
              title="WhatsApp Support">
              <MdWhatsapp />
            </a>

            {student ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button onClick={() => setUserOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px 6px 6px',
                  background: userOpen ? 'var(--teal-50)' : 'var(--gray-50)',
                  border: `1.5px solid ${userOpen ? 'var(--teal-200)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-full)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {student.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <span className="hide-sm" style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{student.name?.split(' ')[0]}</span>
                  <MdKeyboardArrowDown style={{ fontSize: 16, color: 'var(--gray-500)', transition: 'transform 0.2s', transform: userOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {userOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'white', borderRadius: 'var(--r-xl)',
                    border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
                    minWidth: 200, overflow: 'hidden', zIndex: 200,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{student.phone}</p>
                    </div>
                    {[
                      { href: '/dashboard',   label: 'Dashboard',   icon: MdDashboard },
                      { href: '/profile',     label: 'Profile',     icon: MdPerson },
                      { href: '/analytics',   label: 'Analytics',   icon: MdAnalytics },
                      { href: '/bookmarks',   label: 'Bookmarks',   icon: MdBookmark },
                      { href: '/leaderboard', label: 'Leaderboard', icon: MdLeaderboard },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <item.icon style={{ fontSize: 16, color: 'var(--teal-600)' }} />
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--gray-100)' }}>
                      <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', fontSize: 13, fontWeight: 500, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <MdLogout style={{ fontSize: 16 }} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link href="/login" className="btn btn-ghost btn-sm hide-md">Login</Link>
                <Link href="/browse?free=true" className="btn btn-cta btn-sm">Free Mock →</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="show-md" style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)',
              background: 'var(--gray-50)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 20, color: 'var(--gray-700)',
            }}>
              {menuOpen ? <MdClose /> : <MdMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(0,0,0,0.4)',
        }} onClick={() => setMenuOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: 64, left: 0, right: 0,
            background: 'white',
            borderBottom: '1px solid var(--border)',
            padding: '12px 16px 20px',
            boxShadow: 'var(--shadow-xl)',
          }}>
            {exams.slice(0, 5).map(e => (
              <Link key={e.id} href={`/exam/${e.slug}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 12px', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--gray-100)', borderRadius: 'var(--r-md)' }}>
                {e.name}
              </Link>
            ))}
            <Link href="/browse" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 12px', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--gray-100)' }}>Browse Tests</Link>
            <Link href="/courses" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 12px', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--gray-100)' }}>Crash Courses</Link>
            {student ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '11px 12px', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--gray-100)' }}>Dashboard</Link>
                <button onClick={() => { setMenuOpen(false); logout() }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 12px', fontSize: 15, fontWeight: 500, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign Out</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Link href="/login" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/browse?free=true" className="btn btn-cta" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Free Mock</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
