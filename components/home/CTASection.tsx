import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default function CTASection() {
  return (
   <section style={{
  padding: 'var(--space-3xl) var(--space-lg)',
  paddingBottom: '50px',
  background: 'var(--color-black)',
  position: 'relative',
  overflow: 'hidden',
}}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(200,16,46,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <Badge style={{ margin: 28, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
          Northeastern Students & Alumni
        </Badge>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 60px)',
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1.08,
          letterSpacing: '-1.2px',
          marginBottom: 24,
        }}>
          Your next co-op starts with{' '}
          <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>one practice.</span>
        </h2>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 44, maxWidth: 500, margin: '0 auto 44px' }}>
          Join Northeastern students who are using NUMockBuddy to close the gap between where they are and where they want to be.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-red)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-red)',
              letterSpacing: '-0.2px',
            }}
          >
            Sign in
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/practice"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            Try a practice session
          </Link>
        </div>

        {/* Trust line */}
     
      </div>
    </section>
  )
}