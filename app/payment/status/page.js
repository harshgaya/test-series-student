'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MdCheckCircle, MdWarning } from 'react-icons/md'
import { SUPPORT_WHATSAPP } from '@/lib/constants'

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const orderId      = searchParams.get('orderId')
  const [status, setStatus] = useState('checking')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!orderId) { router.push('/'); return }
    checkStatus()
    const interval = setInterval(() => {
      setAttempts(a => {
        if (a >= 12) { clearInterval(interval); return a }
        checkStatus()
        return a + 1
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  async function checkStatus() {
    try {
      const res = await fetch('/api/payment/check-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })
      const d   = await res.json()
      if (d.success) setStatus(d.data.status)
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px 32px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>

        {status === 'SUCCESS' ? (
          <>
            <div style={{ width: 72, height: 72, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}><MdCheckCircle style={{ color: '#16A34A' }} /></div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Payment Successful! 🎉</h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>Your purchase is confirmed. You can now access your test or course.</p>
            <Link href="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>Go to Dashboard →</Link>
          </>
        ) : status === 'checking' || status === 'PENDING' ? (
          <>
            <div style={{ width: 60, height: 60, border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', margin: '0 auto 20px' }} className="animate-spin" />
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Verifying Payment...</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Please wait. Do not close this page.</p>
            <button onClick={checkStatus} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>Check Now</button>
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Payment not reflecting. Order ID: ${orderId}`} target="_blank" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block' }}>Contact WhatsApp Support</a>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}><MdWarning style={{ color: '#DC2626' }} /></div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#DC2626', marginBottom: 8 }}>Payment Failed</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Your payment could not be processed. No amount was charged.</p>
            <Link href="/browse" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>Try Again</Link>
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" style={{ fontSize: 13, color: 'var(--primary)', display: 'block' }}>Need help? WhatsApp us</a>
          </>
        )}
      </div>
    </div>
  )
}
