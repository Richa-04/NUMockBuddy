'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'

const COMPANIES = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Fidelity', 'Salesforce', 'Adobe']

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '50px',
      paddingBottom: 'var(--space-3xl)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      background: '#fff',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .hero-content-container { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--color-gray-200) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-gray-200) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {/* Red glow orb */}
      <div style={{
        position: 'absolute',
        top: -120,
        right: '15%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="hero-content-container" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 780 }}>
          {/* Eyebrow badge */}
          <div className="animate-fade-up animate-delay-1" style={{ marginBottom: 24 }}>
            <Badge variant="red">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-red)', display: 'inline-block', marginRight: 6, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              Built for Northeastern Students and Alumni
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up animate-delay-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-1.5px',
              color: 'var(--color-black)',
              marginBottom: 28,
            }}
          >
            Ace your interviews{' '}
            <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>with AI</span>{' '}
            on your side.
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-up animate-delay-3"
            style={{
              fontSize: 18,
              color: 'var(--color-gray-600)',
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: 40,
            }}
          >
            NUMockBuddy gives you realistic interview questions based on actual company patterns,
            instant feedback from 6 AI expert reviewers, and direct access to NU students
            who've already landed your dream co-op.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up animate-delay-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/practice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-red)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-red)',
                transition: 'all 0.15s ease',
              }}
            >
              Start Practicing Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/volunteers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                color: 'var(--color-black)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                border: '1.5px solid var(--color-gray-200)',
                transition: 'all 0.15s ease',
              }}
            >
              Find a Peer Mentor
            </Link>
          </div>

          {/* Trust stats */}
          <div
            className="animate-fade-up animate-delay-5"
            style={{
              marginTop: 56,
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '400+', label: 'Mock sessions done' },
              { value: '6', label: 'AI expert reviewers' },
              { value: '30+', label: 'Companies covered' },
              { value: '4.8★', label: 'Avg student rating' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-black)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company logos strip */}
        <div
          className="animate-fade-up animate-delay-6"
          style={{ marginTop: 64, overflow: 'hidden', paddingBottom: '48px'}}
        >
          <p style={{ fontSize: 12, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500, marginBottom: 16 }}>
            Interview patterns from companies that hire NU students
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {COMPANIES.map(c => (
              <Link key={c} href="/companies"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-gray-600)',
                  textDecoration: 'none',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: '1.5px solid var(--color-gray-200)',
                  background: '#fff',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-red)'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'var(--color-red)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = 'var(--color-gray-600)'
                  e.currentTarget.style.borderColor = 'var(--color-gray-200)'
                }}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}