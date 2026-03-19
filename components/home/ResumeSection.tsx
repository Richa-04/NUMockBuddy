import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const GAPS = [
  { label: 'Missing: Quantified impact on 3 bullet points', severity: 'high' },
  { label: 'System design experience not highlighted', severity: 'medium' },
  { label: 'No mention of distributed systems for L4 SWE role', severity: 'high' },
  { label: 'Leadership section recommended for senior IC roles', severity: 'low' },
]

const SEVERITY_COLORS: Record<string, string> = {
  high: 'var(--color-red)',
  medium: '#D97706',
  low: '#2563EB',
}

export default function ResumeSection() {
  return (
    <section style={{
      padding: 'var(--space-3xl) var(--space-lg)',
      background: '#fff',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3xl)',
          alignItems: 'center',
        }}>
          {/* Left: mock UI */}
          <div style={{
            background: 'var(--color-gray-100)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            position: 'relative',
          }}>
            {/* Fake browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <div style={{
                marginLeft: 8,
                flex: 1,
                height: 22,
                background: '#fff',
                borderRadius: 6,
                border: '1px solid var(--color-gray-200)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>mockmate.nu.edu/resume</span>
              </div>
            </div>

            {/* Drop zone */}
            <div style={{
              border: '1.5px dashed var(--color-gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: 16,
              background: '#fff',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-black)', marginBottom: 4 }}>Paste your resume</div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>or drag and drop your PDF</div>
            </div>

            {/* Role selector */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--color-gray-600)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>Google · L4 Software Engineer</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>

            <div style={{
              background: 'var(--color-red)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '9px 0',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}>
              Analyze gaps →
            </div>

            {/* Gap results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
                Gaps identified
              </div>
              {GAPS.map(gap => (
                <div key={gap.label} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  background: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray-200)',
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: SEVERITY_COLORS[gap.severity],
                    flexShrink: 0,
                    marginTop: 4,
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--color-gray-600)', lineHeight: 1.5 }}>{gap.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <Badge variant="default" style={{ marginBottom: 20 }}>
              AI Resume Analyzer
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
              Know exactly what's{' '}
              <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>missing.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-gray-600)', lineHeight: 1.7, marginBottom: 28 }}>
              Paste your resume, select your target role, and Claude identifies the specific gaps that would flag it at your target company. No generic advice — role-specific analysis for SWE, DS, TPM, and more.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {[
                { color: SEVERITY_COLORS.high, label: 'High-impact gaps' },
                { color: SEVERITY_COLORS.medium, label: 'Medium-impact improvements' },
                { color: SEVERITY_COLORS.low, label: 'Low-priority suggestions' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-gray-600)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/resume"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
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
              Analyze my resume
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}