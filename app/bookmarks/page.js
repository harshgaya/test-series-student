'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MdDelete } from 'react-icons/md'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookmark').then(r => r.json()).then(d => { if (d.success) setBookmarks(d.data) }).finally(() => setLoading(false))
    fetch('/api/exams').then(r => r.json()).then(d => { if (d.success) setExams(d.data) })
  }, [])

  async function removeBookmark(id) {
    await fetch('/api/bookmark', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: id }) })
    setBookmarks(b => b.filter(q => q.id !== id))
    toast.success('Bookmark removed')
  }

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 68, minHeight: '100vh', background: 'var(--bg-light)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding: '40px 20px' }}>
          <div className="container"><h1 style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>Bookmarks</h1><p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{bookmarks.length} questions saved</p></div>
        </div>
        <div className="container" style={{ padding: '24px 20px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🔖</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No bookmarks yet</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Bookmark questions while solving tests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookmarks.map(q => (
                <div key={q.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-full)' }}>{q.subject?.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', background: 'var(--bg-light)', color: 'var(--text-muted)', borderRadius: 'var(--radius-full)' }}>{q.chapter?.name}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.questionText?.substring(0, 120)}...</p>
                  </div>
                  <button onClick={() => removeBookmark(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 20, display: 'flex', flexShrink: 0, marginTop: 2 }}><MdDelete /></button>
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
