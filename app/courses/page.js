'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CourseCard from '@/components/CourseCard'
import { MdSearch } from 'react-icons/md'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [exams, setExams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [examFilter, setExamFilter] = useState('')

  useEffect(() => {
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
    fetch('/api/courses').then(r=>r.json()).then(d=>{ if(d.success) setCourses(d.data) }).finally(()=>setLoading(false))
  }, [])

  const filtered = courses.filter(c => {
    if (examFilter && c.exam?.id !== parseInt(examFilter)) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:'white', marginBottom:8 }}>Crash Courses</h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.85)', marginBottom:20 }}>Structured day-by-day plans for NEET, JEE & EAMCET</p>
            <div style={{ position:'relative', maxWidth:440 }}>
              <MdSearch style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:20, color:'#94A3B8' }} />
              <input className="input-field" placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:42, background:'white' }} />
            </div>
          </div>
        </div>
        <div className="container" style={{ padding:'24px 20px' }}>
          {/* Exam filter */}
          <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
            <button onClick={()=>setExamFilter('')} style={{ padding:'8px 18px', borderRadius:'var(--radius-full)', border:`2px solid ${!examFilter?'var(--primary)':'var(--border)'}`, background:!examFilter?'var(--primary)':'white', color:!examFilter?'white':'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>All</button>
            {exams.map(e => (
              <button key={e.id} onClick={()=>setExamFilter(String(e.id))} style={{ padding:'8px 18px', borderRadius:'var(--radius-full)', border:`2px solid ${examFilter===String(e.id)?'var(--primary)':'var(--border)'}`, background:examFilter===String(e.id)?'var(--primary-light)':'white', color:examFilter===String(e.id)?'var(--primary-dark)':'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>{e.name}</button>
            ))}
          </div>
          {loading ? <div style={{ textAlign:'center', padding:60 }}><div style={{ width:40, height:40, border:'3px solid var(--primary-light)', borderTop:'3px solid var(--primary)', borderRadius:'50%', margin:'0 auto' }} className="animate-spin" /></div>
          : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:80 }}>
              <p style={{ fontSize:40, marginBottom:16 }}>📅</p>
              <p style={{ fontSize:16, fontWeight:600 }}>No courses found</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
              {filtered.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
