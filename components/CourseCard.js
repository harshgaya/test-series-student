'use client'
import Link from 'next/link'
import { MdCalendarToday, MdPeople, MdArrowForward, MdPlayCircle } from 'react-icons/md'
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from '@/lib/constants'

export default function CourseCard({ course }) {
  const isFree   = Number(course.price) === 0
  const examColor = EXAM_COLORS[course.exam?.name] || DEFAULT_EXAM_COLOR
  const enrolled  = course._count?.enrollments || 0

  return (
    <Link href={`/course/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Banner */}
        <div style={{
          height: 110,
          background: `linear-gradient(135deg, ${examColor.text}dd, #0891B2cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>{course.exam?.name}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1 }}>{course.durationDays}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Day Course</p>
          </div>
          <MdPlayCircle style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)' }} />
        </div>

        <div style={{ padding: '16px 18px 18px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {isFree
              ? <span className="badge badge-free">FREE</span>
              : <span className="badge badge-paid">₹{Number(course.price)}</span>
            }
            {enrolled > 500 && <span className="badge badge-popular">🔥 Popular</span>}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4, minHeight: 40 }}>
            {course.title}
          </h3>

          {course.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {course.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <MdCalendarToday style={{ fontSize: 14 }} /> {course.durationDays} days
            </span>
            {enrolled > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <MdPeople style={{ fontSize: 14 }} /> {enrolled.toLocaleString('en-IN')} enrolled
              </span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--teal-50)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--teal-200)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-700)' }}>
              {isFree ? 'Enroll Free' : `Enroll ₹${Number(course.price)}`}
            </span>
            <MdArrowForward style={{ fontSize: 18, color: 'var(--teal-600)' }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
