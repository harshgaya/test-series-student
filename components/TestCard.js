'use client'
import Link from 'next/link'
import { MdPeople, MdTimer, MdArrowForward } from 'react-icons/md'
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from '@/lib/constants'

const TYPE_LABELS = {
  FULL_MOCK:'Full Mock', CHAPTER:'Chapter Test', TOPIC:'Topic Test',
  PYP:'Previous Year', SPEED:'Speed Test', DPT:'Daily Practice',
  LIVE:'Live Exam', SECTIONAL:'Sectional', NTA_SIMULATOR:'NTA Simulator',
  MICRO:'Micro Test', CONCEPT:'Concept Test', DIFFICULTY_LADDER:'Difficulty Ladder',
  SUBJECT:'Subject Test', FREE:'Free Test', SCHOLARSHIP:'Scholarship',
}

export default function TestCard({ test }) {
  const isFree   = Number(test.price) === 0
  const examColor = EXAM_COLORS[test.exam?.name] || DEFAULT_EXAM_COLOR
  const typeLabel = TYPE_LABELS[test.testType] || test.testType?.replace(/_/g,' ')
  const qCount    = test._count?.testQuestions || 0
  const attempts  = test._count?.attempts || test.attemptCount || 0

  return (
    <Link href={`/test/${test.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Top accent line */}
        <div style={{ height: 3, background: isFree ? 'linear-gradient(90deg, var(--teal-400), var(--teal-600))' : 'linear-gradient(90deg, var(--orange-400), var(--orange-600))' }} />

        <div style={{ padding: '18px 18px 16px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 8px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: examColor.bg, color: examColor.text }}>
              {test.exam?.name}
            </span>
            <span style={{ padding: '3px 8px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
              {typeLabel}
            </span>
            {isFree
              ? <span className="badge badge-free">FREE</span>
              : <span className="badge badge-paid">₹{Number(test.price)}</span>
            }
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.4, minHeight: 40 }}>
            {test.title}
          </h3>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--gray-50)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {[
              { label: 'Questions', value: qCount },
              { label: 'Duration',  value: `${test.durationMins}m` },
              { label: 'Marks',     value: test.totalMarks },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '10px 6px',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Attempt count */}
          {attempts > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MdPeople style={{ fontSize: 14 }} />
              {attempts.toLocaleString('en-IN')} students attempted
            </p>
          )}

          {/* CTA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: isFree ? 'var(--teal-50)' : '#FFF7ED',
            borderRadius: 'var(--r-lg)',
            border: `1px solid ${isFree ? 'var(--teal-200)' : '#FED7AA'}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isFree ? 'var(--teal-700)' : 'var(--orange-600)' }}>
              {isFree ? 'Attempt Free' : `Buy ₹${Number(test.price)}`}
            </span>
            <MdArrowForward style={{ fontSize: 18, color: isFree ? 'var(--teal-600)' : 'var(--orange-500)' }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
