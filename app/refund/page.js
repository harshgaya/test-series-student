import Link from 'next/link'
import { SUPPORT_WHATSAPP } from '@/lib/constants'
export default function RefundPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-light)', padding:'80px 20px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Refund Policy</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Last updated: January 2026</p>
        {[
          { title:'Eligibility', body:'You are eligible for a full refund if you request within 24 hours of purchase AND have not accessed any test, course content, or solutions.' },
          { title:'Non-refundable Cases', body:'Once you have attempted a test or accessed course content, the purchase is non-refundable.' },
          { title:'How to Request', body:'Contact us on WhatsApp with your order ID within 24 hours. We will process your refund within 5-7 business days.' },
          { title:'Processing Time', body:'Refunds are processed within 5-7 business days and credited back to the original payment method.' },
        ].map((s,i) => (
          <div key={i} style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{i+1}. {s.title}</h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.7 }}>{s.body}</p>
          </div>
        ))}
        <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ display:'inline-block', marginTop:16, padding:'12px 24px', background:'#22C55E', color:'white', borderRadius:'var(--radius-full)', textDecoration:'none', fontSize:14, fontWeight:600 }}>Contact Support on WhatsApp</a>
        <div style={{ marginTop:20 }}>
          <Link href="/" style={{ color:'var(--primary)', textDecoration:'none', fontSize:14 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
