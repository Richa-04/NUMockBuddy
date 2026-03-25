import Badge from '@/components/ui/Badge'

const STEPS = [
  {
    number: '01',
    title: 'Set up your session',
    desc: 'Choose your target company, role type (SWE, DS, TPM, or Audit), programs, and interview format. MockMate builds a session specifically for your target.',
    tags: ['Google', 'SWE', 'Technical'],
  },
  {
    number: '02',
    title: 'Answer like it\'s real',
    desc: 'Respond via text, or turn on video mode with your camera and mic. A Monaco Editor opens for coding questions. The AI is watching for filler words and expression in real time.',
    tags: ['Video mode', 'Monaco IDE', 'Live transcription'],
  },
  {
    number: '03',
    title: 'Get your panel verdict',
    desc: 'Six independent AI experts score your answer simultaneously, covering communication, technical depth, behavioral framing, confidence, and more. Plus a model answer to compare.',
    tags: ['6 experts', 'Score /10', 'Model answer'],
  },
  {
    number: '04',
    title: 'Track and improve',
    desc: 'Every session feeds your performance dashboard. Your daily question card is seeded from your weakest skills. Over time, the data shows you exactly where you\'re improving.',
    tags: ['Weak area trends', 'Daily card', 'Session history'],
  },
]

export default function HowItWorksSection() {
  return (
    <section style={{
      padding: 'var(--space-3xl) var(--space-lg)',
      background: '#fff',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 60 }}>
          <Badge variant="default" style={{ marginBottom: 20 }}>
            Simple 4-step flow
          </Badge>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 400,
            color: 'var(--color-black)',
            lineHeight: 1.1,
            letterSpacing: '-0.8px',
          }}>
            From setup to feedback in{' '}
            <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>minutes.</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: 0,
                position: 'relative',
              }}
            >
              {/* Left: number + connector line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: i === 0 ? '2px solid var(--color-red)' : '2px solid var(--color-gray-200)',
                  background: i === 0 ? 'var(--color-red-muted)' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  color: i === 0 ? 'var(--color-red)' : 'var(--color-gray-400)',
                  flexShrink: 0,
                  zIndex: 1,
                  position: 'relative',
                }}>
                  {step.number}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 1,
                    flex: 1,
                    minHeight: 40,
                    background: 'var(--color-gray-200)',
                    marginTop: 4,
                    marginBottom: 4,
                  }} />
                )}
              </div>

              {/* Right: content */}
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 40 : 0, paddingLeft: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-black)', marginBottom: 10, lineHeight: 1.3 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--color-gray-600)', lineHeight: 1.7, marginBottom: 16, maxWidth: 580 }}>
                  {step.desc}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {step.tags.map(tag => (
                    <Badge key={tag} variant={i === 0 ? 'red' : 'default'}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}