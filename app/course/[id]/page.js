'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'
import toast from 'react-hot-toast'
import { MdArrowBack, MdCalendarToday, MdPeople, MdLock, MdCheckCircle, MdPlayCircle, MdPictureAsPdf, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { SUPPORT_WHATSAPP } from '@/lib/constants'

export default function CoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData]         = useState(null)
  const [exams, setExams]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState(false)
  const [tab, setTab]           = useState('content')
  const [showLogin, setShowLogin] = useState(false)
  const [openFaq, setOpenFaq]   = useState(null)

  useEffect(() => {
    fetch(`/api/courses/${id}`).then(r=>r.json()).then(d=>{ if(d.success) setData(d.data) }).finally(()=>setLoading(false))
    fetch('/api/exams').then(r=>r.json()).then(d=>{ if(d.success) setExams(d.data) })
  }, [id])

  async function handleEnroll() {
    const student = localStorage.getItem('iitneet_student')
    if (!student) { setShowLogin(true); return }
    const { course } = data
    if (Number(course.price) === 0) {
      const res = await fetch('/api/payment/create-order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ courseId: id }) })
      const d   = await res.json()
      if (!d.success && d.error === 'This item is free — no payment needed') {
        // Enroll directly for free
        toast.success('Enrolled successfully!')
        router.push('/my-courses')
        return
      }
    }
    setPaying(true)
    try {
      const res  = await fetch('/api/payment/create-order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ courseId: id }) })
      const d    = await res.json()
      if (!d.success) { toast.error(d.error); return }
      const opts = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      d.data.amount,
        currency:    'INR',
        name:        'IIT NEET',
        description: d.data.description,
        order_id:    d.data.orderId,
        handler: async function(response) {
          const vres = await fetch('/api/payment/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(response) })
          const vd   = await vres.json()
          if (vd.success) { toast.success('Enrolled!'); router.push(`/payment/status?orderId=${d.data.orderId}`) }
          else toast.error('Payment failed')
        },
        theme: { color: '#0D9488' },
      }
      new window.Razorpay(opts).open()
    } catch { toast.error('Something went wrong') }
    finally { setPaying(false) }
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:40, height:40, border:'3px solid var(--primary-light)', borderTop:'3px solid var(--primary)', borderRadius:'50%' }} className="animate-spin" /></div>
  if (!data)   return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p>Course not found</p></div>

  const { course, enrolled, currentDay, completedDays } = data
  const isFree    = Number(course.price) === 0
  const enrolled2 = enrolled

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onSuccess={()=>{ setShowLogin(false); handleEnroll() }} />}
      <Navbar exams={exams} />
      <div style={{ marginTop:68, minHeight:'100vh', background:'var(--bg-light)' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg, var(--primary) 0%, #0891B2 100%)', padding:'40px 20px 80px' }}>
          <div className="container">
            <Link href="/courses" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.8)', textDecoration:'none', fontSize:14, marginBottom:20 }}><MdArrowBack/> All Courses</Link>
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ padding:'4px 12px', background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:600, color:'white' }}>{course.exam?.name}</span>
              <span style={{ padding:'4px 12px', background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:600, color:'white' }}>{course.durationDays} Days</span>
              {isFree && <span style={{ padding:'4px 12px', background:'#22C55E', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:700, color:'white' }}>FREE</span>}
            </div>
            <h1 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:900, color:'white', marginBottom:8 }}>{course.title}</h1>
            {course.description && <p style={{ fontSize:15, color:'rgba(255,255,255,0.85)', maxWidth:560 }}>{course.description}</p>}
            <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <MdCalendarToday style={{ color:'rgba(255,255,255,0.7)', fontSize:16 }} />
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.9)' }}>{course.durationDays} days</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <MdPeople style={{ color:'rgba(255,255,255,0.7)', fontSize:16 }} />
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.9)' }}>{course._count?.enrollments || 0} enrolled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'0 20px', marginTop:-40 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }} className="course-layout">

            {/* Main content */}
            <div>
              {/* Tabs */}
              <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden', marginBottom:20 }}>
                <div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
                  {[['content','Course Content'],['features','Key Features'],['faqs','FAQs']].map(([v,l]) => (
                    <button key={v} onClick={()=>setTab(v)} style={{ flex:1, padding:'14px 8px', border:'none', background:'none', fontSize:13, fontWeight:tab===v?700:500, color:tab===v?'var(--primary)':'var(--text-secondary)', borderBottom:tab===v?'2px solid var(--primary)':'2px solid transparent', cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.2s' }}>{l}</button>
                  ))}
                </div>

                {/* Course Content tab */}
                {tab==='content' && (
                  <div style={{ padding:24 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--text-secondary)', marginBottom:16 }}>{course.courseTests?.length || 0} days · {course.durationDays} total</p>
                    {course.courseTests?.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:14 }}>Course content will be updated soon.</p>}
                    {course.courseTests?.map((ct, i) => {
                      const done = completedDays.includes(ct.dayNumber)
                      const locked = !enrolled2 || (ct.dayNumber > (currentDay || 1) && !done)
                      const isToday = enrolled2 && ct.dayNumber === (currentDay || 1)
                      return (
                        <div key={ct.id} style={{ display:'flex', gap:14, padding:'14px 0', borderBottom: i < course.courseTests.length-1 ? '1px solid var(--border)' : 'none', opacity: locked ? 0.6 : 1 }}>
                          <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background: done ? 'var(--success-light)' : isToday ? 'var(--primary-light)' : 'var(--bg-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {done ? <MdCheckCircle style={{ color:'var(--success)', fontSize:20 }} /> : locked ? <MdLock style={{ color:'var(--text-muted)', fontSize:18 }} /> : <span style={{ fontSize:13, fontWeight:800, color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>D{ct.dayNumber}</span>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Day {ct.dayNumber} {ct.topicName && `— ${ct.topicName}`}</p>
                              {isToday && <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', background:'var(--primary)', color:'white', borderRadius:'var(--radius-full)' }}>TODAY</span>}
                              {done && <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', background:'var(--success-light)', color:'var(--success)', borderRadius:'var(--radius-full)' }}>DONE</span>}
                            </div>
                            {ct.test && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{ct.test.title} · {ct.test._count?.testQuestions || 0} questions · {ct.test.durationMins} min</p>}
                            <div style={{ display:'flex', gap:10, marginTop:6 }}>
                              {ct.notesUrl && <a href={ct.notesUrl} target="_blank" style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--error)', textDecoration:'none' }}><MdPictureAsPdf/> Notes PDF</a>}
                              {ct.videoUrl && <a href={ct.videoUrl} target="_blank" style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--primary)', textDecoration:'none' }}><MdPlayCircle/> Video Lecture</a>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Key Features tab */}
                {tab==='features' && (
                  <div style={{ padding:24 }}>
                    {[
                      { icon:'🎥', title:'Video Solutions', desc:'Every question explained with detailed video solution' },
                      { icon:'📄', title:'PDF Notes', desc:'Downloadable notes for every day of the course' },
                      { icon:'🏆', title:'All India Rank', desc:'Know your rank after every test among all students' },
                      { icon:'📊', title:'Performance Analysis', desc:'Detailed subject and chapter wise breakdown' },
                      { icon:'🔄', title:'Reattempt Unlimited', desc:'Attempt each test as many times as you want' },
                      { icon:'🎯', title:'Day by Day Plan', desc:'Structured learning — unlock each day progressively' },
                    ].map((f,i) => (
                      <div key={i} style={{ display:'flex', gap:14, padding:'14px 0', borderBottom: i<5?'1px solid var(--border)':'none' }}>
                        <span style={{ fontSize:24, flexShrink:0 }}>{f.icon}</span>
                        <div>
                          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>{f.title}</p>
                          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FAQs tab */}
                {tab==='faqs' && (
                  <div style={{ padding:24 }}>
                    {[
                      { q:'Can I attempt tests after the course ends?', a:'Yes! All tests remain accessible forever after enrollment.' },
                      { q:'What if I miss a day?', a:'You can complete days at your own pace. Each day unlocks after the previous one is completed.' },
                      { q:'Is refund available?', a:'Refunds are available within 24 hours if you have not accessed any content.' },
                      { q:'Can I use this alongside my coaching?', a:'Absolutely! This course is designed to complement your existing preparation.' },
                      { q:'Will I get video lectures?', a:'Yes, each day has a video lecture link along with the practice test and PDF notes.' },
                    ].map((faq,i) => (
                      <div key={i} style={{ borderBottom: i<4?'1px solid var(--border)':'none' }}>
                        <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)', textAlign:'left' }}>
                          <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{faq.q}</span>
                          {openFaq===i ? <MdExpandLess style={{ color:'var(--primary)', fontSize:22, flexShrink:0 }} /> : <MdExpandMore style={{ color:'var(--text-muted)', fontSize:22, flexShrink:0 }} />}
                        </button>
                        {openFaq===i && <p style={{ fontSize:13, color:'var(--text-secondary)', paddingBottom:16, lineHeight:1.6 }}>{faq.a}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position:'sticky', top:88 }}>
              <div style={{ background:'white', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ padding:'20px', borderBottom:'1px solid var(--border)' }}>
                  {isFree ? <p style={{ fontSize:20, fontWeight:800, color:'var(--success)' }}>FREE</p> : (
                    <div>
                      <p style={{ fontSize:26, fontWeight:900, color:'var(--text-primary)' }}>₹{Number(course.price)}</p>
                      {course.originalPrice && <p style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'line-through' }}>₹{Number(course.originalPrice)}</p>}
                    </div>
                  )}
                </div>
                <div style={{ padding:20 }}>
                  {enrolled2 ? (
                    <Link href="/my-courses" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15 }}>Continue Course →</Link>
                  ) : (
                    <button onClick={handleEnroll} disabled={paying} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15 }}>
                      {paying ? 'Processing...' : isFree ? 'Enroll Free →' : `Enroll Now ₹${Number(course.price)}`}
                    </button>
                  )}
                  <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ display:'block', textAlign:'center', marginTop:12, fontSize:13, color:'var(--text-muted)', textDecoration:'none' }}>Need help? WhatsApp us</a>
                </div>
                <div style={{ padding:'0 20px 20px' }}>
                  {[`${course.durationDays} day structured plan`, 'Video solutions every question', 'PDF notes every day', 'All India Rank', 'Completion certificate'].map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <MdCheckCircle style={{ color:'var(--success)', fontSize:16, flexShrink:0 }} />
                      <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.course-layout{grid-template-columns:1fr!important}}`}</style>
      <Footer />
    </>
  )
}
