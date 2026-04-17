'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import toast from 'react-hot-toast'
import { MdSave, MdPerson } from 'react-icons/md'

export default function ProfilePage() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [exams, setExams]     = useState([])
  const [name, setName]       = useState('')
  const [targetExam, setTargetExam] = useState('')
  const [targetYear, setTargetYear] = useState('2026')
  const [loading, setLoading] = useState(false)
  const [daysLeft, setDaysLeft] = useState(null)

  useEffect(() => {
    const s = localStorage.getItem('iitneet_student')
    if (!s) { router.push('/login'); return }
    const parsed = JSON.parse(s)
    setStudent(parsed); setName(parsed.name||''); setTargetExam(String(parsed.targetExamId||'')); setTargetYear(String(parsed.targetYear||2026))
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
    const year = parsed.targetYear || 2026
    const examDate = new Date(`${year}-05-01`)
    const diff = Math.ceil((examDate - new Date()) / (1000*60*60*24))
    setDaysLeft(diff > 0 ? diff : null)
  }, [])

  async function handleSave() {
    if (!name.trim()) { toast.error('Name required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/student/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, targetExamId: targetExam||null, targetYear: parseInt(targetYear) }) })
      const d   = await res.json()
      if (d.success) {
        const updated = { ...student, name, targetExamId: targetExam, targetYear: parseInt(targetYear) }
        localStorage.setItem('iitneet_student', JSON.stringify(updated))
        setStudent(updated)
        toast.success('Profile updated!')
      } else toast.error(d.error)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize:28, fontWeight:900, color:'white' }}>My Profile</h1>
            <p style={{ color:'rgba(255,255,255,0.8)', marginTop:4 }}>{student?.phone}</p>
          </div>
        </div>
        <div className="container" style={{ padding:'24px 20px', maxWidth:560 }}>

          {daysLeft && (
            <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>Days to exam</p>
                <p style={{ fontSize:36, fontWeight:900, color:'white', lineHeight:1 }}>{daysLeft}</p>
              </div>
              <p style={{ fontSize:40 }}>🎯</p>
            </div>
          )}

          <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:28 }}>
            {/* Avatar */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <div style={{ width:80, height:80, background:'var(--primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, color:'white' }}>
                {name?.[0]?.toUpperCase() || <MdPerson style={{ fontSize:36 }} />}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Full Name</label>
              <input className="input-field" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Mobile Number</label>
              <input className="input-field" value={student?.phone||''} disabled style={{ opacity:0.6, cursor:'not-allowed' }} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Preparing for</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {exams.map(e => (
                  <button key={e.id} onClick={()=>setTargetExam(String(e.id))} style={{ padding:'8px 16px', borderRadius:'var(--radius-full)', border:`2px solid ${targetExam===String(e.id)?'var(--primary)':'var(--border)'}`, background:targetExam===String(e.id)?'var(--primary-light)':'white', color:targetExam===String(e.id)?'var(--primary-dark)':'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>{e.name}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Target Year</label>
              <div style={{ display:'flex', gap:8 }}>
                {['2025','2026','2027'].map(y => (
                  <button key={y} onClick={()=>setTargetYear(y)} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-md)', border:`2px solid ${targetYear===y?'var(--primary)':'var(--border)'}`, background:targetYear===y?'var(--primary)':'white', color:targetYear===y?'white':'var(--text-secondary)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>{y}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, fontSize:15 }}>
              <MdSave /> {loading?'Saving...':'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
