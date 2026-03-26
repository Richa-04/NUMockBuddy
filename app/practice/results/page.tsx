'use client'

import { useState, useEffect, useRef } from 'react'
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
  verdict: 'Strong' | 'Very Good' | 'Good' | 'Needs Work' | 'Incomplete'
  expertScores: ExpertScore[]
  strengths: string[]
  improvements: string[]
  summary: string
  modelAnswers: Array<{ question: string; language: string; answer: string }>
}

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Strong:      { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  'Very Good': { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
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

// ─── Model Answer Formatter ───────────────────────────────────────────────────

function FormattedModelAnswer({
  answer,
  interviewType,
  language,
}: {
  answer: string
  interviewType: string
  language?: string
}) {
  if (interviewType === 'Technical') {
    return (
      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <div style={{
          background: '#1e293b', padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
            {language ?? 'python'}
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
          {answer}
        </pre>
      </div>
    )
  }

  // Parse lines and render with structure
  const lines = answer.split('\n')

  const STAR_HEADERS = new Set(['situation', 'task', 'action', 'result'])
  const DESIGN_HEADERS = new Set([
    'requirements', 'high level architecture', 'architecture',
    'key components', 'components', 'trade-offs', 'trade-offs & challenges',
    'scalability', 'data flow', 'api design',
  ])
  const headerSet = interviewType === 'System Design' ? DESIGN_HEADERS
    : interviewType === 'Behavioral' ? STAR_HEADERS
    : new Set<string>()

  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) { elements.push(<div key={i} style={{ height: 6 }} />); i++; continue }

    // Strip markdown bold markers, trailing colon
    const cleaned = trimmed.replace(/^\*\*|\*\*:?$|:$/g, '').replace(/\*\*/g, '').trim()
    const lower = cleaned.toLowerCase()

    // Section header detection
    const isHeader =
      headerSet.has(lower) ||
      (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
      (trimmed.endsWith(':') && trimmed.length < 60 && !/^[-•]/.test(trimmed))

    if (isHeader) {
      elements.push(
        <div key={i} style={{
          fontWeight: 700, fontSize: 12,
          color: 'var(--color-red)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginTop: elements.length > 0 ? 16 : 0,
          marginBottom: 6,
          paddingBottom: 4,
          borderBottom: '1px solid var(--color-gray-200)',
        }}>
          {cleaned}
        </div>
      )
      i++; continue
    }

    // Numbered or bulleted list item
    if (/^[-•*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '')
      // Handle inline **bold**
      const parts = text.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, paddingLeft: 4, marginBottom: 4, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--color-red)', fontWeight: 700, flexShrink: 0, lineHeight: '22px' }}>•</span>
          <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-gray-700)' }}>
            {parts.map((p, j) =>
              p.startsWith('**')
                ? <strong key={j}>{p.replace(/\*\*/g, '')}</strong>
                : p
            )}
          </span>
        </div>
      )
      i++; continue
    }

    // Inline bold text in a paragraph
    if (trimmed.includes('**')) {
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={i} style={{ margin: '4px 0', fontSize: 14, lineHeight: 1.7, color: 'var(--color-gray-700)' }}>
          {parts.map((p, j) =>
            p.startsWith('**')
              ? <strong key={j}>{p.replace(/\*\*/g, '')}</strong>
              : p
          )}
        </p>
      )
      i++; continue
    }

    elements.push(
      <p key={i} style={{ margin: '4px 0', fontSize: 14, lineHeight: 1.7, color: 'var(--color-gray-700)' }}>
        {trimmed}
      </p>
    )
    i++
  }

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-gray-200)',
      background: 'var(--color-gray-100, #f9fafb)',
    }}>
      {elements}
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
  const [totalRepeatedCount, setTotalRepeatedCount] = useState(0)
  const [architectureDiagrams, setArchitectureDiagrams] = useState<Record<number, { text: string; loading: boolean }>>({})
  const [questions, setQuestions] = useState<string[]>([])
  const [videoAnalysis, setVideoAnalysis] = useState<{
    eyeContact:  { score: number; tip: string }
    confidence:  { score: number; tip: string }
    engagement:  { score: number; tip: string }
  } | null>(null)
  const [videoAnalysisLoading, setVideoAnalysisLoading] = useState(false)
  const [allSaved, setAllSaved] = useState(false)
  const practiceSessionId  = useRef<string | null>(null)
  const pendingVideoScores = useRef<{ eyeContact: number; confidence: number; engagement: number } | null>(null)
  const scoringDoneRef     = useRef(false)
  const videoSaveDoneRef   = useRef(false)
  const videoSaveFiredRef  = useRef(false)

  function checkAllSaved() {
    if (scoringDoneRef.current && videoSaveDoneRef.current) setAllSaved(true)
  }

  // When both sessionId and video scores are available, persist video scores
  function maybeSaveVideoScores(sid: string | null, scores: typeof pendingVideoScores.current) {
    if (!sid || !scores) return
    if (videoSaveFiredRef.current) return
    videoSaveFiredRef.current = true
    fetch('/api/practice/update-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, ...scores }),
    })
      .catch(() => {})
      .finally(() => { videoSaveDoneRef.current = true; checkAllSaved() })
  }

  useEffect(() => {
    // Clear dedup flag at the very start of every results page load so a fresh
    // session is always saved, even if the user navigated here without going
    // through the session page (e.g. browser back from dashboard).
    sessionStorage.removeItem('practiceSessionSaved')

    const controller = new AbortController()

    const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]') as string[]
    const answers   = JSON.parse(sessionStorage.getItem('interviewAnswers')   || '[]')
    setQuestions(questions)

    setAnsweredCount(Number(sessionStorage.getItem('answeredCount') ?? 0))
    setSkippedCount(Number(sessionStorage.getItem('skippedCount') ?? 0))

    const c  = sessionStorage.getItem('interviewCompany')  || 'General'
    const r  = sessionStorage.getItem('interviewRole')     || 'SWE'
    const it = sessionStorage.getItem('interviewType')     || 'Technical'
    const jt = sessionStorage.getItem('interviewJobType')  || 'Internship / Co-op'
    setSessionData({ company: c, role: r, interviewType: it, jobType: jt })

    const breakdown: Record<string, number> = JSON.parse(sessionStorage.getItem('fillerBreakdown') || '{}')
    setFillerBreakdown(breakdown)
    setTotalRepeatedCount(Number(sessionStorage.getItem('repeatedCount') ?? 0))
    const totalFillerCount = Object.values(breakdown).reduce((s, c) => s + c, 0)
    const selectedLanguage = sessionStorage.getItem('selectedLanguage') || 'python'

    // Video / body language analysis
    const frames: string[] = JSON.parse(sessionStorage.getItem('videoFrames') || '[]')
    if (frames.length > 0) {
      setVideoAnalysisLoading(true)
      fetch('/api/practice/video-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames }),
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            videoSaveDoneRef.current = true; checkAllSaved(); return
          }
          setVideoAnalysis(data)
          const scores = {
            eyeContact:  data.eyeContact.score,
            confidence:  data.confidence.score,
            engagement:  data.engagement.score,
          }
          // Only save if at least one score > 0 (all-zero = no face detected, not worth persisting)
          const hasRealScores = scores.eyeContact > 0 || scores.confidence > 0 || scores.engagement > 0
          if (!hasRealScores) {
            videoSaveDoneRef.current = true; checkAllSaved(); return
          }
          pendingVideoScores.current = scores
          // Save immediately if sessionId is already known; otherwise wait for score API
          maybeSaveVideoScores(practiceSessionId.current, scores)
        })
        .catch(() => { videoSaveDoneRef.current = true; checkAllSaved() })
        .finally(() => setVideoAnalysisLoading(false))
    } else {
      // No video frames — nothing to save, video side is immediately done
      videoSaveDoneRef.current = true
    }

    // Dedup guard: first StrictMode effect sets this flag synchronously;
    // second effect sees it and skips the DB save.
    const alreadySaved = !!sessionStorage.getItem('practiceSessionSaved')
    if (!alreadySaved) sessionStorage.setItem('practiceSessionSaved', '1')

    // No AbortController on this fetch — Effect 1 must complete so saveToDB:true reaches
    // the server. Effect 2 will also complete but with saveToDB:false, so only one DB save.
    fetch('/api/practice/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions, answers,
        company: c, role: r, interviewType: it, jobType: jt,
        totalFillerCount, selectedLanguage,
        answeredCount: Number(sessionStorage.getItem('answeredCount') ?? 0),
        skippedCount:  Number(sessionStorage.getItem('skippedCount')  ?? 0),
        totalRepeated: Number(sessionStorage.getItem('repeatedCount') ?? 0),
        saveToDB: !alreadySaved,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.modelAnswers?.length) setModelAnswers(data.modelAnswers)
        if (data.error) setError(data.error)
        else setResult(data)
        // Store sessionId and save video scores if they already arrived
        if (data.sessionId) {
          practiceSessionId.current = data.sessionId
          maybeSaveVideoScores(data.sessionId, pendingVideoScores.current)
        } else if (!videoSaveFiredRef.current) {
          // No sessionId returned (dedup or error) and video save hasn't fired —
          // nothing to update, mark video side done so allSaved can complete.
          videoSaveDoneRef.current = true
        }
        setLoading(false)
        scoringDoneRef.current = true
        checkAllSaved()
      })
      .catch(err => {
        setError(err.message ?? 'Failed to score interview')
        setLoading(false)
        // Scoring failed — no sessionId will ever arrive, unblock allSaved.
        if (!videoSaveFiredRef.current) videoSaveDoneRef.current = true
        scoringDoneRef.current = true
        checkAllSaved()
      })

    return () => controller.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch architecture diagram for current System Design question if not yet loaded
  useEffect(() => {
    if (sessionData.interviewType !== 'System Design') return
    const question = questions[carouselIndex]
    if (!question) return
    if (architectureDiagrams[carouselIndex] !== undefined) return

    setArchitectureDiagrams(prev => ({ ...prev, [carouselIndex]: { text: '', loading: true } }))
    fetch('/api/practice/architecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
      .then(res => res.json())
      .then(data => {
        setArchitectureDiagrams(prev => ({
          ...prev,
          [carouselIndex]: { text: data.diagram ?? '', loading: false },
        }))
      })
      .catch(() => {
        setArchitectureDiagrams(prev => ({
          ...prev,
          [carouselIndex]: { text: 'Failed to generate diagram.', loading: false },
        }))
      })
  }, [carouselIndex, sessionData.interviewType, questions]) // eslint-disable-line react-hooks/exhaustive-deps

  const splitDiagram = (raw: string): { diagram: string; prose: string } => {
    const lines = raw
      .split('\n')
      .filter(line => !/^```/.test(line.trim()))
    const splitAt = lines.findIndex(line => /^\s*\*\*/.test(line))
    if (splitAt === -1) return { diagram: lines.join('\n').trim(), prose: '' }
    return {
      diagram: lines.slice(0, splitAt).join('\n').trim(),
      prose: lines.slice(splitAt).join('\n').trim(),
    }
  }

  const renderWithBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
  }

  const renderProse = (text: string) =>
    text.split('\n').map((line, i) => (
      <p key={i} style={{ margin: '4px 0', fontSize: 13, lineHeight: 1.7, color: 'var(--color-gray-700)', fontFamily: 'var(--font-body)' }}>
        {renderWithBold(line)}
      </p>
    ))

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
      <style>{`
        @media (max-width: 768px) {
          .results-section { padding-left: 16px !important; padding-right: 16px !important; }
          .results-stats-row { flex-wrap: wrap !important; gap: 8px !important; font-size: 12px !important; }
          .results-card { padding: 20px 16px !important; }
          .results-action-btns { flex-direction: column !important; }
          .results-action-btns > * { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
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

      {!loading && <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: '48px', marginTop: '48px' }}>

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
            const repeated = totalRepeatedCount
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
                      {repeated > 0 && (
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#15803d', marginLeft: 12 }}>
                          · {repeated} repeated
                        </span>
                      )}
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

          {/* ── 5. Body Language Analysis ── shown when frames were captured */}
          {(videoAnalysisLoading || videoAnalysis) && (
            <div style={{
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 32, background: '#fff', marginBottom: 32,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', marginBottom: 8 }}>
                Body Language Analysis
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 20 }}>
                Based on your video during the interview
              </p>

              {videoAnalysisLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-gray-500)', fontSize: 14 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid var(--color-gray-200)',
                    borderTopColor: 'var(--color-red)',
                    animation: 'spin 0.7s linear infinite', flexShrink: 0,
                  }} />
                  Analysing your body language…
                </div>
              ) : videoAnalysis && (() => {
                const allZero = videoAnalysis.eyeContact.score === 0 && videoAnalysis.confidence.score === 0 && videoAnalysis.engagement.score === 0
                if (allZero) return (
                  <div style={{ padding: '16px', background: '#fafafa', borderRadius: 8, border: '1px solid var(--color-gray-200)', fontSize: 13, color: 'var(--color-gray-500)' }}>
                    Face not detected in video frames. Ensure your camera is on and your face is clearly visible for body language analysis.
                  </div>
                )
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {([
                      { key: 'eyeContact',  label: 'Eye Contact',  icon: '👁️' },
                      { key: 'confidence',  label: 'Confidence',   icon: '💪' },
                      { key: 'engagement',  label: 'Engagement',   icon: '⚡' },
                    ] as const).map(({ key, label, icon }) => {
                      const { score, tip } = videoAnalysis[key]
                      const pct = (score / 10) * 100
                      const barColor = score >= 7 ? '#16a34a' : score >= 5 ? '#d97706' : '#dc2626'
                      return (
                        <div key={key}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-black)' }}>
                              {icon} {label}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: barColor }}>{score}/10</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-gray-200)', marginBottom: 6 }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: barColor, transition: 'width 0.4s ease' }} />
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--color-gray-600)', margin: 0 }}>{tip}</p>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── 6. Model Answers ── always shown once available */}
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

                            {/* Ideal Architecture diagram (System Design only) */}
                          {sessionData.interviewType === 'System Design' && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{
                                fontSize: 12, fontWeight: 700, color: 'var(--color-gray-500)',
                                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                              }}>
                                Ideal Architecture
                              </div>
                              {architectureDiagrams[carouselIndex]?.loading ? (
                                <div style={{
                                  padding: '16px 20px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--color-gray-200)',
                                  background: '#f8fafc',
                                  fontSize: 13, color: 'var(--color-gray-400)', textAlign: 'center',
                                }}>
                                  Generating architecture diagram…
                                </div>
                              ) : architectureDiagrams[carouselIndex]?.text ? (
                                (() => {
                                  const { diagram, prose } = splitDiagram(architectureDiagrams[carouselIndex].text)
                                  return (
                                    <div>
                                      <pre style={{
                                        margin: 0,
                                        padding: '16px 20px',
                                        borderRadius: prose ? '8px 8px 0 0' : 'var(--radius-md)',
                                        border: '1px solid var(--color-gray-200)',
                                        borderBottom: prose ? 'none' : '1px solid var(--color-gray-200)',
                                        background: '#f8fafc',
                                        fontSize: 13, lineHeight: 1.7,
                                        color: 'var(--color-gray-700)',
                                        fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                                        whiteSpace: 'pre-wrap',
                                        overflowX: 'auto',
                                      }}>
                                        {diagram}
                                      </pre>
                                      {prose && (
                                        <div style={{
                                          padding: '12px 20px 16px',
                                          borderRadius: '0 0 8px 8px',
                                          border: '1px solid var(--color-gray-200)',
                                          borderTop: '1px solid var(--color-gray-200)',
                                          background: '#ffffff',
                                        }}>
                                          {renderProse(prose)}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })()
                              ) : (
                                <div style={{
                                  padding: '16px 20px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px dashed var(--color-gray-300)',
                                  background: '#f8fafc',
                                  fontSize: 13, color: 'var(--color-gray-400)', textAlign: 'center',
                                }}>
                                  Architecture diagram will appear here
                                </div>
                              )}
                            </div>
                          )}

                          {/* Model answer label */}
                          <div style={{
                            fontSize: 12, fontWeight: 700, color: 'var(--color-gray-500)',
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                          }}>
                            Model Answer
                          </div>

                          <FormattedModelAnswer
                            answer={item.answer}
                            interviewType={sessionData.interviewType}
                            language={item.language}
                          />
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

          {/* ── 7. Bottom Buttons ── */}
          {!allSaved && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginBottom: 16, fontSize: 13, color: 'var(--color-gray-400)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" strokeLinecap="round"/>
              </svg>
              Saving results…
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Button variant="outline" size="lg" href="/practice">
              Practice Again
            </Button>
            <Button
              variant="primary"
              size="lg"
              href={allSaved ? '/dashboard' : undefined}
              disabled={!allSaved}
            >
              {allSaved ? 'View Dashboard' : 'Saving…'}
            </Button>
          </div>

        </div>
      </div>}
    </section>
  )
}
