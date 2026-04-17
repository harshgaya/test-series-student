'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'
import toast from 'react-hot-toast'
import { MdArrowBack, MdCheckCircle, MdTimer, MdQuestionAnswer, MdWarning } from 'react-icons/md'
import { SUPPORT_WHATSAPP } from '@/lib/constants'

export default function TestPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const [data, setData]           = useState(null)
  const [exams, setExams]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [paying, setPaying]       = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    fetch(`/api/tests/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
        else setError(d.error || 'Test not found')
      })
      .catch(() => setError('Could not load test. Check your internet connection.'))
      .finally(() => setLoading(false))
    fetch('/api/exams').then(r => r.json()).then(d => { if (d.success) setExams(d.data) })
  }, [id])

  function requireLogin(action) {
    const student = localStorage.getItem('iitneet_student')
    if (!student) { setPendingAction(action); setShowLogin(true); return false }
    return true
  }

  function handleLoginSuccess() {
    setShowLogin(false)
    if (pendingAction === 'attempt') router.push(`/attempt/${id}`)
    if (pendingAction === 'buy') startPayment()
    setPendingAction(null)
  }

  function handleAttempt() {
    if (!requireLogin('attempt')) return
    router.push(`/attempt/${id}`)
  }

  async function startPayment() {
    setPaying(true)
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: id }),
      })
      const d = await res.json()
      if (!d.success) { toast.error(d.error); return }
      const opts = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: d.data.amount, currency: 'INR',
        name: 'IIT NEET', description: d.data.description, order_id: d.data.orderId,
        handler: async (response) => {
          const vres = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) })
          const vd = await vres.json()
          if (vd.success) { toast.success('Payment successful!'); router.push(`/payment/status?orderId=${d.data.orderId}`) }
          else toast.error('Payment verification failed')
        },
        theme: { color: '#0D9488' },
      }
      new window.Razorpay(opts).open()
    } catch { toast.error('Something went wrong') }
    finally { setPaying(false) }
  }

  function handleBuy() {
    if (!requireLogin('buy')) return
    startPayment()
  }

  if (loading) return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid var(--teal-100)', borderTop: '3px solid var(--primary)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading test...</p>
        </div>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 64, minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 'var(--r-2xl)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
            <MdWarning style={{ color: '#DC2626' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Could Not Load Test</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>{error}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
            This may happen if the test doesn't exist or your connection is slow. Please check your <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>.env</code> DATABASE_URL is set correctly.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/browse" className="btn-primary">Browse All Tests</Link>
            <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
          </div>
        </div>
      </div>
    </>
  )

  const { test, purchased, attempts, leaderboard, stats } = data
  const isFree = Number(test.price) === 0

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />}
      <Navbar exams={exams} />
      <div style={{ marginTop: 64, minHeight: '100vh', background: 'var(--gray-50)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-700) 0%, #0891B2 100%)', padding: 'clamp(28px, 5vw, 48px) 20px clamp(48px, 6vw, 72px)' }}>
          <div className="container">
            <Link href="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
              <MdArrowBack style={{ fontSize: 18 }} /> Back to Browse
            </Link>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {test.exam?.name && <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.18)', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600, color: 'white' }}>{test.exam.name}</span>}
              <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.18)', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600, color: 'white' }}>{test.testType?.replace(/_/g, ' ')}</span>
              {isFree && <span style={{ padding: '4px 12px', background: '#22C55E', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 700, color: 'white' }}>FREE</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(18px, 3.5vw, 28px)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', marginBottom: 8 }}>{test.title}</h1>
            {stats._count.id > 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{stats._count.id.toLocaleString('en-IN')} students attempted</p>}
          </div>
        </div>

        <div className="container" style={{ padding: '0 20px', marginTop: -36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }} className="test-detail-layout">

            {/* Left */}
            <div>
              {/* Stats card */}
              <div className="card-flat" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Questions', value: test._count?.testQuestions || 0 },
                    { label: 'Duration',  value: `${test.durationMins}m` },
                    { label: 'Marks',     value: test.totalMarks },
                    { label: 'Negative',  value: Number(test.negativeMarking) },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--gray-50)', borderRadius: 'var(--r-lg)' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal-700)', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="card-flat" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Instructions</h3>
                {[
                  `Each correct answer = +${test.marksCorrect} marks`,
                  `Each wrong answer = ${test.negativeMarking} marks`,
                  'Timer cannot be paused once started',
                  'Switching tabs will trigger a warning — 3 switches = auto submit',
                  'Progress is auto-saved every 30 seconds',
                  'You can reattempt this test unlimited times',
                  'Right click and copy-paste are disabled during test',
                ].map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 20, height: 20, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{inst}</p>
                  </div>
                ))}
              </div>

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="card-flat" style={{ padding: 24, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Top Performers</h3>
                  {leaderboard.slice(0, 5).map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none' }}>
                      <span style={{ width: 28, height: 28, background: ['#FFD700','#C0C0C0','#CD7F32'][i] || 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < 3 ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{e.student?.name}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-600)' }}>{Number(e.score)}/{e.totalMarks}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Past attempts */}
              {attempts.length > 0 && (
                <div className="card-flat" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Your Attempts</h3>
                  {attempts.map((a, i) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < attempts.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>Attempt {attempts.length - i}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.submittedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal-600)' }}>{Number(a.score)}/{a.totalMarks}</p>
                      {a.rank && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rank #{a.rank}</p>}
                      <Link href={`/result/${a.id}`} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div className="card-flat" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--gray-100)' }}>
                  {isFree
                    ? <p style={{ fontSize: 22, fontWeight: 800, color: '#16A34A' }}>FREE</p>
                    : <p style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>₹{Number(test.price)}</p>
                  }
                </div>
                <div style={{ padding: 20 }}>
                  {(purchased || isFree)
                    ? <button onClick={handleAttempt} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}>
                        {attempts.length > 0 ? '↩ Attempt Again' : '▶ Attempt Now'}
                      </button>
                    : <button onClick={handleBuy} disabled={paying} className="btn-cta" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}>
                        {paying ? 'Processing...' : `Buy Now — ₹${Number(test.price)}`}
                      </button>
                  }
                  {[
                    `${test._count?.testQuestions || 0} questions`,
                    `${test.durationMins} minutes`,
                    `+${test.marksCorrect} correct / ${test.negativeMarking} wrong`,
                    'Unlimited reattempts',
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      <MdCheckCircle style={{ color: 'var(--teal-500)', fontSize: 15, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                  <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Need help? WhatsApp us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px) { .test-detail-layout { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <Footer exams={exams} />
    </>
  )
}
