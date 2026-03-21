import Badge from '@/components/ui/Badge'
import ScoreRing from '@/components/ui/ScoreRing'

const EXPERTS = [
  { name: 'Communication', score: 8.0, icon: '💬', desc: 'Clarity, filler words, structure' },
  { name: 'Technical Depth', score: 6.5, icon: '⚙️', desc: 'Accuracy, edge cases, trade-offs' },
  { name: 'Problem Solving', score: 7.5, icon: '🧩', desc: 'Approach, logic, creativity' },
  { name: 'Behavioral', score: 7.8, icon: '🎯', desc: 'STAR method, storytelling' },
  { name: 'Confidence', score: 6.9, icon: '💪', desc: 'Tone, pace, assertiveness' },
  { name: 'Overall Judge', score: 7.2, icon: '⚖️', desc: 'Holistic verdict + model answer' },
]

export default function ExpertPanelSection() {
  return (
    <section style={{
      background: 'var(--color-black)',
      padding: 'var(--space-3xl) var(--space-lg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,16,46,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(200,16,46,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ marginBottom: 56, maxWidth: 600 }}>
          <Badge variant="red" style={{ marginBottom: 20 }}>
            6 Independent AI Experts · Parallel Scoring
          </Badge>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: 16,
          }}>
            One answer. Six perspectives.
            <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}> Instant.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Six Claude API calls fire simultaneously — each expert reviews your answer independently, delivering a complete panel score in the time it takes to run one request.
          </p>
        </div>

        {/* Expert cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 48,
        }}>
          {EXPERTS.map((expert, i) => (
            <div key={expert.name} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{expert.icon}</div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{expert.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{expert.desc}</div>
                </div>
                <ScoreRing score={expert.score} size={48} label="" />
              </div>

              {/* Mini progress bar */}
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${expert.score * 10}%`,
                  background: expert.score >= 8 ? '#16A34A' : expert.score >= 6.5 ? '#D97706' : 'var(--color-red)',
                  borderRadius: 99,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Sample feedback callout */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          maxWidth: 700,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              Sample feedback · Google · SWE · Technical
            </span>
          </div>
          {[
            { type: 'strength', text: 'Clear walkthrough — you explained your thought process before writing code.' },
            { type: 'strength', text: 'Used a concrete edge case to validate your logic.' },
            { type: 'improve', text: 'Complexity analysis was rushed — mention time and space explicitly before submitting.' },
            { type: 'improve', text: '12 instances of "um/uh" detected — try pausing silently instead.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 10,
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
            }}>
              <span style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: 99,
                background: item.type === 'strength' ? 'rgba(22,163,74,0.2)' : 'rgba(200,16,46,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}>
                <span style={{ fontSize: 10 }}>{item.type === 'strength' ? '✓' : '↑'}</span>
              </span>
              <span style={{ fontWeight: item.type === 'improve' ? 400 : 500 }}>
                {item.type === 'strength' ? <strong style={{ color: '#fff', fontWeight: 600 }}>Good — </strong> : <strong style={{ color: 'var(--color-red)', fontWeight: 600 }}>Improve — </strong>}
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}