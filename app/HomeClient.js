'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TestCard from '@/components/TestCard'
import CourseCard from '@/components/CourseCard'
import { TOPPERS, PLATFORM_STATS, KEY_FEATURES, EXAM_COLORS, DEFAULT_EXAM_COLOR, SUPPORT_WHATSAPP } from '@/lib/constants'
import { MdArrowForward, MdCheckCircle, MdStar, MdPlayCircle, MdWhatsapp, MdArrowDownward } from 'react-icons/md'

// Avatar colors for toppers
const AVATAR_GRADIENTS = [
  ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],
  ['#ffecd2','#fcb69f'],['#a1c4fd','#c2e9fb'],
]

export default function HomeClient({ exams, featuredTests, featuredCourses, announcements }) {
  const [selectedExam, setSelectedExam] = useState(null)

  const filteredTests = selectedExam
    ? featuredTests.filter(t => t.examId === selectedExam || t.exam?.id === selectedExam)
    : featuredTests

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <Navbar exams={exams} />

      {/* Announcement bar */}
      {announcements.length > 0 && (
        <div style={{
          marginTop: 64, background: 'linear-gradient(90deg, var(--teal-700), var(--teal-500))',
          padding: '10px 20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>
            🔥 {announcements[0].title} — {announcements[0].message}
          </p>
        </div>
      )}

      {/* ━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        marginTop: announcements.length > 0 ? 0 : 64,
        background: 'linear-gradient(160deg, #F0FDFA 0%, #E0F2FE 45%, #F5F3FF 100%)',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(48px, 8vw, 80px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }} className="hero-grid">

            {/* Left — text */}
            <div>
              {/* Trust badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--teal-200)', borderRadius: 'var(--r-full)', padding: '7px 14px', marginBottom: 28, boxShadow: '0 2px 8px rgba(13,148,136,0.1)' }}>
                <span style={{ fontSize: 16 }}>🏆</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-700)' }}>Trusted by 7,000+ NEET & JEE Toppers</span>
              </div>

              <h1 className="h1" style={{ marginBottom: 20 }}>
                India's <span className="gradient-teal">#1 Platform</span><br />
                for NEET & JEE<br />
                <span style={{ color: 'var(--teal-600)' }}>Mock Tests</span>
              </h1>

              <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                Practice with <strong style={{ color: 'var(--text-primary)' }}>50,000+ questions</strong>, get All India Rank, and track your progress with detailed analytics. Where toppers practice daily.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <Link href="/browse?free=true" className="btn btn-cta btn-lg">
                  Start Free Mock Test <MdArrowForward />
                </Link>
                <Link href="/browse" className="btn btn-outline btn-lg">
                  Browse All Tests
                </Link>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'flex', gap: 'clamp(20px, 4vw, 40px)', flexWrap: 'wrap' }}>
                {PLATFORM_STATS.slice(0, 3).map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--teal-700)', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — topper cards visual */}
            <div className="hero-visual" style={{ position: 'relative', height: 440 }}>
              {/* Main card */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'white', borderRadius: 'var(--r-2xl)', padding: '24px',
                boxShadow: 'var(--shadow-xl)', width: 240, zIndex: 3,
                border: '1px solid var(--gray-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0 }}>M</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Mrinal K.</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>NEET 2025</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--teal-50)', borderRadius: 'var(--r-lg)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-700)' }}>All India Rank</span>
                  <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--teal-600)' }}>#4</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>158,000 MCQs practiced</p>
              </div>

              {/* Floating cards */}
              {[
                { top: '5%',  left: '5%',  name: 'Priya S.', rank: '#35', score: '715/720', color: ['#f093fb','#f5576c'] },
                { top: '8%',  right: '2%', name: 'Rahul M.', rank: '#8',  score: '340/360', color: ['#4facfe','#00f2fe'] },
                { bottom: '8%', left: '0%', name: 'Ananya K.',rank: '#15', score: '710/720', color: ['#43e97b','#38f9d7'] },
                { bottom: '5%', right: '0%',name: 'Vikram P.',rank: '#22', score: '333/360', color: ['#fa709a','#fee140'] },
              ].map((t, i) => (
                <div key={i} style={{
                  position: 'absolute', ...(t.top && { top: t.top }), ...(t.bottom && { bottom: t.bottom }),
                  ...(t.left && { left: t.left }), ...(t.right && { right: t.right }),
                  background: 'white', borderRadius: 'var(--r-xl)', padding: '12px 16px',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)',
                  display: 'flex', alignItems: 'center', gap: 10, minWidth: 170,
                  animation: `fadeUp 0.5s ease ${i * 0.1 + 0.2}s both`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color[0]}, ${t.color[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>AIR {t.rank} · {t.score}</p>
                  </div>
                </div>
              ))}

              {/* Score notification */}
              <div style={{
                position: 'absolute', top: '35%', right: '-8%',
                background: 'white', borderRadius: 'var(--r-xl)', padding: '10px 14px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)',
                display: 'flex', alignItems: 'center', gap: 8, zIndex: 4,
                animation: 'fadeUp 0.5s ease 0.6s both',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-500)' }}>Just Submitted</p>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>680/720 · Rank #12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ EXAM TABS + TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="label" style={{ color: 'var(--teal-600)', marginBottom: 8 }}>Our Test Series</p>
            <h2 className="h2" style={{ marginBottom: 12 }}>Practice for Your Exam</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Hundreds of mock tests, chapter tests and previous year papers — all in one place
            </p>
          </div>

          {/* Exam filter pills */}
          {exams.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
              <button onClick={() => setSelectedExam(null)}
                className={`btn btn-sm ${!selectedExam ? 'btn-primary' : 'btn-ghost'}`}
                style={{ border: !selectedExam ? 'none' : '1.5px solid var(--border)' }}>
                All Exams
              </button>
              {exams.map(exam => {
                const c = EXAM_COLORS[exam.name] || DEFAULT_EXAM_COLOR
                const active = selectedExam === exam.id
                return (
                  <button key={exam.id} onClick={() => setSelectedExam(active ? null : exam.id)}
                    style={{
                      padding: '6px 16px', borderRadius: 'var(--r-full)', border: `1.5px solid ${active ? c.text : c.border}`,
                      background: active ? c.text : c.bg, color: active ? 'white' : c.text,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s',
                    }}>
                    {exam.name}
                  </button>
                )
              })}
            </div>
          )}

          {filteredTests.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {filteredTests.map(test => <TestCard key={test.id} test={test} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📝</p>
              <p style={{ fontSize: 16 }}>No tests available yet. Check back soon!</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/browse" className="btn btn-outline">View All Tests <MdArrowForward /></Link>
          </div>
        </div>
      </section>

      {/* ━━━━ COURSES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {featuredCourses.length > 0 && (
        <section className="section" style={{ background: 'white' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="label" style={{ color: 'var(--teal-600)', marginBottom: 8 }}>Crash Courses</p>
                <h2 className="h2" style={{ marginBottom: 8 }}>Structured Day-by-Day Plans</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Daily tests, video lectures and PDF notes</p>
              </div>
              <Link href="/courses" style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <MdArrowForward />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
              {featuredCourses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━ TOPPER WALL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="section" style={{ background: 'var(--gray-900)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(13,148,136,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="label" style={{ color: 'var(--teal-400)', marginBottom: 10 }}>Hall of Excellence</p>
            <h2 className="h2" style={{ color: 'white', marginBottom: 14 }}>Our Students Get Top Ranks</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 420, margin: '0 auto' }}>
              Every year our students crack NEET & JEE with top All India Ranks
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {TOPPERS.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--r-xl)',
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(13,148,136,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length][0]}, ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length][1]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: 'white',
                  margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  {t.name[0]}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{t.name}</p>
                <div style={{ display: 'inline-block', background: 'var(--teal-600)', color: 'white', borderRadius: 'var(--r-full)', padding: '3px 10px', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  AIR {t.air}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{t.exam}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-400)' }}>{t.score}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{(t.mcq / 1000).toFixed(0)}k MCQs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="label" style={{ color: 'var(--teal-600)', marginBottom: 8 }}>Why Choose Us</p>
            <h2 className="h2" style={{ marginBottom: 12 }}>Features Built for Serious Aspirants</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>
              Everything you need to crack NEET & JEE in one powerful platform
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {KEY_FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 20,
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                transition: 'all 0.2s',
                background: 'white',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-200)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,148,136,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--r-lg)',
                  background: f.iconBg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--teal-600)', marginRight: 8, fontFamily: 'var(--font-display)', fontSize: 13 }}>
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    {f.title}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ STATS BAND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: 'linear-gradient(135deg, var(--teal-700) 0%, var(--teal-500) 100%)', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 32 }}>
            {PLATFORM_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 36, marginBottom: 6 }}>{s.icon}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ FREE CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🎯</p>
          <h2 className="h2" style={{ marginBottom: 16 }}>
            Start Practicing <span className="gradient-teal">Right Now</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>
            Attempt your first full mock test for free — no registration needed. Experience the real exam environment before you commit.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse?type=FULL_MOCK&free=true" className="btn btn-cta btn-lg">
              🩺 Free NEET Mock →
            </Link>
            <Link href="/browse?type=FULL_MOCK&free=true&exam=jee" className="btn btn-outline btn-lg">
              ⚗️ Free JEE Mock →
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with IIT NEET`} target="_blank"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: '#22C55E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, color: 'white',
          boxShadow: '0 4px 20px rgba(34,197,94,0.45)',
          textDecoration: 'none', zIndex: 40,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="WhatsApp Support">
        <MdWhatsapp />
      </a>

      <Footer exams={exams} />

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
