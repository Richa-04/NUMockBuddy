'use client'

import Link from 'next/link'

const VOLUNTEERS = [
  {
    initials: 'RK',
    name: 'Rohan K.',
    program: 'MSCS',
    company: 'Google',
    role: 'SWE co-op',
    skills: ['System design', 'LeetCode'],
    available: true,
    color: '#C8102E',
  },
  {
    initials: 'PM',
    name: 'Priya M.',
    program: 'MSIS',
    company: 'Fidelity',
    role: 'DS internship',
    skills: ['Behavioral', 'Finance/DS'],
    available: true,
    color: '#2563EB',
  },
  {
    initials: 'AS',
    name: 'Arjun S.',
    program: 'MSCS',
    company: 'Amazon',
    role: 'SDE co-op',
    skills: ['Amazon LP', 'STAR method'],
    available: false,
    color: '#16A34A',
  },
]

export default function VolunteersSection() {
  return (
    <section style={{ padding: '88px 24px', background: 'var(--color-gray-100)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 40,
          flexWrap: 'wrap',
          gap: 20,
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3vw, 44px)',
              fontWeight: 400,
              color: 'var(--color-black)',
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
              marginBottom: 10,
            }}>
              Learn from students who've{' '}
              <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>been there.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-gray-400)', lineHeight: 1.6, maxWidth: 480 }}>
              Book 1:1 sessions with NU students who've completed co-ops at your target company.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/volunteers" style={{
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-red)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-red)',
              whiteSpace: 'nowrap',
            }}>
              Browse Volunteers
            </Link>
            <Link href="/volunteers/join" style={{
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              background: '#fff',
              color: 'var(--color-black)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              border: '1.5px solid var(--color-gray-200)',
              whiteSpace: 'nowrap',
            }}>
              Become a Volunteer
            </Link>
          </div>
        </div>

        {/* Volunteer cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 14,
        }}>
          {VOLUNTEERS.map((v) => (
            <div
              key={v.name}
              style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: v.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {v.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-black)' }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                      {v.program} · {v.company} {v.role}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: v.available ? '#16A34A' : '#D97706',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: v.available ? '#16A34A' : '#D97706' }}>
                    {v.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {v.skills.map(s => (
                    <span key={s} style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-gray-100)',
                      border: '1px solid var(--color-gray-200)',
                      fontSize: 11, fontWeight: 600, color: 'var(--color-gray-400)',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
                <Link href="/volunteers" style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: v.available ? 'var(--color-black)' : 'var(--color-gray-100)',
                  color: v.available ? '#fff' : 'var(--color-gray-400)',
                  fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0,
                }}>
                  Request
                </Link>
              </div>
            </div>
          ))}

          {/* Join CTA card */}
          <div style={{
            background: 'var(--color-red-muted)',
            border: '1px dashed var(--color-red-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-black)', marginBottom: 4 }}>
                Done a co-op?
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>Help fellow Huskies prep</div>
            </div>
            <Link href="/volunteers/join" style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-red)',
              color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0,
              boxShadow: 'var(--shadow-red)',
            }}>
              Join now
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}