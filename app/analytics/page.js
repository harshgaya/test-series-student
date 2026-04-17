'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MdTrendingUp, MdArrowForward } from 'react-icons/md'

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData]         = useState(null)
  const [attempts, setAttempts] = useState([])
  const [exams, setExams]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const s = localStorage.getItem('iitneet_student')
    if (!s) { router.push('/login'); return }
    Promise.all([
      fetch('/api/student/analytics').then(r=>r.json()),
      fetch('/api/student/attempts').then(r=>r.json()),
      fetch('/api/exams').then(r=>r.json()),
    ]).then(([a,at,e]) => {
      if (a.success)  setData(a.data)
      if (at.success) setAttempts(at.data)
      if (e.success)  setExams(e.data)
    }).finally(()=>setLoading(false))
  }, [])

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize:28, fontWeight:900, color:'white' }}>My Analytics</h1>
            <p style={{ color:'rgba(255,255,255,0.8)', marginTop:4 }}>Track your performance and progress</p>
          </div>
        </div>
        <div className="container" style={{ padding:'24px 20px' }}>
          {loading ? <div style={{ textAlign:'center', padding:60 }}><div style={{ width:40, height:40, border:'3px solid var(--primary-light)', borderTop:'3px solid var(--primary)', borderRadius:'50%', margin:'0 auto' }} className="animate-spin" /></div> : !data ? <p>No data yet</p> : (
            <>
              {/* Summary stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:16, marginBottom:24 }}>
                {[
                  { label:'Total Attempts', value: data.totalAttempts, icon:'📋', color:'var(--primary-light)' },
                  { label:'Total Answered', value: data.totalAnswered, icon:'✏️', color:'#EFF6FF' },
                  { label:'Total Correct',  value: data.totalCorrect,  icon:'✅', color:'var(--success-light)' },
                  { label:'Accuracy',       value: data.totalAnswered > 0 ? `${Math.round((data.totalCorrect/data.totalAnswered)*100)}%` : '—', icon:'🎯', color:'#FFF7ED' },
                ].map(s => (
                  <div key={s.label} style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'20px 16px', textAlign:'center' }}>
                    <p style={{ fontSize:28, marginBottom:8 }}>{s.icon}</p>
                    <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{s.value}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Score trend */}
              {data.scoreTrend?.length > 0 && (
                <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'24px', marginBottom:20 }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>📈 Score Trend (Last 10 attempts)</h3>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
                    {data.scoreTrend.map((s,i) => (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <div style={{ width:'100%', background:`linear-gradient(to top, var(--primary), var(--primary-mid))`, borderRadius:'4px 4px 0 0', height:`${s.pct}%`, minHeight:4, transition:'height 0.5s ease' }} title={`${s.pct}%`} />
                        <p style={{ fontSize:10, color:'var(--text-muted)', transform:'rotate(-45deg)', whiteSpace:'nowrap' }}>{s.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject wise */}
              {data.subjectStats?.length > 0 && (
                <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'24px', marginBottom:20 }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>📚 Subject-wise Accuracy</h3>
                  {data.subjectStats.map((s,i) => (
                    <div key={i} style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <p style={{ fontSize:14, fontWeight:600 }}>{s.name}</p>
                        <p style={{ fontSize:13, color:'var(--text-muted)' }}>{s.correct}/{s.total} · {s.accuracy}%</p>
                      </div>
                      <div style={{ height:8, background:'var(--bg-light)', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${s.accuracy}%`, background: s.accuracy>=70?'var(--success)':s.accuracy>=40?'var(--accent)':'var(--error)', borderRadius:99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Weak chapters */}
              {data.weakChapters?.length > 0 && (
                <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'24px', marginBottom:20 }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>⚠️ Weak Areas — Focus Here</h3>
                  {data.weakChapters.map((c,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i<data.weakChapters.length-1?'1px solid var(--border)':'none' }}>
                      <div style={{ width:36, height:36, background:'#FEF2F2', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>😟</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14, fontWeight:600 }}>{c.name}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)' }}>{c.subject}</p>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--error)', background:'#FEF2F2', padding:'4px 10px', borderRadius:'var(--radius-full)' }}>{c.accuracy}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Past attempts */}
              {attempts.length > 0 && (
                <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'24px' }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>All Past Attempts</h3>
                  {attempts.slice(0,10).map((a,i) => (
                    <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i<Math.min(attempts.length,10)-1?'1px solid var(--border)':'none' }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14, fontWeight:600 }}>{a.test?.title}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{a.test?.exam?.name} · {new Date(a.submittedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <p style={{ fontSize:15, fontWeight:800, color:'var(--primary)' }}>{Number(a.score)}/{a.totalMarks}</p>
                      <Link href={`/result/${a.id}`} style={{ fontSize:13, color:'var(--primary)', textDecoration:'none', fontWeight:600 }}>View →</Link>
                    </div>
                  ))}
                </div>
              )}

              {data.totalAttempts === 0 && (
                <div style={{ textAlign:'center', padding:60 }}>
                  <p style={{ fontSize:40, marginBottom:16 }}>📊</p>
                  <p style={{ fontSize:16, fontWeight:600 }}>No attempts yet</p>
                  <p style={{ fontSize:14, color:'var(--text-muted)', marginTop:8 }}>Attempt tests to see your analytics</p>
                  <Link href="/browse" className="btn-primary" style={{ marginTop:16 }}>Start Practicing</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
