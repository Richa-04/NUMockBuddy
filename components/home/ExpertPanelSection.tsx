'use client'

import Badge from '@/components/ui/Badge'
import ScoreRing from '@/components/ui/ScoreRing'

const EXPERTS = [
  { name: 'Communication',  score: 8.0, icon: '💬', desc: 'Clarity, filler words, structure' },
  { name: 'Technical Depth', score: 6.5, icon: '⚙️', desc: 'Accuracy, edge cases, trade-offs' },
  { name: 'Problem Solving', score: 7.5, icon: '🧩', desc: 'Approach, logic, creativity' },
  { name: 'Behavioral',      score: 7.8, icon: '🎯', desc: 'STAR method, storytelling' },
  { name: 'Confidence',      score: 6.9, icon: '💪', desc: 'Tone, pace, assertiveness' },
  { name: 'Overall Judge',   score: 7.2, icon: '⚖️', desc: 'Holistic verdict + model answer' },
]

const FEEDBACK = [
  { type: 'strength', text: 'Clear walkthrough — you explained your thought process before writing code.' },
  { type: 'strength', text: 'Used a concrete edge case to validate your logic.' },
  { type: 'improve',  text: 'Complexity analysis was rushed — mention time and space explicitly before submitting.' },
  { type: 'improve',  text: '12 instances of "um/uh" detected — try pausing silently instead.' },
]

function scoreColor(score: number) {
  if (score >= 8) return '#16A34A'
  if (score >= 7) return '#D97706'
  return 'var(--color-red)'
}

export default function ExpertPanelSection() {
  return (
    <section style={{
      background: 'var(--color-black)',
      padding: '96px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 15% 50%, rgba(200,16,46,0.12) 0%, transparent 100%),
          radial-gradient(ellipse 40% 40% at 85% 30%, rgba(200,16,46,0.07) 0%, transparent 100%)
        `,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'flex-end',
          gap: 24,
          marginBottom: 52,
          flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: 560 }}>
            <Badge variant="red" style={{ marginBottom: 18 }}>
              6 Independent AI Experts · Parallel Scoring
            </Badge>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1.08,
              letterSpacing: '-1px',
              marginBottom: 14,
            }}>
              One answer. Six perspectives.
              <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}> Instant.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
              Six Claude API calls fire simultaneously — each expert scores independently,
              delivering a full panel verdict in a single request.
            </p>
          </div>

          {/* Overall score pill */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '20px 32px',
          }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>7.4</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Panel avg</span>
          </div>
        </div>

        {/* ── Expert cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 40,
        }}>
          {EXPERTS.map((expert) => (
            <div
              key={expert.name}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '22px 20px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}>
                    {expert.icon} {expert.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                    {expert.desc}
                  </span>
                </div>
                <div style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: scoreColor(expert.score),
                  lineHeight: 1,
                  letterSpacing: '-0.5px',
                  flexShrink: 0,
                }}>
                  {expert.score.toFixed(1)}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${expert.score * 10}%`,
                  background: scoreColor(expert.score),
                  borderRadius: 99,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Sample feedback ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 32px',
        }}>
          {/* Header spans both columns */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
            paddingBottom: 16,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Sample feedback
            </span>
            {['Google', 'SWE', 'Technical'].map(tag => (
              <span key={tag} style={{
                padding: '2px 8px',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 500,
              }}>
                {tag}
              </span>
            ))}
          </div>

          {FEEDBACK.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 13.5,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.55,
            }}>
              <span style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: 99,
                background: item.type === 'strength' ? 'rgba(22,163,74,0.2)' : 'rgba(200,16,46,0.15)',
                border: `1px solid ${item.type === 'strength' ? 'rgba(22,163,74,0.3)' : 'rgba(200,16,46,0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
                fontSize: 10,
                color: item.type === 'strength' ? '#16A34A' : 'var(--color-red)',
              }}>
                {item.type === 'strength' ? '✓' : '↑'}
              </span>
              <span>
                {item.type === 'strength'
                  ? <strong style={{ color: '#fff', fontWeight: 600 }}>Good — </strong>
                  : <strong style={{ color: 'var(--color-red)', fontWeight: 600 }}>Improve — </strong>
                }
                {item.text}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}