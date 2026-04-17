'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import KaTexRenderer from '@/components/KaTexRenderer'
import ReportModal from '@/components/ReportModal'
import toast from 'react-hot-toast'
import { MdCheckCircle, MdCancel, MdBookmark, MdBookmarkBorder, MdFlag, MdArrowForward, MdArrowBack } from 'react-icons/md'

export default function QuestionBankPage() {
  const [exams, setExams]       = useState([])
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [questions, setQuestions] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState({})
  const [shown, setShown]       = useState({})
  const [bookmarks, setBookmarks] = useState([])
  const [reportId, setReportId] = useState(null)

  useEffect(() => {
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
    fetch('/api/subjects').then(r=>r.json()).then(d=>{ if(d.success) setSubjects(d.data) })
    fetch('/api/bookmark').then(r=>r.json()).then(d=>{ if(d.success) setBookmarks(d.data.map(q=>q.id)) })
  }, [])

  useEffect(() => {
    if (!subjectId) { setChapters([]); return }
    fetch(`/api/chapters?subjectId=${subjectId}`).then(r=>r.json()).then(d=>{ if(d.success) setChapters(d.data) })
  }, [subjectId])

  useEffect(() => { loadQuestions() }, [subjectId, chapterId, difficulty, page])

  async function loadQuestions() {
    setLoading(true)
    try {
      let url = `/api/questions/practice?page=${page}&limit=10`
      if (subjectId)  url += `&subjectId=${subjectId}`
      if (chapterId)  url += `&chapterId=${chapterId}`
      if (difficulty) url += `&difficulty=${difficulty}`
      const res = await fetch(url)
      const d   = await res.json()
      if (d.success) { setQuestions(d.data.questions); setTotal(d.data.total) }
    } finally { setLoading(false) }
  }

  function checkAnswer(qId, label) {
    setSelected(s => ({ ...s, [qId]: label }))
    setShown(s => ({ ...s, [qId]: true }))
  }

  async function toggleBookmark(qId) {
    const isB = bookmarks.includes(qId)
    const method = isB ? 'DELETE' : 'POST'
    await fetch('/api/bookmark', { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify({ questionId: qId }) })
    setBookmarks(b => isB ? b.filter(id=>id!==qId) : [...b, qId])
    toast.success(isB ? 'Removed' : 'Bookmarked!')
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <>
      {reportId && <ReportModal questionId={reportId} onClose={()=>setReportId(null)} />}
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize:28, fontWeight:900, color:'white' }}>Question Bank</h1>
            <p style={{ color:'rgba(255,255,255,0.8)', marginTop:4 }}>Practice questions with instant solutions</p>
          </div>
        </div>
        <div className="container" style={{ padding:'20px' }}>

          {/* Filters */}
          <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', padding:'16px 20px', marginBottom:20, display:'flex', gap:12, flexWrap:'wrap' }}>
            <select value={subjectId} onChange={e=>{ setSubjectId(e.target.value); setChapterId(''); setPage(1) }} className="input-field" style={{ flex:1, minWidth:150 }}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {chapters.length > 0 && (
              <select value={chapterId} onChange={e=>{ setChapterId(e.target.value); setPage(1) }} className="input-field" style={{ flex:1, minWidth:150 }}>
                <option value="">All Chapters</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <select value={difficulty} onChange={e=>{ setDifficulty(e.target.value); setPage(1) }} className="input-field" style={{ minWidth:130 }}>
              <option value="">All Levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Stats bar */}
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>{total} questions found · Page {page}/{totalPages||1}</p>

          {/* Questions */}
          {loading ? (
            <div style={{ textAlign:'center', padding:60 }}><div style={{ width:40, height:40, border:'3px solid var(--primary-light)', borderTop:'3px solid var(--primary)', borderRadius:'50%', margin:'0 auto' }} className="animate-spin" /></div>
          ) : questions.map((q, idx) => {
            const ans     = selected[q.id]
            const showSol = shown[q.id]
            const isBookmarked = bookmarks.includes(q.id)
            const correctOpt = q.options?.find(o=>o.isCorrect)
            const isCorrect  = ans === correctOpt?.label

            return (
              <div key={q.id} style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', marginBottom:16, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>Q{(page-1)*10+idx+1}</span>
                    {q.subject?.name && <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', background:'var(--primary-light)', color:'var(--primary-dark)', borderRadius:'var(--radius-full)' }}>{q.subject.name}</span>}
                    {q.chapter?.name && <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', background:'var(--bg-light)', color:'var(--text-muted)', borderRadius:'var(--radius-full)' }}>{q.chapter.name}</span>}
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:'var(--radius-full)', background:q.difficulty==='EASY'?'var(--success-light)':q.difficulty==='HARD'?'var(--error-light)':'var(--warning-light)', color:q.difficulty==='EASY'?'var(--success)':q.difficulty==='HARD'?'var(--error)':'var(--warning)' }}>{q.difficulty}</span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>toggleBookmark(q.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:isBookmarked?'var(--primary)':'var(--text-muted)', display:'flex' }}>{isBookmarked?<MdBookmark/>:<MdBookmarkBorder/>}</button>
                    <button onClick={()=>setReportId(q.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--text-muted)', display:'flex' }}><MdFlag/></button>
                  </div>
                </div>
                <div style={{ padding:'20px' }}>
                  <div style={{ fontSize:15, lineHeight:1.8, marginBottom:16 }}>
                    <KaTexRenderer text={q.questionText} />
                  </div>
                  {q.options?.map(opt => {
                    const isSel    = ans === opt.label
                    const isRight  = opt.isCorrect
                    const showRes  = showSol
                    return (
                      <button key={opt.id} onClick={()=>!showSol && checkAnswer(q.id, opt.label)}
                        style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 16px', marginBottom:8, borderRadius:'var(--radius-md)', border:`2px solid ${showRes&&isRight?'#BBF7D0':showRes&&isSel&&!isRight?'#FECACA':isSel?'var(--primary)':'var(--border)'}`, background:showRes&&isRight?'#F0FDF4':showRes&&isSel&&!isRight?'#FEF2F2':isSel?'var(--primary-light)':'var(--bg-light)', cursor:showSol?'default':'pointer', textAlign:'left', fontFamily:'var(--font)', transition:'all 0.15s' }}>
                        <span style={{ width:30, height:30, borderRadius:'50%', background:showRes&&isRight?'#16A34A':showRes&&isSel&&!isRight?'#DC2626':isSel?'var(--primary)':'white', color:(showRes&&(isRight||(isSel&&!isRight)))||isSel?'white':'var(--text-secondary)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 }}>{opt.label}</span>
                        <KaTexRenderer text={opt.optionText} style={{ fontSize:14, flex:1 }} />
                        {showRes && isRight && <MdCheckCircle style={{ color:'#16A34A', fontSize:20, flexShrink:0 }} />}
                        {showRes && isSel && !isRight && <MdCancel style={{ color:'#DC2626', fontSize:20, flexShrink:0 }} />}
                      </button>
                    )
                  })}

                  {showSol && (
                    <div style={{ marginTop:12, padding:'14px 16px', background:'#FFFBEB', borderRadius:'var(--radius-md)', border:'1px solid #FDE68A' }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                        {isCorrect ? '✅ Correct!' : '❌ Wrong — Correct answer: ' + correctOpt?.label}
                      </p>
                      {q.solutionText && <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}><KaTexRenderer text={q.solutionText} /></div>}
                      {q.solutionImageUrl && <img src={q.solutionImageUrl} alt="" style={{ maxWidth:'100%', borderRadius:8, marginTop:8 }} />}
                      {q.solutionVideoUrl && <div style={{ marginTop:10 }}><iframe src={q.solutionVideoUrl} style={{ width:'100%', height:220, borderRadius:8, border:'none' }} allowFullScreen /></div>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:20 }}>
              <button onClick={()=>{ setPage(p=>p-1); window.scrollTo(0,0) }} disabled={page===1} className="btn-secondary" style={{ padding:'10px 18px', opacity:page===1?0.4:1 }}><MdArrowBack/> Prev</button>
              <span style={{ padding:'10px 20px', background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-full)', fontSize:14, fontWeight:600 }}>Page {page}/{totalPages}</span>
              <button onClick={()=>{ setPage(p=>p+1); window.scrollTo(0,0) }} disabled={page===totalPages} className="btn-primary" style={{ padding:'10px 18px', opacity:page===totalPages?0.4:1 }}>Next <MdArrowForward/></button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
