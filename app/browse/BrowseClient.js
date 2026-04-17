'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TestCard from '@/components/TestCard'
import CourseCard from '@/components/CourseCard'
import { MdSearch, MdFilterList, MdClose } from 'react-icons/md'
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from '@/lib/constants'

const TEST_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULL_MOCK', label: 'Full Mock' },
  { value: 'CHAPTER', label: 'Chapter Test' },
  { value: 'TOPIC', label: 'Topic Test' },
  { value: 'PYP', label: 'Previous Year' },
  { value: 'SPEED', label: 'Speed Test' },
  { value: 'DPT', label: 'Daily Practice' },
  { value: 'NTA_SIMULATOR', label: 'NTA Simulator' },
]

export default function BrowseClient({ exams, subjects, tests, courses }) {
  const searchParams = useSearchParams()

  const [tab, setTab]           = useState('tests')  // tests | courses
  const [search, setSearch]     = useState('')
  const [filterExam, setFilterExam] = useState(searchParams.get('exam') || '')
  const [filterType, setFilterType] = useState(searchParams.get('type') || '')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterFree, setFilterFree] = useState(searchParams.get('free') === 'true')
  const [sortBy, setSortBy]     = useState('popular')

  const filteredSubjects = filterExam
    ? subjects.filter(s => s.examId === parseInt(filterExam))
    : subjects

  const filteredTests = useMemo(() => {
    let result = tests.filter(t => {
      if (filterExam && t.exam?.id !== parseInt(filterExam)) return false
      if (filterType && t.testType !== filterType) return false
      if (filterSubject && t.subjectId !== parseInt(filterSubject)) return false
      if (filterFree && Number(t.price) !== 0) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    if (sortBy === 'popular') result.sort((a, b) => (b._count?.attempts || 0) - (a._count?.attempts || 0))
    if (sortBy === 'latest')  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'price-low')  result.sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price))
    return result
  }, [tests, filterExam, filterType, filterSubject, filterFree, search, sortBy])

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (filterExam && c.exam?.id !== parseInt(filterExam)) return false
      if (filterFree && Number(c.price) !== 0) return false
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [courses, filterExam, filterFree, search])

  function clearFilters() {
    setFilterExam(''); setFilterType(''); setFilterSubject(''); setFilterFree(false); setSearch('')
  }

  const hasFilters = filterExam || filterType || filterSubject || filterFree || search

  return (
    <>
      <Navbar exams={exams} />
      <div style={{ marginTop: 68, minHeight: '100vh', background: 'var(--bg-light)' }}>

        {/* Page header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding: '40px 20px' }}>
          <div className="container">
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: 'white', marginBottom: 8 }}>Browse Tests & Courses</h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{tests.length} tests · {courses.length} courses available</p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480, marginTop: 24 }}>
              <MdSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#94A3B8' }} />
              <input
                className="input-field"
                placeholder="Search tests, courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 42, background: 'white' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                  <MdClose />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }} className="browse-layout">

            {/* Filters sidebar */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', position: 'sticky', top: 88 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600 }}>Clear all</button>
                )}
              </div>

              {/* Free only */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                <input type="checkbox" checked={filterFree} onChange={e => setFilterFree(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Free Only</span>
              </label>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

              {/* Exam filter */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Exam</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                <button onClick={() => setFilterExam('')} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: !filterExam ? 'var(--primary-light)' : 'transparent', color: !filterExam ? 'var(--primary-dark)' : 'var(--text-secondary)', fontSize: 13, fontWeight: !filterExam ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)' }}>All Exams</button>
                {exams.map(exam => (
                  <button key={exam.id} onClick={() => setFilterExam(String(exam.id))}
                    style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: filterExam === String(exam.id) ? 'var(--primary-light)' : 'transparent', color: filterExam === String(exam.id) ? 'var(--primary-dark)' : 'var(--text-secondary)', fontSize: 13, fontWeight: filterExam === String(exam.id) ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    {exam.name}
                  </button>
                ))}
              </div>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

              {/* Type filter */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Test Type</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TEST_TYPES.map(type => (
                  <button key={type.value} onClick={() => setFilterType(type.value)}
                    style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: filterType === type.value ? 'var(--primary-light)' : 'transparent', color: filterType === type.value ? 'var(--primary-dark)' : 'var(--text-secondary)', fontSize: 13, fontWeight: filterType === type.value ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 'var(--radius-full)', padding: 4, border: '1px solid var(--border)', marginBottom: 20, width: 'fit-content' }}>
                {[
                  { value: 'tests', label: `Tests (${filteredTests.length})` },
                  { value: 'courses', label: `Courses (${filteredCourses.length})` },
                ].map(t => (
                  <button key={t.value} onClick={() => setTab(t.value)}
                    style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', border: 'none', background: tab === t.value ? 'var(--primary)' : 'transparent', color: tab === t.value ? 'white' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.2s' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text-secondary)', background: 'white', cursor: 'pointer' }}>
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Results */}
              {tab === 'tests' && (
                filteredTests.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {filteredTests.map(test => <TestCard key={test.id} test={test} />)}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No tests found</p>
                    <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</p>
                    {hasFilters && <button onClick={clearFilters} className="btn-primary" style={{ marginTop: 16 }}>Clear Filters</button>}
                  </div>
                )
              )}

              {tab === 'courses' && (
                filteredCourses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 40, marginBottom: 16 }}>📚</p>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No courses found</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .browse-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  )
}
