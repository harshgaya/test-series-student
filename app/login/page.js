'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { OTP_RESEND_SECONDS } from '@/lib/constants'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [step, setStep]         = useState('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState(['','','','','',''])
  const [loading, setLoading]   = useState(false)
  const [timer, setTimer]       = useState(0)
  const [name, setName]         = useState('')
  const [targetExam, setTargetExam] = useState('')
  const [targetYear, setTargetYear] = useState('2026')
  const [exams, setExams]       = useState([])
  const otpRefs = useRef([])

  useEffect(() => {
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
  }, [])

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(s=>s-1), 1000); return () => clearTimeout(t) }
  }, [timer])

  async function handleSendOTP() {
    if (!phone || phone.length < 10) { toast.error('Enter a valid 10-digit number'); return }
    setLoading(true)
    try {
      await fetch('/api/auth/send-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ phone }) })
      setStep('otp'); setTimer(OTP_RESEND_SECONDS)
      setTimeout(() => otpRefs.current[0]?.focus(), 150)
      toast.success('OTP sent!')
    } finally { setLoading(false) }
  }

  async function handleVerifyOTP() {
    const otpStr = otp.join('')
    if (otpStr.length < 6) { toast.error('Enter complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ phone, otp: otpStr }) })
      const data = await res.json()
      if (!data.success) { toast.error(data.error || 'Invalid OTP'); return }
      if (data.data.newStudent) { setStep('register'); return }
      localStorage.setItem('iitneet_student', JSON.stringify(data.data.student))
      toast.success(`Welcome back! 👋`)
      router.push(redirect)
    } finally { setLoading(false) }
  }

  async function handleRegister() {
    if (!name.trim()) { toast.error('Enter your name'); return }
    if (!targetExam)  { toast.error('Select your exam'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ phone, name, targetExam, targetYear: parseInt(targetYear) }) })
      const data = await res.json()
      if (!data.success) { toast.error(data.error); return }
      localStorage.setItem('iitneet_student', JSON.stringify(data.data.student))
      toast.success('Welcome to IIT NEET! 🎉')
      router.push(redirect)
    } finally { setLoading(false) }
  }

  function handleOtpInput(i, v) {
    if (v.length > 1) {
      const digits = v.replace(/\D/g,'').slice(0,6).split('')
      const n = [...otp]; digits.forEach((d,j) => { if(i+j<6) n[i+j]=d }); setOtp(n)
      otpRefs.current[Math.min(i+digits.length,5)]?.focus(); return
    }
    if (!/^\d*$/.test(v)) return
    const n=[...otp]; n[i]=v; setOtp(n)
    if (v && i<5) otpRefs.current[i+1]?.focus()
    if (v && i===5) setTimeout(handleVerifyOTP, 100)
  }

  const steps = ['phone','otp','register']
  const stepIdx = steps.indexOf(step)

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--gray-50)' }}>

      {/* Left panel — decorative */}
      <div className="hide-md" style={{
        flex: '0 0 420px',
        background: 'linear-gradient(160deg, var(--teal-700) 0%, #0891B2 60%, #6366F1 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:48 }}>
          <div style={{ width:40, height:40, background:'rgba(255,255,255,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6V10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10V6L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'white', letterSpacing:'-0.02em' }}>IIT<span style={{ opacity:0.85 }}>NEET</span></span>
        </Link>

        <div style={{ position:'relative' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>India's #1 Platform</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'white', lineHeight:1.2, marginBottom:20 }}>
            Crack NEET & JEE with Confidence
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:40 }}>
            Join 7,000+ toppers who practice daily on India's most trusted mock test platform.
          </p>

          {/* Social proof */}
          {[
            { icon:'🏆', text:'7,000+ students got top ranks' },
            { icon:'📝', text:'50,000+ questions with video solutions' },
            { icon:'📊', text:'All India Rank after every test' },
            { icon:'🔒', text:'Real exam environment — tab switch detection' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(20px,5vw,60px) clamp(20px,5vw,60px)' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          {/* Mobile logo */}
          <div className="show-md" style={{ marginBottom:32 }}>
            <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none' }}>
              <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal-600), #0891B2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 6V10C18 14.4 14.4 18 10 18C5.6 18 2 14.4 2 10V6L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--gray-900)' }}>IIT<span style={{ color:'var(--teal-600)' }}>NEET</span></span>
            </Link>
          </div>

          {/* Progress dots */}
          <div style={{ display:'flex', gap:6, marginBottom:32 }}>
            {steps.map((s,i) => (
              <div key={s} style={{ height:3, borderRadius:99, flex:1, background:i<=stepIdx?'var(--primary)':'var(--gray-200)', transition:'background 0.3s' }} />
            ))}
          </div>

          {/* Step: Phone */}
          {step === 'phone' && (
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--gray-900)', marginBottom:8 }}>Welcome back</h1>
              <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32 }}>Enter your mobile number to continue</p>

              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:8 }}>Mobile Number</label>
              <div style={{ display:'flex', marginBottom:6 }}>
                <span style={{ display:'flex', alignItems:'center', padding:'0 14px', background:'var(--gray-100)', border:'1.5px solid var(--border)', borderRight:'none', borderRadius:'var(--r-lg) 0 0 var(--r-lg)', fontSize:15, fontWeight:600, color:'var(--gray-600)', whiteSpace:'nowrap' }}>🇮🇳 +91</span>
                <input
                  type="tel" inputMode="numeric" autoFocus
                  className="input-field"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                  onKeyDown={e => e.key==='Enter' && handleSendOTP()}
                  style={{ borderRadius:'0 var(--r-lg) var(--r-lg) 0', borderLeft:'none', flex:1, letterSpacing:'0.04em' }}
                />
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:28 }}>OTP will be sent to this number</p>

              <button onClick={handleSendOTP} disabled={loading || phone.length < 10} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15, opacity:phone.length<10?0.5:1 }}>
                {loading ? 'Sending...' : 'Continue →'}
              </button>

              <p style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center', marginTop:24, lineHeight:1.6 }}>
                By continuing you agree to our{' '}
                <Link href="/terms" style={{ color:'var(--primary)' }}>Terms</Link>
                {' & '}
                <Link href="/privacy" style={{ color:'var(--primary)' }}>Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--gray-900)', marginBottom:8 }}>Enter OTP</h1>
              <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32 }}>
                Sent to <strong style={{ color:'var(--gray-900)' }}>+91 {phone}</strong>{' '}
                <button onClick={() => setStep('phone')} style={{ color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'var(--font-body)' }}>Change</button>
              </p>

              {/* OTP boxes */}
              <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                {otp.map((d, i) => (
                  <input key={i} ref={el=>otpRefs.current[i]=el}
                    type="tel" inputMode="numeric" maxLength={6}
                    value={d}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => e.key==='Backspace' && !d && i>0 && otpRefs.current[i-1]?.focus()}
                    style={{
                      flex:1, height:56, textAlign:'center',
                      fontSize:24, fontWeight:800, fontFamily:'monospace',
                      border:`2px solid ${d?'var(--primary)':'var(--border)'}`,
                      borderRadius:'var(--r-lg)',
                      outline:'none',
                      background: d ? 'var(--teal-50)' : 'white',
                      color:'var(--gray-900)',
                      transition:'all 0.15s',
                    }}
                  />
                ))}
              </div>

              {/* Dev hint */}
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:28, textAlign:'center' }}>
                Dev mode: use <code style={{ background:'var(--gray-100)', padding:'2px 6px', borderRadius:4 }}>123456</code>
              </p>

              <button onClick={handleVerifyOTP} disabled={loading || otp.join('').length<6} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15, opacity:otp.join('').length<6?0.5:1 }}>
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>

              <div style={{ textAlign:'center', marginTop:20 }}>
                {timer > 0
                  ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>Resend OTP in <strong style={{ color:'var(--primary)' }}>{timer}s</strong></p>
                  : <button onClick={handleSendOTP} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>↩ Resend OTP</button>
                }
              </div>
            </div>
          )}

          {/* Step: Register */}
          {step === 'register' && (
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--gray-900)', marginBottom:8 }}>Complete Profile</h1>
              <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32 }}>Just one step to get started!</p>

              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:8 }}>Full Name *</label>
                <input className="input-field" placeholder="Priya Singh" value={name} onChange={e=>setName(e.target.value)} autoFocus />
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:10 }}>Preparing for *</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {(exams.length > 0 ? exams : [{id:'neet',name:'NEET UG'},{id:'jee',name:'JEE Main'},{id:'eamcet',name:'EAMCET'}]).map(e => (
                    <button key={e.id} onClick={() => setTargetExam(String(e.id))}
                      style={{
                        padding:'8px 16px', borderRadius:'var(--r-full)',
                        border:`2px solid ${targetExam===String(e.id)?'var(--primary)':'var(--border)'}`,
                        background: targetExam===String(e.id) ? 'var(--teal-50)' : 'white',
                        color: targetExam===String(e.id) ? 'var(--teal-700)' : 'var(--text-secondary)',
                        fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)',
                        transition:'all 0.15s',
                      }}>
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:28 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:10 }}>Target Year</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['2025','2026','2027'].map(y => (
                    <button key={y} onClick={() => setTargetYear(y)}
                      style={{
                        flex:1, padding:'10px', borderRadius:'var(--r-lg)',
                        border:`2px solid ${targetYear===y?'var(--primary)':'var(--border)'}`,
                        background: targetYear===y ? 'var(--primary)' : 'white',
                        color: targetYear===y ? 'white' : 'var(--text-secondary)',
                        fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)',
                        transition:'all 0.15s',
                      }}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleRegister} disabled={loading || !name || !targetExam} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15, opacity:(!name||!targetExam)?0.5:1 }}>
                {loading ? 'Creating account...' : 'Start Preparing 🚀'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:40, height:40, border:'3px solid #99F6E4', borderTop:'3px solid #0D9488', borderRadius:'50%', animation:'spin 1s linear infinite' }} /></div>}>
      <LoginForm />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Suspense>
  )
}
