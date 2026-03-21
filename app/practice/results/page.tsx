'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK = {
  overallScore: 7,
  verdict: 'Good' as 'Strong' | 'Good' | 'Needs Work' | 'Incomplete',
  company: 'Google',
  role: 'SWE',
  interviewType: 'Technical',
  jobType: 'Internship / Co-op',

  expertScores: [
    {
      name: 'Communication',
      score: 8,
      feedback: 'Explained your approach clearly and stayed concise throughout.',
      accent: '#2563eb',
      bg: '#eff6ff',
    },
    {
      name: 'Technical',
      score: 7,
      feedback: 'Solid understanding of core concepts; missed one edge case.',
      accent: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      name: 'Problem-Solving',
      score: 6,
      feedback: 'Good structure but needed a nudge before considering the optimal path.',
      accent: '#0891b2',
      bg: '#ecfeff',
    },
    {
      name: 'Behavioral',
      score: 8,
      feedback: 'Used STAR format naturally; examples were specific and relevant.',
      accent: '#059669',
      bg: '#ecfdf5',
    },
    {
      name: 'Confidence',
      score: 7,
      feedback: 'Steady pace and tone; slight hesitation when challenged on complexity.',
      accent: '#d97706',
      bg: '#fffbeb',
    },
    {
      name: 'Overall',
      score: 7,
      feedback: 'A well-rounded response that demonstrates real readiness.',
      accent: '#c8102e',
      bg: '#fff1f2',
    },
  ],

  strengths: [
    'Clearly articulated time and space complexity upfront.',
    'Walked through a concrete example before jumping to code.',
    'Handled the follow-up question on scalability confidently.',
  ],

  improvements: [
    'Did not consider the edge case of an empty input array.',
    'Solution could be optimised from O(n²) to O(n) with a hash map.',
    'Pause to verify your logic aloud before writing code.',
  ],

  summary:
    'You demonstrated solid fundamentals and communicated your thinking well throughout the session. The main area to focus on is edge-case coverage — interviewers at this level will always probe boundary conditions. With a bit more practice on optimal data structures you will be in great shape.',

  question: 'Given an array of integers, return the indices of the two numbers that add up to a given target.',

  modelAnswer: `A brute-force O(n²) nested loop works, but the optimal approach uses a hash map for O(n) time and O(n) space.

def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}                        # value → index
    for i, num in enumerate(nums):
        complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
    return []                        # no solution found

Key points to mention in an interview:
• Check for the complement before inserting so you don't use the same element twice.
• Handle the empty-array edge case (returns [] gracefully).
• Time: O(n)  |  Space: O(n)`,
}

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Strong:      { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  Good:        { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  'Needs Work':{ bg: '#ffedd5', color: '#c2410c', border: '#fdba74' },
  Incomplete:  { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const pct = score / 10
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={60} cy={60} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={8} />
        <circle
          cx={60} cy={60} r={r}
          fill="none"
          stroke="var(--color-red)"
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-black)', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>/10</span>
      </div>
    </div>
  )
}

