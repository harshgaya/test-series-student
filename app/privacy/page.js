import Link from 'next/link'
export default function PrivacyPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-light)', padding:'80px 20px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Privacy Policy</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Last updated: January 2026</p>
        {[
          { title:'Information We Collect', body:'We collect your name, phone number, and exam preferences when you register. We also collect test performance data to improve your experience.' },
          { title:'How We Use It', body:'Your data is used to personalize your learning experience, show relevant tests, and generate performance analytics. We never sell your data.' },
          { title:'Data Security', body:'All data is stored securely on Supabase servers. Passwords are hashed. Payments are handled by Razorpay.' },
          { title:'Cookies', body:'We use cookies for authentication (JWT token). We do not use advertising cookies.' },
          { title:'Third Parties', body:'We use Razorpay for payments and Supabase for database. Both comply with data protection standards.' },
          { title:'Your Rights', body:'You can request deletion of your account and data by contacting support via WhatsApp.' },
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
