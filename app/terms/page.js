import Link from 'next/link'
export default function TermsPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-light)', padding:'80px 20px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Terms of Use</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Last updated: January 2026</p>
        {[
          { title:'Acceptance', body:'By using IIT NEET, you agree to these terms. If you do not agree, please do not use our platform.' },
          { title:'Use of Platform', body:'IIT NEET is an educational platform for NEET, JEE and EAMCET preparation. You may not misuse, copy, or distribute our content.' },
          { title:'Account', body:'You are responsible for maintaining confidentiality of your account. One account per student.' },
          { title:'Payments', body:'All payments are processed securely via Razorpay. Prices are in INR and inclusive of GST where applicable.' },
          { title:'Refunds', body:'Refunds are available within 24 hours of purchase if no content has been accessed. Contact support via WhatsApp.' },
          { title:'Content', body:'All questions, solutions and course content are owned by IIT NEET. Unauthorized copying is prohibited.' },
          { title:'Changes', body:'We may update these terms at any time. Continued use constitutes acceptance of changes.' },
        ].map((s,i) => (
          <div key={i} style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{i+1}. {s.title}</h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.7 }}>{s.body}</p>
          </div>
        ))}
        <Link href="/" style={{ color:'var(--primary)', textDecoration:'none', fontSize:14 }}>← Back to Home</Link>
      </div>
    </div>
  )
}
