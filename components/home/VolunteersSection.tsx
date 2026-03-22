import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const VOLUNTEERS = [
  {
    initials: 'RK',
    name: 'Rohan K.',
    program: 'MSCS',
    company: 'Google',
    role: 'SWE co-op',
    skills: ['System design', 'LeetCode patterns'],
    sessions: 12,
    available: true,
  },
  {
    initials: 'PM',
    name: 'Priya M.',
    program: 'MSIS',
    company: 'Fidelity',
    role: 'DS internship',
    skills: ['Behavioral', 'Finance/DS'],
    sessions: 8,
    available: true,
  },
  {
    initials: 'AS',
    name: 'Arjun S.',
    program: 'MSCS',
    company: 'Amazon',
    role: 'SDE co-op',
    skills: ['Amazon LP', 'STAR method'],
    sessions: 15,
    available: false,
  },
]

const AVATAR_COLORS = ['#C8102E', '#2563EB', '#16A34A']

export default function VolunteersSection() {
  return (
    <section style={{
      padding: 'var(--space-3xl) var(--space-lg)',
      background: 'var(--color-gray-100)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3xl)',
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <div>
            <Badge variant="red" style={{ marginBottom: 20 }}>
              Peer Volunteer Network
            </Badge>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3vw, 44px)',
              fontWeight: 400,
              color: 'var(--color-black)',
              lineHeight: 1.1,
              letterSpacing: '-0.8px',
              marginBottom: 20,
            }}>
              Learn from students who've{' '}
              <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>been there.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-gray-600)', lineHeight: 1.7, marginBottom: 28 }}>
              Returning co-op students share their firsthand knowledge of interview formats, LP questions, and what hiring managers actually look for — directly through MockMate.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                'Book a 1:1 practice session via Google Meet',
                'Get company-specific referral advice',
                'Post-session rubric stored alongside your AI scores',
                'Filter by company, role, MSIS/MSCS, and availability',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--color-gray-600)' }}>
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--color-red-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5L4.5 8L9 3" stroke="var(--color-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                href="/volunteers"
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-red)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-red)',
                }}
              >
                Browse Volunteers
              </Link>
              <Link
                href="/volunteers/join"
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-full)',
                  background: 'transparent',
                  color: 'var(--color-black)',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  border: '1.5px solid var(--color-gray-200)',
                }}
              >
                Become a Volunteer
              </Link>
            </div>
          </div>

          {/* Right: volunteer cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {VOLUNTEERS.map((v, i) => (
              <div key={v.name} style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: AVATAR_COLORS[i],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: v.available ? '#16A34A' : '#D97706',
                      animation: v.available ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{ fontSize: 12, color: v.available ? '#16A34A' : '#D97706', fontWeight: 500 }}>
                      {v.available ? 'Available' : 'Busy this week'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {v.skills.map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                  <Link
                    href="/volunteers"
                    style={{
                      padding: '7px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: v.available ? 'var(--color-black)' : 'var(--color-gray-100)',
                      color: v.available ? '#fff' : 'var(--color-gray-400)',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    Request session
                  </Link>
                </div>
              </div>
            ))}

            {/* Join CTA card */}
            <div style={{
              background: 'var(--color-red-muted)',
              border: '1px dashed var(--color-red-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-black)', marginBottom: 4 }}>
                  Done a co-op?
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  Help fellow Huskies prep
                </div>
              </div>
              <Link
                href="/volunteers/join"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-red)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-red)',
                }}
              >
                Join as volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .volunteers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}