function MiniBar({ score, accent }: { score: number; accent: string }) {
  return (
    <div style={{
      height: 6, borderRadius: 3,
      background: 'var(--color-gray-200)',
      overflow: 'hidden', marginTop: 8,
    }}>
      <div style={{
        height: '100%',
        width: `${score * 10}%`,
        borderRadius: 3,
        background: accent,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Prefer URL params, fall back to mock
  const company      = searchParams.get('company')       || MOCK.company
  const role         = searchParams.get('role')          || MOCK.role
  const interviewType= searchParams.get('interviewType') || MOCK.interviewType
  const jobType      = searchParams.get('jobType')       || MOCK.jobType

  const verdict = MOCK.verdict
  const verdictStyle = VERDICT_STYLES[verdict]

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'var(--space-3xl)',
      paddingBottom: 'var(--space-3xl)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      background: '#fff',
      minHeight: '100vh',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
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
        position: 'absolute', top: -120, right: '15%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── 1. Overall Score ── */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 32px',
            background: '#fff',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 24,
            }}>
              Interview Complete
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <ScoreRing score={MOCK.overallScore} />
            </div>

            <h1 style={{
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 700,
              color: 'var(--color-black)',
              marginBottom: 12,
            }}>
              Overall Score: {MOCK.overallScore}/10
            </h1>

            {/* Verdict badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <span style={{
                display: 'inline-block',
                padding: '5px 18px',
                borderRadius: 'var(--radius-full)',
                background: verdictStyle.bg,
                color: verdictStyle.color,
                border: `1.5px solid ${verdictStyle.border}`,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}>
                {verdict}
              </span>
            </div>

            {/* Session meta pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[company, role, interviewType, jobType].map(tag => (
                <span key={tag} style={{
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-gray-200)',
                  fontSize: 13,
                  color: 'var(--color-gray-600)',
                  background: 'var(--color-gray-100, #f9fafb)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── 2. Expert Scores ── */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            background: '#fff',
            marginBottom: 32,
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 600,
              color: 'var(--color-black)', marginBottom: 24,
            }}>
              Expert Scores
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}>
              {MOCK.expertScores.map(expert => (
                <div key={expert.name} style={{
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${expert.accent}22`,
                  background: expert.bg,
                  padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: expert.accent, textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {expert.name}
                    </span>
                    <span style={{
                      fontSize: 22, fontWeight: 700,
                      color: expert.accent,
                    }}>
                      {expert.score}<span style={{ fontSize: 13, fontWeight: 500, color: `${expert.accent}99` }}>/10</span>
                    </span>
                  </div>
                  <MiniBar score={expert.score} accent={expert.accent} />
                  <p style={{
                    fontSize: 13, color: 'var(--color-gray-700)',
                    marginTop: 10, lineHeight: 1.5, margin: '10px 0 0',
                  }}>
                    {expert.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Feedback ── */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            background: '#fff',
            marginBottom: 32,
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 600,
              color: 'var(--color-black)', marginBottom: 24,
            }}>
              Feedback
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              marginBottom: 24,
            }}>
              {/* Strengths */}
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#15803d',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
                }}>
                  Strengths
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MOCK.strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#dcfce7', color: '#15803d',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, flexShrink: 0, marginTop: 1,
                      }}>
                        ✓
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.5 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to improve */}
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#c2410c',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
                }}>
                  Areas to Improve
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MOCK.improvements.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#ffedd5', color: '#c2410c',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, flexShrink: 0, marginTop: 1,
                      }}>
                        !
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.5 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              borderTop: '1px solid var(--color-gray-200)',
              paddingTop: 20,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--color-gray-500)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
              }}>
                Summary
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.7, margin: 0 }}>
                {MOCK.summary}
              </p>
            </div>
          </div>

          {/* ── 4. Model Answer ── */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            background: '#fff',
            marginBottom: 48,
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 600,
              color: 'var(--color-black)', marginBottom: 8,
            }}>
              Model Answer
            </h2>

            <div style={{
              fontSize: 13, color: 'var(--color-gray-500)',
              marginBottom: 20,
            }}>
              Question asked:
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-gray-100, #f9fafb)',
              border: '1px solid var(--color-gray-200)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-black)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              {MOCK.question}
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid #1e293b',
            }}>
              {/* Code block header */}
              <div style={{
                background: '#1e293b',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                  python
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ef4444', '#facc15', '#4ade80'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
              </div>
              <pre style={{
                margin: 0,
                padding: '20px 20px',
                background: '#0f172a',
                color: '#e2e8f0',
                fontSize: 13,
                lineHeight: 1.7,
                overflowX: 'auto',
                fontFamily: 'var(--font-mono, "Fira Code", "Cascadia Code", monospace)',
                whiteSpace: 'pre-wrap',
              }}>
                {MOCK.modelAnswer}
              </pre>
            </div>
          </div>

          {/* ── 5. Bottom Buttons ── */}
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Button variant="outline" size="lg" href="/practice">
              Practice Again
            </Button>
            <Button variant="primary" size="lg" href="/dashboard">
              View Dashboard
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
