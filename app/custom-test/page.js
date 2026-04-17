'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import toast from 'react-hot-toast'
import { MdBolt, MdBookmark, MdCancel, MdTrendingDown, MdArrowForward } from 'react-icons/md'

const SOURCES = [
  { value:'scratch',   label:'From Scratch',    desc:'Pick subject, chapter and difficulty', icon:'✏️' },
  { value:'weak',      label:'Weak Areas',       desc:'Auto-picks chapters you struggle with', icon:'📉' },
  { value:'bookmarks', label:'My Bookmarks',     desc:'Questions you have saved', icon:'🔖' },
  { value:'wrong',     label:'Wrong Answers',    desc:'Questions you got wrong before', icon:'❌' },
]

export default function CustomTestPage() {
  const router = useRouter()
  const [exams, setExams]       = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [source, setSource]     = useState('scratch')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [count, setCount]       = useState(20)
  const [shuffle, setShuffle]   = useState(true)
  const [loading, setLoading]   = useState(false)
  const [preview, setPreview]   = useState(null)

  useEffect(() => {
    const s = localStorage.getItem('iitneet_student')
    if (!s) { router.push('/login'); return }
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
    fetch('/api/subjects').then(r=>r.json()).then(d=>{ if(d.success) setSubjects(d.data) })
  }, [])

  useEffect(() => {
    if (!subjectId) { setChapters([]); return }
    fetch(`/api/chapters?subjectId=${subjectId}`).then(r=>r.json()).then(d=>{ if(d.success) setChapters(d.data) })
  }, [subjectId])

  async function handleBuild() {
    setLoading(true)
    try {
      const res = await fetch('/api/custom-test/create', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ source, subjectId: subjectId||null, chapterId: chapterId||null, difficulty: difficulty||null, count, shuffle }) })
      const d   = await res.json()
      if (!d.success) { toast.error(d.error); return }
      if (d.data.total === 0) { toast.error('No questions found for selected criteria'); return }
      setPreview(d.data)
      toast.success(`${d.data.total} questions ready!`)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize:28, fontWeight:900, color:'white' }}>Custom Test Builder</h1>
            <p style={{ color:'rgba(255,255,255,0.8)', marginTop:4 }}>Build your own practice test</p>
          </div>
        </div>
        <div className="container" style={{ padding:'24px 20px', maxWidth:640 }}>

          {!preview ? (
            <>
              {/* Source selection */}
              <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24, marginBottom:20 }}>
                <p style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Choose question source</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
                  {SOURCES.map(s => (
                    <button key={s.value} onClick={()=>setSource(s.value)} style={{ padding:'14px', borderRadius:'var(--radius-lg)', border:`2px solid ${source===s.value?'var(--primary)':'var(--border)'}`, background:source===s.value?'var(--primary-light)':'white', cursor:'pointer', textAlign:'left', fontFamily:'var(--font)', transition:'all 0.2s' }}>
                      <p style={{ fontSize:20, marginBottom:6 }}>{s.icon}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:source===s.value?'var(--primary-dark)':'var(--text-primary)' }}>{s.label}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options for scratch */}
              {source==='scratch' && (
                <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24, marginBottom:20 }}>
                  <p style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Filter questions</p>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Subject</label>
                    <select value={subjectId} onChange={e=>{ setSubjectId(e.target.value); setChapterId('') }} className="input-field">
                      <option value="">All subjects</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  {chapters.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Chapter</label>
                      <select value={chapterId} onChange={e=>setChapterId(e.target.value)} className="input-field">
                        <option value="">All chapters</option>
                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Difficulty</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {[['','All'],['EASY','Easy'],['MEDIUM','Medium'],['HARD','Hard']].map(([v,l]) => (
                        <button key={v} onClick={()=>setDifficulty(v)} style={{ flex:1, padding:'9px', borderRadius:'var(--radius-md)', border:`2px solid ${difficulty===v?'var(--primary)':'var(--border)'}`, background:difficulty===v?'var(--primary-light)':'white', color:difficulty===v?'var(--primary-dark)':'var(--text-secondary)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:24, marginBottom:20 }}>
                <p style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Test settings</p>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:8 }}>Number of questions: <strong style={{ color:'var(--primary)' }}>{count}</strong></label>
                  <input type="range" min={5} max={50} step={5} value={count} onChange={e=>setCount(parseInt(e.target.value))} style={{ width:'100%', accentColor:'var(--primary)' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                    <span>5</span><span>50</span>
                  </div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <input type="checkbox" checked={shuffle} onChange={e=>setShuffle(e.target.checked)} style={{ width:18, height:18, accentColor:'var(--primary)' }} />
                  <span style={{ fontSize:14, fontWeight:500 }}>Shuffle questions</span>
                </label>
              </div>

              <button onClick={handleBuild} disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15 }}>
                {loading ? 'Building...' : 'Build My Test →'}
              </button>
            </>
          ) : (
            /* Preview */
            <div style={{ background:'white', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', padding:32, textAlign:'center' }}>
              <p style={{ fontSize:48, marginBottom:16 }}>✅</p>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Test Ready!</h2>
              <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:24 }}>{preview.total} questions selected from {source==='scratch'?'question bank':source==='weak'?'weak chapters':source==='bookmarks'?'bookmarks':'wrong answers'}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
                <div style={{ background:'var(--primary-light)', borderRadius:'var(--radius-md)', padding:'16px 8px' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{preview.total}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>Questions</p>
                </div>
                <div style={{ background:'#FFF7ED', borderRadius:'var(--radius-md)', padding:'16px 8px' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:'var(--accent)' }}>~{Math.ceil(preview.total*1.5)}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>Minutes</p>
                </div>
                <div style={{ background:'var(--success-light)', borderRadius:'var(--radius-md)', padding:'16px 8px' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:'var(--success)' }}>{preview.total*4}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>Marks</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={()=>setPreview(null)} className="btn-secondary" style={{ flex:1, justifyContent:'center' }}>Change Settings</button>
                <button onClick={()=>{ toast('Custom test attempt coming soon!'); }} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Start Test <MdArrowForward/></button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
