'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MdArrowForward } from 'react-icons/md'

export default function MyTestsPage() {
  const [purchases, setPurchases] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/purchases').then(r => r.json()).then(d => { if (d.success) setPurchases(d.data) }).finally(() => setLoading(false))
    fetch('/api/exams').then(r => r.json()).then(d => { if (d.success) setExams(d.data) })
  }, [])

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 68, minHeight: '100vh', background: 'var(--bg-light)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding: '40px 20px' }}>
          <div className="container"><h1 style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>My Tests</h1><p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{purchases.length} tests purchased</p></div>
        </div>
        <div className="container" style={{ padding: '24px 20px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : purchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>📋</p>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No tests purchased yet</p>
              <Link href="/browse" className="btn-primary">Browse Tests</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {purchases.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{p.test?.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{p.test?.durationMins} min · {p.test?.totalMarks} marks</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Purchased: {new Date(p.purchasedAt).toLocaleDateString('en-IN')}</p>
                  <Link href={`/test/${p.test?.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }}>Attempt Now →</Link>
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
