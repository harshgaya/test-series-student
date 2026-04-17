'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MdClose, MdPhone, MdLock } from 'react-icons/md'
import { OTP_RESEND_SECONDS } from '@/lib/constants'

export default function LoginModal({ onClose, onSuccess, redirect }) {
  const [step, setStep]       = useState('phone')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [timer, setTimer]     = useState(0)
  const [name, setName]       = useState('')
  const [targetExam, setTargetExam] = useState('')
  const [targetYear, setTargetYear] = useState('2026')
  const [exams, setExams]     = useState([])
  const otpRefs = useRef([])
  const router  = useRouter()

  useEffect(() => {
    fetch('/api/exams').then(r => r.json()).then(d => { if (d.success) setExams(d.data) })
  }, [])

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(s => s - 1), 1000); return () => clearTimeout(t) }
  }, [timer])

  async function handleSendOTP() {
    if (!phone || phone.length < 10) { toast.error('Enter valid phone number'); return }
    setLoading(true)
    try {
      await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
      setStep('otp'); setTimer(OTP_RESEND_SECONDS)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } finally { setLoading(false) }
  }

  async function handleVerifyOTP() {
    const otpStr = otp.join('')
    if (otpStr.length < 6) { toast.error('Enter 6 digit OTP'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, otp: otpStr }) })
      const data = await res.json()
      if (!data.success) { toast.error(data.error || 'Invalid OTP'); return }
      if (data.data.newStudent) { setStep('register') }
      else {
        localStorage.setItem('iitneet_student', JSON.stringify(data.data.student))
        toast.success('Welcome back!')
        onSuccess?.(data.data.student)
        onClose?.()
      }
    } finally { setLoading(false) }
  }

  async function handleRegister() {
    if (!name.trim()) { toast.error('Enter your name'); return }
    if (!targetExam)  { toast.error('Select target exam'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, name, targetExam, targetYear: parseInt(targetYear) }) })
      const data = await res.json()
      if (!data.success) { toast.error(data.error); return }
      localStorage.setItem('iitneet_student', JSON.stringify(data.data.student))
      toast.success('Welcome to IIT NEET! 🎉')
      onSuccess?.(data.data.student)
      onClose?.()
    } finally { setLoading(false) }
  }

  function handleOtpInput(i, v) {
    if (v.length > 1) {
      const digits = v.replace(/\D/g,'').slice(0,6).split('')
      const n = [...otp]; digits.forEach((d,j) => { if (i+j<6) n[i+j]=d }); setOtp(n)
      otpRefs.current[Math.min(i+digits.length,5)]?.focus(); return
    }
    if (!/^\d*$/.test(v)) return
    const n = [...otp]; n[i] = v; setOtp(n)
    if (v && i < 5) otpRefs.current[i+1]?.focus()
    if (v && i === 5) handleVerifyOTP()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:'var(--radius-xl)', width:'100%', maxWidth:400, overflow:'hidden', boxShadow:'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'24px 24px 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ fontSize:18, fontWeight:800, color:'white' }}>{step==='phone'?'Login / Register':step==='otp'?'Enter OTP':'Complete Profile'}</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)', marginTop:4 }}>{step==='phone'?'Enter your mobile number':step==='otp'?`OTP sent to +91 ${phone}`:'Just one more step!'}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', fontSize:20 }}><MdClose/></button>
        </div>

        <div style={{ padding:24 }}>
          {step==='phone' && (
            <div>
              <div style={{ display:'flex', marginBottom:16 }}>
                <div style={{ padding:'12px 14px', background:'var(--bg-light)', border:'1.5px solid var(--border)', borderRight:'none', borderRadius:'var(--radius-md) 0 0 var(--radius-md)', fontSize:15, fontWeight:600, color:'var(--text-secondary)' }}>+91</div>
                <input className="input-field" type="tel" placeholder="9876543210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} onKeyDown={e=>e.key==='Enter'&&handleSendOTP()} style={{ borderRadius:'0 var(--radius-md) var(--radius-md) 0', borderLeft:'none' }} autoFocus />
              </div>
              <button onClick={handleSendOTP} disabled={loading||phone.length<10} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, opacity:phone.length<10?0.6:1 }}>{loading?'Sending...':'Send OTP →'}</button>
            </div>
          )}

          {step==='otp' && (
            <div>
              <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:8 }}>
                {otp.map((d,i) => (
                  <input key={i} ref={el=>otpRefs.current[i]=el} type="tel" inputMode="numeric" maxLength={6} value={d}
                    onChange={e=>handleOtpInput(i,e.target.value)}
                    onKeyDown={e=>e.key==='Backspace'&&!d&&i>0&&otpRefs.current[i-1]?.focus()}
                    style={{ width:44, height:52, textAlign:'center', fontSize:20, fontWeight:800, border:`2px solid ${d?'var(--primary)':'var(--border)'}`, borderRadius:'var(--radius-md)', outline:'none', fontFamily:'var(--font)', background:d?'var(--primary-light)':'white' }} />
                ))}
              </div>
              <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', marginBottom:16 }}>Dev mode: use <strong>123456</strong></p>
              <button onClick={handleVerifyOTP} disabled={loading||otp.join('').length<6} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, opacity:otp.join('').length<6?0.6:1 }}>{loading?'Verifying...':'Verify OTP →'}</button>
              <div style={{ textAlign:'center', marginTop:14 }}>
                {timer>0 ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>Resend in <strong style={{ color:'var(--primary)' }}>{timer}s</strong></p>
                : <button onClick={handleSendOTP} style={{ background:'none', border:'none', color:'var(--primary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>Resend OTP</button>}
              </div>
            </div>
          )}

          {step==='register' && (
            <div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Full Name</label>
                <input className="input-field" placeholder="Priya Singh" value={name} onChange={e=>setName(e.target.value)} autoFocus />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Preparing for</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {(exams.length>0?exams:[{id:'neet',name:'NEET UG'},{id:'jee',name:'JEE Main'},{id:'eamcet',name:'EAMCET'}]).map(e=>(
                    <button key={e.id} onClick={()=>setTargetExam(String(e.id))} style={{ padding:'7px 14px', borderRadius:'var(--radius-full)', border:`2px solid ${targetExam===String(e.id)?'var(--primary)':'var(--border)'}`, background:targetExam===String(e.id)?'var(--primary-light)':'white', color:targetExam===String(e.id)?'var(--primary-dark)':'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>{e.name}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Target Year</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['2025','2026','2027'].map(y=>(
                    <button key={y} onClick={()=>setTargetYear(y)} style={{ flex:1, padding:'9px', borderRadius:'var(--radius-md)', border:`2px solid ${targetYear===y?'var(--primary)':'var(--border)'}`, background:targetYear===y?'var(--primary)':'white', color:targetYear===y?'white':'var(--text-secondary)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>{y}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleRegister} disabled={loading||!name||!targetExam} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, opacity:(!name||!targetExam)?0.6:1 }}>{loading?'Creating...':'Start Preparing 🚀'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
