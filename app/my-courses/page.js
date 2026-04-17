'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/enrollments').then(r => r.json()).then(d => { if (d.success) setEnrollments(d.data) }).finally(() => setLoading(false))
    fetch('/api/exams').then(r => r.json()).then(d => { if (d.success) setExams(d.data) })
  }, [])

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 68, minHeight: '100vh', background: 'var(--bg-light)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding: '40px 20px' }}>
          <div className="container"><h1 style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>My Courses</h1><p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{enrollments.length} courses enrolled</p></div>
        </div>
        <div className="container" style={{ padding: '24px 20px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>📅</p>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No courses enrolled yet</p>
              <Link href="/courses" className="btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {enrollments.map(e => (
                <div key={e.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: 8, background: `linear-gradient(90deg, var(--primary) ${(e.currentDay / e.crashCourse?.durationDays) * 100}%, var(--bg-gray) 0%)` }} />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{e.crashCourse?.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{e.crashCourse?.exam?.name} · {e.crashCourse?.durationDays} days</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Day {e.currentDay}/{e.crashCourse?.durationDays}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{Math.round((e.currentDay / e.crashCourse?.durationDays) * 100)}%</span>
                    </div>
                    <Link href={`/course/${e.crashCourse?.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }}>Continue →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
