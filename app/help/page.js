import Link from 'next/link'
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from '@/lib/constants'

const FAQS = [
  { q: 'I paid but the test is not unlocked?', a: 'Please wait 30 seconds and refresh. If still not unlocked, click the WhatsApp support button with your order ID.' },
  { q: 'My test was auto-submitted?', a: 'This happens when the timer runs out or you switch tabs 3 times. Your answers until that point are saved.' },
  { q: 'Can I reattempt a test?', a: 'Yes! You can attempt any test unlimited times. Each attempt is scored separately.' },
  { q: 'How does All India Rank work?', a: 'After submitting a test, your score is compared with all students who attempted the same test. Rank updates in real time.' },
  { q: 'How do I get a refund?', a: 'We offer refunds within 24 hours of purchase if you have not attempted the test. Contact WhatsApp support.' },
]

export default function HelpPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '80px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Help & Support</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40 }}>We're here to help you succeed</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
          <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ flex: 1, minWidth: 200, padding: '20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-lg)', textDecoration: 'none', textAlign: 'center' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#16A34A' }}>WhatsApp Support</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Fastest response</p>
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ flex: 1, minWidth: 200, padding: '20px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', textAlign: 'center' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>📧</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>Email Support</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Response in 24 hours</p>
          </a>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <details key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px 20px', cursor: 'pointer' }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q} <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>{faq.a}</p>
            </details>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/" style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
