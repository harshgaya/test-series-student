'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import KaTexRenderer from '@/components/KaTexRenderer'
import { MdArrowForward, MdTimer, MdStar, MdTrendingUp, MdBookmark, MdLeaderboard, MdAnalytics, MdSchool } from 'react-icons/md'
import { SUPPORT_WHATSAPP } from '@/lib/constants'

export default function DashboardPage() {
  const router = useRouter()
  const [student, setStudent]         = useState(null)
  const [purchases, setPurchases]     = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [attempts, setAttempts]       = useState([])
  const [dpp, setDpp]                 = useState([])
  const [exams, setExams]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [daysLeft, setDaysLeft]       = useState(null)

  useEffect(() => {
    const s = localStorage.getItem('iitneet_student')
    if (!s) { router.push('/login'); return }
    const parsed = JSON.parse(s)
    setStudent(parsed)

    // Exam countdown
    const year = parsed.targetYear || 2026
    const examDate = new Date(`${year}-05-01`)
    const diff = Math.ceil((examDate - new Date()) / (1000*60*60*24))
    if (diff > 0) setDaysLeft(diff)

    Promise.all([
      fetch('/api/student/purchases').then(r=>r.json()),
      fetch('/api/student/enrollments').then(r=>r.json()),
      fetch('/api/announcements').then(r=>r.json()),
      fetch('/api/student/attempts').then(r=>r.json()),
      fetch('/api/dpp').then(r=>r.json()),
      fetch('/api/exams').then(r=>r.json()),
    ]).then(([p,e,a,at,d,ex]) => {
      if (p.success)  setPurchases(p.data)
      if (e.success)  setEnrollments(e.data)
      if (a.success)  setAnnouncements(a.data)
      if (at.success) setAttempts(at.data)
      if (d.success)  setDpp(d.data)
      if (ex.success) setExams(ex.data)
    }).finally(() => setLoading(false))
  }, [])

  // Streak calculation
  const streak = (() => {
    if (!attempts.length) return 0
    const dates = [...new Set(attempts.map(a => new Date(a.submittedAt).toDateString()))].sort((a,b) => new Date(b)-new Date(a))
    let count = 0
    let current = new Date()
    for (const d of dates) {
      const diff = Math.floor((current - new Date(d)) / (1000*60*60*24))
      if (diff <= 1) { count++; current = new Date(d) }
      else break
    }
    return count
  })()

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>

        {/* Hero welcome */}
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'32px 20px' }}>
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
              <div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:4 }}>Welcome back 👋</p>
                <h1 style={{ fontSize:'clamp(20px,4vw,28px)', fontWeight:900, color:'white', marginBottom:4 }}>{student?.name || 'Student'}</h1>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.85)' }}>{student?.phone}</p>
              </div>
              {/* Stats row */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {daysLeft && (
                  <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'var(--radius-lg)', padding:'14px 20px', textAlign:'center' }}>
                    <p style={{ fontSize:24, fontWeight:900, color:'white', lineHeight:1 }}>{daysLeft}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.8)', marginTop:3 }}>Days Left</p>
                  </div>
                )}
                {streak > 0 && (
                  <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'var(--radius-lg)', padding:'14px 20px', textAlign:'center' }}>
                    <p style={{ fontSize:24, fontWeight:900, color:'white', lineHeight:1 }}>{streak}🔥</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.8)', marginTop:3 }}>Day Streak</p>
                  </div>
                )}
                <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'var(--radius-lg)', padding:'14px 20px', textAlign:'center' }}>
                  <p style={{ fontSize:24, fontWeight:900, color:'white', lineHeight:1 }}>{attempts.length}</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.8)', marginTop:3 }}>Tests Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'24px 20px' }}>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={{ marginBottom:20 }}>
              {announcements.map(a => (
                <div key={a.id} style={{ background:'var(--primary-light)', border:'1px solid var(--primary-border)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:8, display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:18 }}>📢</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--primary-dark)' }}>{a.title}</p>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>

            {/* Quick actions */}
            <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Quick Actions</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Browse Free Tests',   href:'/browse?free=true',    icon:'🆓' },
                  { label:'My Purchased Tests',  href:'/my-tests',            icon:'📋' },
                  { label:'My Courses',          href:'/my-courses',          icon:'📅' },
                  { label:'Question Bank',       href:'/question-bank',       icon:'📚' },
                  { label:'Custom Test',         href:'/custom-test',         icon:'🎯' },
                  { label:'Bookmarks',           href:'/bookmarks',           icon:'🔖' },
                  { label:'My Analytics',        href:'/analytics',           icon:'📊' },
                  { label:'Leaderboard',         href:'/leaderboard',         icon:'🏆' },
                ].map(a => (
                  <Link key={a.href} href={a.href} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg-light)', borderRadius:'var(--radius-md)', textDecoration:'none', transition:'background 0.2s' }}>
                    <span style={{ fontSize:18 }}>{a.icon}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', flex:1 }}>{a.label}</span>
                    <MdArrowForward style={{ color:'var(--text-muted)', fontSize:16 }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* DPP - Daily Practice */}
            <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>📝 Today's Practice</h3>
                <span style={{ fontSize:12, fontWeight:600, padding:'4px 10px', background:'var(--accent-light)', color:'var(--accent-dark)', borderRadius:'var(--radius-full)' }}>DPP</span>
              </div>
              {dpp.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>📝</p>
                  <p style={{ fontSize:13 }}>Attempt some tests first to get personalized DPP</p>
                  <Link href="/browse?free=true" className="btn-primary" style={{ marginTop:12, fontSize:13, padding:'8px 16px' }}>Start Practicing</Link>
                </div>
              ) : (
                <>
                  {dpp.slice(0,3).map((q,i) => (
                    <div key={q.id} style={{ padding:'10px 0', borderBottom:i<2?'1px solid var(--border)':'none' }}>
                      <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 6px', background:'var(--primary-light)', color:'var(--primary-dark)', borderRadius:'var(--radius-full)' }}>{q.subject?.name}</span>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 6px', background:'var(--bg-light)', color:'var(--text-muted)', borderRadius:'var(--radius-full)' }}>{q.chapter?.name}</span>
                      </div>
                      <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.4 }}>
                        <KaTexRenderer text={q.questionText?.substring(0,80) + '...'} />
                      </p>
                    </div>
                  ))}
                  <Link href="/question-bank" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:14, fontSize:13, padding:'10px' }}>
                    Practice All {dpp.length} Questions →
                  </Link>
                </>
              )}
            </div>

            {/* Recent attempts */}
            <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>Recent Attempts</h3>
                <Link href="/analytics" style={{ fontSize:13, color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>View all</Link>
              </div>
              {attempts.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>📊</p>
                  <p style={{ fontSize:13 }}>No attempts yet</p>
                  <Link href="/browse?free=true" className="btn-primary" style={{ marginTop:12, fontSize:13, padding:'8px 16px' }}>Attempt Free Mock</Link>
                </div>
              ) : attempts.slice(0,5).map((a,i) => {
                const pct = a.totalMarks > 0 ? Math.round((Number(a.score)/a.totalMarks)*100) : 0
                return (
                  <Link key={a.id} href={`/result/${a.id}`} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<Math.min(attempts.length,5)-1?'1px solid var(--border)':'none', textDecoration:'none' }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background: pct>=70?'var(--success-light)':pct>=40?'#FFF7ED':'var(--error-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color: pct>=70?'var(--success)':pct>=40?'var(--accent)':'var(--error)', flexShrink:0 }}>
                      {pct}%
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.test?.title}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{new Date(a.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', flexShrink:0 }}>{Number(a.score)}/{a.totalMarks}</p>
                  </Link>
                )
              })}
            </div>

            {/* Enrolled courses */}
            <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>My Courses</h3>
                <Link href="/my-courses" style={{ fontSize:13, color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>View all</Link>
              </div>
              {enrollments.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>📅</p>
                  <p style={{ fontSize:13 }}>No courses enrolled</p>
                  <Link href="/courses" className="btn-primary" style={{ marginTop:12, fontSize:13, padding:'8px 16px' }}>Browse Courses</Link>
                </div>
              ) : enrollments.slice(0,3).map((e,i) => {
                const pct = Math.round(((e.currentDay-1)/Math.max(e.crashCourse?.durationDays,1))*100)
                return (
                  <Link key={e.id} href={`/course/${e.crashCourse?.id}`} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<Math.min(enrollments.length,3)-1?'1px solid var(--border)':'none', textDecoration:'none' }}>
                    <div style={{ width:44, height:44, background:'var(--primary-light)', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'var(--primary)', flexShrink:0 }}>{e.crashCourse?.durationDays}d</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.crashCourse?.title}</p>
                      <div style={{ height:4, background:'var(--bg-light)', borderRadius:99, marginTop:6, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:'var(--primary)', borderRadius:99 }} />
                      </div>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)', flexShrink:0 }}>{pct}%</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
