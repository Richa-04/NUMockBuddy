'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExpertScore {
  name: string
  score: number
  feedback: string
  accent: string
  bg: string
}

interface ScoreResult {
  overallScore: number
  verdict: 'Strong' | 'Good' | 'Needs Work' | 'Incomplete'
  expertScores: ExpertScore[]
  strengths: string[]
  improvements: string[]
  summary: string
  modelAnswers: Array<{ question: string; language: string; answer: string }>
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

  const [sessionData, setSessionData] = useState({
    company: '',
    role: '',
    interviewType: '',
    jobType: '',
  })

  const [result, setResult] = useState<ScoreResult | null>(null)
  const [modelAnswers, setModelAnswers] = useState<ScoreResult['modelAnswers']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [fillerBreakdown, setFillerBreakdown] = useState<Record<string, number>>({})

  useEffect(() => {
    const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]')
    const answers   = JSON.parse(sessionStorage.getItem('interviewAnswers')   || '[]')

    setAnsweredCount(Number(sessionStorage.getItem('answeredCount') ?? 0))
    setSkippedCount(Number(sessionStorage.getItem('skippedCount') ?? 0))

    const c  = sessionStorage.getItem('interviewCompany')  || 'General'
    const r  = sessionStorage.getItem('interviewRole')     || 'SWE'
    const it = sessionStorage.getItem('interviewType')     || 'Technical'
    const jt = sessionStorage.getItem('interviewJobType')  || 'Internship / Co-op'
    setSessionData({ company: c, role: r, interviewType: it, jobType: jt })

    const breakdown: Record<string, number> = JSON.parse(sessionStorage.getItem('fillerBreakdown') || '{}')
    setFillerBreakdown(breakdown)
    const totalFillerCount = Object.values(breakdown).reduce((s, c) => s + c, 0)
    const selectedLanguage = sessionStorage.getItem('selectedLanguage') || 'python'

    fetch('/api/practice/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, answers, company: c, role: r, interviewType: it, jobType: jt, totalFillerCount, selectedLanguage }),
    })
      .then(res => res.json())
      .then(data => {
        // Always capture model answers if present, regardless of scoring errors
        if (data.modelAnswers?.length) setModelAnswers(data.modelAnswers)
        if (data.error) setError(data.error)
        else setResult(data)
      })
      .catch(err => setError(err.message ?? 'Failed to score interview'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verdict = result?.verdict ?? 'Good'
  const verdictStyle = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.Good

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

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(255,255,255,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, zIndex: 50,
        }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: '50%',
            border: '3px solid var(--color-gray-200)',
            borderTopColor: 'var(--color-red)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-black)', margin: 0 }}>
            Scoring your interview…
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', margin: 0 }}>
            6 expert evaluators are reviewing your answers
          </p>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Error state */}
          {error && (
            <div style={{
              padding: 24, borderRadius: 'var(--radius-lg)',
              background: '#fef2f2', border: '1px solid #fecaca',
              marginBottom: 32, fontSize: 14, color: '#b91c1c',
            }}>
              <strong>Failed to score interview:</strong> {error}
            </div>
          )}

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
              fontSize: 13, fontWeight: 600,
              color: 'var(--color-gray-500)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 24,
            }}>
              Interview Complete
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <ScoreRing score={result?.overallScore ?? 0} />
            </div>

            <h1 style={{
              fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700,
              color: 'var(--color-black)', marginBottom: 12,
            }}>
              Overall Score: {result?.overallScore ?? '—'}/10
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
                fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              }}>
                {result?.verdict ?? '—'}
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: 'var(--color-gray-500)' }}>Total: {answeredCount + skippedCount}</span>
              <span style={{ color: 'var(--color-gray-300)' }}>|</span>
              <span style={{ color: '#15803d' }}>✅ {answeredCount} Answered</span>
              <span style={{ color: 'var(--color-gray-300)' }}>|</span>
              <span style={{ color: '#b45309' }}>⏭️ {skippedCount} Skipped</span>
            </div>

            {/* Session meta pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[sessionData.company, sessionData.role, sessionData.interviewType, sessionData.jobType].filter(Boolean).map(tag => (
                <span key={tag} style={{
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-gray-200)',
                  fontSize: 13, color: 'var(--color-gray-600)',
                  background: 'var(--color-gray-100, #f9fafb)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── 2. Expert Scores ── */}
          {result && (
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 32, background: '#fff', marginBottom: 32,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', marginBottom: 24 }}>
                Expert Scores
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}>
                {result.expertScores.map(expert => (
                  <div key={expert.name} style={{
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${expert.accent}22`,
                    background: expert.bg,
                    padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: expert.accent,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {expert.name}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: expert.accent }}>
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
          )}

          {/* ── 3. Feedback ── */}
          {result && (
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 32, background: '#fff', marginBottom: 32,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', marginBottom: 24 }}>
                Feedback
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24, marginBottom: 24,
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
                    {result.strengths.map((s, i) => (
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
                    {result.improvements.map((s, i) => (
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
              <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: 20 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--color-gray-500)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                }}>
                  Summary
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-gray-700)', lineHeight: 1.7, margin: 0 }}>
                  {result.summary}
                </p>
              </div>
            </div>
          )}

          {/* ── 4. Speech Analysis ── always shown */}
          {(() => {
            const totalFillers = Object.values(fillerBreakdown).reduce((s, c) => s + c, 0)
            const topFillers = Object.entries(fillerBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
            return (
              <div style={{
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 32, background: '#fff', marginBottom: 32,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', marginBottom: 8 }}>
                  Speech Analysis
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 20 }}>
                  Based on your spoken answers
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: topFillers.length > 0 ? 20 : 0,
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: totalFillers > 15 ? '#fff7ed' : totalFillers > 5 ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${totalFillers > 15 ? '#fed7aa' : totalFillers > 5 ? '#fde68a' : '#bbf7d0'}`,
                }}>
                  <div>
                    <div style={{
                      fontSize: 22, fontWeight: 700,
                      color: totalFillers > 15 ? '#c2410c' : totalFillers > 5 ? '#b45309' : '#15803d',
                    }}>
                      {totalFillers} filler word{totalFillers !== 1 ? 's' : ''} detected
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2 }}>
                      {totalFillers > 15
                        ? 'High — try slowing down and using pauses instead'
                        : totalFillers > 5
                        ? 'Moderate — a few fillers is normal, aim to reduce'
                        : totalFillers > 0
                        ? 'Low — great job speaking clearly!'
                        : 'No filler words detected'}
                    </div>
                  </div>
                </div>

                {topFillers.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                      Most Used
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {topFillers.map(([word, count]) => (
                        <span key={word} style={{
                          padding: '5px 14px',
                          borderRadius: 'var(--radius-full)',
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          fontSize: 13, fontWeight: 600, color: '#b91c1c',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          &ldquo;{word}&rdquo;
                          <span style={{
                            background: '#b91c1c', color: '#fff',
                            borderRadius: 'var(--radius-full)',
                            padding: '1px 7px', fontSize: 11, fontWeight: 700,
                          }}>
                            ×{count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })()}

          {/* ── 5. Model Answers ── always shown once available */}
          {modelAnswers.length > 0 && (
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              background: '#fff', marginBottom: 48, overflow: 'hidden',
            }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-gray-200)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', margin: 0 }}>
                  Model Answers
                </h2>
              </div>

              {/* Carousel */}
              <div style={{ padding: '24px 32px' }}>
                {(() => {
                  const item = modelAnswers[carouselIndex]
                  const total = modelAnswers.length
                  if (!item) return null
                  return (
                    <>
                      {/* Card with nav arrows */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        {/* Left arrow */}
                        <button
                          onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                          disabled={carouselIndex === 0}
                          style={{
                            flexShrink: 0, marginTop: 8,
                            width: 36, height: 36, borderRadius: '50%',
                            border: '1.5px solid var(--color-gray-200)',
                            background: carouselIndex === 0 ? 'var(--color-gray-100)' : '#fff',
                            color: carouselIndex === 0 ? 'var(--color-gray-300)' : 'var(--color-black)',
                            cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 600, transition: 'all 0.15s ease',
                          }}
                        >
                          ‹
                        </button>

                        {/* Card */}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 16 }}>
                            <div style={{
                              fontSize: 11, fontWeight: 700, color: 'var(--color-red)',
                              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                            }}>
                              Question {carouselIndex + 1} of {total}
                            </div>
                            <p style={{
                              fontSize: 15, fontWeight: 500,
                              color: 'var(--color-black)', lineHeight: 1.5, margin: 0,
                            }}>
                              {item.question}
                            </p>
                          </div>

                          {/* Code block for Technical, plain text for everything else */}
                          {sessionData.interviewType === 'Technical' ? (
                            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #1e293b' }}>
                              <div style={{
                                background: '#1e293b', padding: '10px 16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              }}>
                                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                                  {item.language}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {['#ef4444', '#facc15', '#4ade80'].map(c => (
                                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                  ))}
                                </div>
                              </div>
                              <pre style={{
                                margin: 0, padding: '20px',
                                background: '#0f172a', color: '#e2e8f0',
                                fontSize: 13, lineHeight: 1.7, overflowX: 'auto',
                                fontFamily: 'var(--font-mono, "Fira Code", "Cascadia Code", monospace)',
                                whiteSpace: 'pre-wrap',
                              }}>
                                {item.answer}
                              </pre>
                            </div>
                          ) : (
                            <div style={{
                              padding: '16px 20px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-gray-200)',
                              background: 'var(--color-gray-100, #f9fafb)',
                              fontSize: 14,
                              lineHeight: 1.7,
                              color: 'var(--color-gray-700)',
                            }}>
                              {item.answer}
                            </div>
                          )}
                        </div>

                        {/* Right arrow */}
                        <button
                          onClick={() => setCarouselIndex(i => Math.min(total - 1, i + 1))}
                          disabled={carouselIndex === total - 1}
                          style={{
                            flexShrink: 0, marginTop: 8,
                            width: 36, height: 36, borderRadius: '50%',
                            border: '1.5px solid var(--color-gray-200)',
                            background: carouselIndex === total - 1 ? 'var(--color-gray-100)' : '#fff',
                            color: carouselIndex === total - 1 ? 'var(--color-gray-300)' : 'var(--color-black)',
                            cursor: carouselIndex === total - 1 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 600, transition: 'all 0.15s ease',
                          }}
                        >
                          ›
                        </button>
                      </div>

                      {/* Dots */}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                        {Array.from({ length: total }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            style={{
                              width: idx === carouselIndex ? 20 : 8,
                              height: 8, borderRadius: 4,
                              background: idx === carouselIndex ? 'var(--color-red)' : 'var(--color-gray-300)',
                              border: 'none', cursor: 'pointer', padding: 0,
                              transition: 'all 0.2s ease',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* ── 6. Bottom Buttons ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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
