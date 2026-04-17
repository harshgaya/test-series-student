'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TestCard from '@/components/TestCard'
import CourseCard from '@/components/CourseCard'
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from '@/lib/constants'
import { MdArrowForward } from 'react-icons/md'
import Link from 'next/link'

const TEST_TYPES = [
  { value:'', label:'All' },
  { value:'FULL_MOCK', label:'Full Mocks' },
  { value:'CHAPTER', label:'Chapter Tests' },
  { value:'PYP', label:'Previous Year' },
  { value:'SPEED', label:'Speed Tests' },
  { value:'DPT', label:'Daily Practice' },
]

export default function ExamPage() {
  const { slug } = useParams()
  const [exams, setExams]     = useState([])
  const [exam, setExam]       = useState(null)
  const [tests, setTests]     = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetch('/api/exams').then(r=>r.json()).then(d=>{
      if (d.success) {
        setExams(d.data)
        const found = d.data.find(e => e.slug === slug)
        setExam(found)
        if (found) {
          Promise.all([
            fetch(`/api/tests?examId=${found.id}&limit=50`).then(r=>r.json()),
            fetch(`/api/courses?examId=${found.id}`).then(r=>r.json()),
          ]).then(([t,c]) => {
            if (t.success) setTests(t.data.tests || [])
            if (c.success) setCourses(c.data || [])
          }).finally(()=>setLoading(false))
        } else setLoading(false)
      }
    })
  }, [slug])

  const filtered = typeFilter ? tests.filter(t=>t.testType===typeFilter) : tests
  const color    = exam ? (EXAM_COLORS[exam.name] || DEFAULT_EXAM_COLOR) : DEFAULT_EXAM_COLOR

  if (!exam && !loading) return (
    <><Navbar exams={exams} /><div style={{ marginTop:68, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ textAlign:'center' }}><p style={{ fontSize:40 }}>🔍</p><p style={{ fontSize:18, fontWeight:700, marginTop:12 }}>Exam not found</p><Link href="/" className="btn-primary" style={{ marginTop:16 }}>Go Home</Link></div></div><Footer /></>
  )

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>
        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg, ${color.text} 0%, #0891B2 100%)`, padding:'48px 20px 60px' }}>
          <div className="container" style={{ textAlign:'center' }}>
            <h1 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:900, color:'white', marginBottom:8 }}>{exam?.name}</h1>
            {exam?.description && <p style={{ fontSize:16, color:'rgba(255,255,255,0.85)', maxWidth:500, margin:'0 auto' }}>{exam.description}</p>}
            <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:20 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:22, fontWeight:800, color:'white' }}>{tests.length}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Tests</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:22, fontWeight:800, color:'white' }}>{courses.length}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Courses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'24px 20px' }}>
          {/* Type filters */}
          <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
            {TEST_TYPES.map(t => (
              <button key={t.value} onClick={()=>setTypeFilter(t.value)}
                style={{ padding:'8px 18px', borderRadius:'var(--radius-full)', border:`2px solid ${typeFilter===t.value?color.text:'var(--border)'}`, background:typeFilter===t.value?color.bg:'white', color:typeFilter===t.value?color.text:'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? <div style={{ textAlign:'center', padding:60 }}><div style={{ width:40, height:40, border:'3px solid var(--primary-light)', borderTop:'3px solid var(--primary)', borderRadius:'50%', margin:'0 auto' }} className="animate-spin" /></div> : (
            <>
              {/* Tests */}
              {filtered.length > 0 && (
                <div style={{ marginBottom:40 }}>
                  <h2 style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>
                    {typeFilter ? TEST_TYPES.find(t=>t.value===typeFilter)?.label : 'All Tests'} ({filtered.length})
                  </h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
                    {filtered.map(test => <TestCard key={test.id} test={test} />)}
                  </div>
                </div>
              )}

              {/* Courses */}
              {!typeFilter && courses.length > 0 && (
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>Crash Courses ({courses.length})</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
                    {courses.map(c => <CourseCard key={c.id} course={c} />)}
                  </div>
                </div>
              )}

              {filtered.length===0 && courses.length===0 && (
                <div style={{ textAlign:'center', padding:80 }}>
                  <p style={{ fontSize:40, marginBottom:16 }}>📚</p>
                  <p style={{ fontSize:16, fontWeight:600 }}>No content available yet</p>
                  <p style={{ fontSize:14, color:'var(--text-muted)', marginTop:8 }}>Check back soon!</p>
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
