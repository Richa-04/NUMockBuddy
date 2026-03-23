'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'so', 'right', 'yeah', 'okay', 'kind of', 'sort of',
]

function countFillerWords(text: string): Record<string, number> {
  const lower = text.toLowerCase()
  const counts: Record<string, number> = {}
  for (const filler of FILLER_WORDS) {
    const escaped = filler.replace(/ /g, '\\s+')
    const regex = new RegExp(`\\b${escaped}\\b`, 'g')
    const matches = lower.match(regex)
    if (matches && matches.length > 0) counts[filler] = matches.length
  }
  return counts
}

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}


export default function InterviewSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [interviewType, setInterviewType] = useState('')
  const [jobType, setJobType] = useState('')
  
  const [questions, setQuestions] = useState<string[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [language, setLanguage] = useState('python')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [videoActive, setVideoActive] = useState(false)
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([])
  const [answeredIndices, setAnsweredIndices] = useState<number[]>([])
  const [skippedIndices, setSkippedIndices] = useState<number[]>([])
  const [isListening, setIsListening] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [fillerBreakdown, setFillerBreakdown] = useState<Record<string, number>>({})

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRef = useRef<any>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const shouldListenRef = useRef(false)
  const isSpeechOnlyRef = useRef(false)

  // Load params from URL and fetch questions
  useEffect(() => {
    const c = searchParams.get('company') || 'General'
    const r = searchParams.get('role') || 'SWE'
    const it = searchParams.get('interviewType') || 'Technical'
    const jt = searchParams.get('jobType') || 'Internship / Co-op'

    setCompany(c)
    setRole(r)
    setInterviewType(it)
    setJobType(jt)

    setQuestionsLoading(true)
    setQuestionsError(null)
    fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: c, role: r, interviewType: it, jobType: jt }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setQuestionsError(data.error)
        } else {
          setQuestions(data.questions ?? [])
        }
      })
      .catch(err => setQuestionsError(err.message ?? 'Failed to load questions'))
      .finally(() => setQuestionsLoading(false))
  }, [searchParams])

  // Initialize camera + stop on unmount (covers all client-side navigation)
  useEffect(() => {
    // `cancelled` prevents orphaned streams in React Strict Mode.
    // Strict Mode runs every effect twice (mount → cleanup → remount).
    // The cleanup fires before the first getUserMedia promise resolves,
    // so without this flag both promises would resolve and create two streams —
    // only the second lands in streamRef, leaving the first orphaned and keeping
    // the camera light on even after "End Interview" stops the second stream.
    let cancelled = false

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setVideoActive(true)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Camera access denied:', err)
          setVideoActive(false)
        }
      }
    }

    initCamera()

    return () => {
      cancelled = true
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }
      const tracks = streamRef.current?.getTracks() ?? []
      tracks.forEach(track => {
        track.enabled = false
        track.stop()
      })
      streamRef.current = null
      // Stop mic whenever camera stops
      shouldListenRef.current = false
      speechRef.current?.abort()
      speechRef.current = null
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
  }, [])

  // Stop camera on tab close / browser refresh (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const tracks = streamRef.current?.getTracks() ?? []
      tracks.forEach(track => {
        track.enabled = false
        track.stop()
      })
      shouldListenRef.current = false
      speechRef.current?.abort()
      speechRef.current = null
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Timer — only starts once questions have loaded
  useEffect(() => {
    if (questionsLoading) return
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [questionsLoading])

  // Clear transcript when moving to a new question
  useEffect(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [currentQuestionIndex])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      speechRef.current?.abort()
      speechRef.current = null
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
  }, [])

  const startSpeech = async () => {
    if (micEnabled) return

    // Trigger Chrome's mic permission dialog via getUserMedia and hold the stream
    let audioStream: MediaStream
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = audioStream
    } catch {
      return // user denied mic
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }) => {
      let interim = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) finalText += r[0].transcript + ' '
        else interim += r[0].transcript
      }
      setInterimTranscript(interim)
      if (finalText) {
        setTranscript(prev => prev + finalText)
        if (isSpeechOnlyRef.current) setAnswer(prev => prev + finalText)
      }
    }

    recognition.onend = () => {
      setInterimTranscript('')
      if (shouldListenRef.current) {
        try { recognition.start() } catch { /* already starting */ }
      } else {
        setIsListening(false)
      }
    }

    shouldListenRef.current = true
    speechRef.current = recognition
    recognition.start()
    setIsListening(true)
    setMicEnabled(true)
  }

  const currentQuestion = questions[currentQuestionIndex] ?? ''
  const totalQuestions = questions.length || 5
  const allAnswered = questions.length > 0 && submittedAnswers.length === questions.length

  const isTechnicalCode = interviewType === 'Technical' && (role === 'SWE' || role === 'Data Science')
  const isSpeechOnly = interviewType === 'Behavioral' || interviewType === 'HR'
  const isSystemDesign = interviewType === 'System Design'

  // Keep isSpeechOnlyRef in sync so the recognition handler (closed over on mount) sees the latest value
  isSpeechOnlyRef.current = isSpeechOnly

  const handleSubmitAnswer = () => {
    if (allAnswered) return

    // Snapshot before any setters fire
    const currentAnswer = answer
    const currentTranscript = transcript

    // Combine answer fields based on interview type
    let finalAnswer = currentAnswer
    if (isTechnicalCode && currentTranscript) {
      finalAnswer = currentAnswer + (currentAnswer.trim() ? '\n\n[Spoken explanation]:\n' : '') + currentTranscript
    } else if (isSystemDesign) {
      finalAnswer = `Written Design:\n${currentAnswer}\n\nVerbal Explanation:\n${currentTranscript}`
    }

    const newSubmitted = [...submittedAnswers, finalAnswer]
    setSubmittedAnswers(newSubmitted)
    setAnsweredIndices(prev => [...prev, currentQuestionIndex])
    setAnswer('')
    setTranscript('')
    setInterimTranscript('')
    // For behavioral/HR the speech content lives in `answer`; for others use `transcript`
    const spokenText = isSpeechOnly ? currentAnswer : currentTranscript
    const fillers = countFillerWords(spokenText)
    setFillerBreakdown(prev => {
      const updated = { ...prev }
      for (const [word, count] of Object.entries(fillers)) {
        updated[word] = (updated[word] ?? 0) + count
      }
      return updated
    })
    speechRef.current?.abort()

    const isLast = currentQuestionIndex === questions.length - 1
    if (isLast) {
      shouldListenRef.current = false
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
      speechRef.current = null
      setIsListening(false)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const stopCameraAndNavigate = (path: string) => {
    // Persist interview data for the results page
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions))
    sessionStorage.setItem('interviewAnswers', JSON.stringify(submittedAnswers))
    sessionStorage.setItem('answeredCount', String(answeredIndices.length))
    sessionStorage.setItem('skippedCount', String(skippedIndices.length))
    sessionStorage.setItem('fillerBreakdown', JSON.stringify(fillerBreakdown))
    sessionStorage.setItem('selectedLanguage', language)
    sessionStorage.setItem('interviewCompany', company)
    sessionStorage.setItem('interviewRole', role)
    sessionStorage.setItem('interviewType', interviewType)
    sessionStorage.setItem('interviewJobType', jobType)

    // Stop speech recognition immediately
    shouldListenRef.current = false
    speechRef.current?.abort()
    speechRef.current = null

    // Release video element first so browser relinquishes the camera handle
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    // Then stop every track so the OS-level camera indicator turns off
    const tracks = streamRef.current?.getTracks() ?? []
    tracks.forEach(track => {
      track.enabled = false
      track.stop()
    })
    streamRef.current = null
    router.push(path)
  }

  const handleSkip = () => {
    if (allAnswered) return
    const newSubmitted = [...submittedAnswers, '']
    setSubmittedAnswers(newSubmitted)
    setSkippedIndices(prev => [...prev, currentQuestionIndex])
    setAnswer('')
    setTranscript('')
    setInterimTranscript('')
    speechRef.current?.abort()

    const isLast = currentQuestionIndex === questions.length - 1
    if (isLast) {
      shouldListenRef.current = false
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
      speechRef.current = null
      setIsListening(false)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'var(--space-lg)',
      paddingBottom: 'var(--space-lg)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      background: '#fff',
      minHeight: '100vh',
    }}>
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

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        {/* Loading overlay */}
        {questionsLoading && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,255,255,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            zIndex: 50,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid var(--color-gray-200)',
              borderTopColor: 'var(--color-red)',
              animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
            `}</style>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-gray-600)', margin: 0 }}>
              Generating your questions…
            </p>
          </div>
        )}

        {/* Microphone enable banner */}
        {!micEnabled && (
          <button
            onClick={startSpeech}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              marginBottom: 12,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fca5a5',
              background: '#fff1f2',
              color: '#b91c1c',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span>🎤</span>
            <span>Click to enable microphone — speech transcription is off until you do</span>
          </button>
        )}

        {/* Header with interview info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid var(--color-gray-200)',
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-black)', marginBottom: 4 }}>
              {company} • {role} • {interviewType}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
              {jobType} Position
            </p>
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--color-black)',
            fontFamily: 'monospace',
            fontWeight: 600,
            background: 'var(--color-gray-100)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
          }}>
            Time: {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Main content - 3 column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24, marginBottom: 24 }}>
          {/* Left: Question panel */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            background: '#fff',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <h2 style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-gray-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h2>
              <span style={{
                fontSize: 12,
                color: '#fff',
                background: 'var(--color-red)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}>
                {interviewType}
              </span>
            </div>

            {questionsError ? (
              <div style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                fontSize: 13,
                color: '#b91c1c',
                lineHeight: 1.5,
              }}>
                <strong>Failed to load questions:</strong> {questionsError}
              </div>
            ) : (
              <p style={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'var(--color-black)',
              }}>
                {currentQuestion}
              </p>
            )}
          </div>

          {/* Middle: Answer area */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-gray-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 16,
            }}>
              Your Answer
            </h3>

            {isTechnicalCode ? (
              /* TECHNICAL (SWE/DS): Monaco + Speech */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-gray-200)',
                    background: '#fff',
                    fontSize: 13,
                    color: 'var(--color-black)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>

                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #1e293b' }}>
                  <MonacoEditor
                    height="260px"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={answer}
                    onChange={(val) => setAnswer(val ?? '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 12, bottom: 12 },
                      readOnly: allAnswered,
                    }}
                  />
                </div>

                {/* Live Speech Transcript */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      🎤 Live Speech Transcript
                    </span>
                    {isListening && (
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#dc2626',
                        display: 'inline-block',
                        animation: 'pulse 1s ease-in-out infinite',
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isListening ? '#fef2f2' : '#f8fafc',
                    border: `1.5px solid ${isListening ? '#dc2626' : 'var(--color-gray-200)'}`,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: (transcript || interimTranscript) ? 'var(--color-black)' : 'var(--color-gray-400)',
                    minHeight: 56,
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}>
                    {transcript || (!interimTranscript && 'Speak while coding — your explanation will appear here…')}
                    {interimTranscript && (
                      <span style={{ color: 'var(--color-gray-400)' }}>
                        {transcript ? ' ' : ''}{interimTranscript}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            ) : isSpeechOnly ? (
              /* BEHAVIORAL / HR: Speech only */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div style={{
                  flex: 1,
                  minHeight: 180,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isListening ? '#dc2626' : 'var(--color-gray-200)'}`,
                  background: isListening ? '#fef2f2' : '#f8fafc',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: answer ? 'var(--color-black)' : 'var(--color-gray-400)',
                  position: 'relative',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}>
                  {answer || (!interimTranscript && 'Speak your answer — transcription is live…')}
                  {interimTranscript && (
                    <span style={{ color: 'var(--color-gray-400)' }}>
                      {answer ? ' ' : ''}{interimTranscript}
                    </span>
                  )}
                  {isListening && (
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#dc2626',
                      animation: 'pulse 1s ease-in-out infinite',
                    }} />
                  )}
                </div>
              </div>

            ) : isSystemDesign ? (
              /* SYSTEM DESIGN: Written Design (top) + Verbal Explanation (bottom) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {/* Section 1: Written Design */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Written Design
                  </span>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={allAnswered}
                    placeholder="Draw your architecture here — components, databases, APIs..."
                    style={{
                      minHeight: 140,
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-gray-200)',
                      fontSize: 14,
                      color: 'var(--color-black)',
                      resize: 'none',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* Section 2: Verbal Explanation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Verbal Explanation
                  </span>
                  <div style={{
                    minHeight: 80,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isListening ? '#dc2626' : 'var(--color-gray-200)'}`,
                    background: isListening ? '#fef2f2' : '#f8fafc',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: (transcript || interimTranscript) ? 'var(--color-black)' : 'var(--color-gray-400)',
                    position: 'relative',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}>
                    {transcript || (!interimTranscript && 'Your verbal explanation will appear here as you speak...')}
                    {interimTranscript && (
                      <span style={{ color: 'var(--color-gray-400)' }}>
                        {transcript ? ' ' : ''}{interimTranscript}
                      </span>
                    )}
                    {isListening && (
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#dc2626',
                        animation: 'pulse 1s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                </div>
              </div>

            ) : (
              /* ALL OTHER TYPES: plain textarea */
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={allAnswered}
                placeholder="Type your answer here..."
                style={{
                  flex: 1,
                  minHeight: 220,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-200)',
                  fontSize: 14,
                  color: 'var(--color-black)',
                  resize: 'none',
                  lineHeight: 1.6,
                }}
              />
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-gray-500)' }}>
              {isTechnicalCode
                ? `${answer.length} chars of code${transcript ? ` · ${transcript.trim().split(/\s+/).length} spoken words` : ''}`
                : `${answer.length} characters`}
            </div>
          </div>

          {/* Right: Video panel */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 220,
                borderRadius: 'var(--radius-md)',
                background: '#000',
                objectFit: 'cover',
                marginBottom: 12,
              }}
            />

            <div style={{
              background: 'var(--color-red)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 600,
            }}>
              {formatTime(timeElapsed)}
            </div>

            <div style={{
              marginTop: 8,
              fontSize: 12,
              color: 'var(--color-gray-400)',
              textAlign: 'center',
            }}>
              {videoActive ? 'Recording' : 'Camera not available'}
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        {allAnswered ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Answered / Skipped summary */}
            <div style={{ display: 'flex', gap: 20, fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: '#15803d' }}>
                ✅ {answeredIndices.length} Answered
              </span>
              <span style={{ color: 'var(--color-gray-400)' }}>|</span>
              <span style={{ color: '#b45309' }}>
                ⏭️ {skippedIndices.length} Skipped
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-red)',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              width: '100%',
              textAlign: 'center',
            }}>
              All done! Click <strong>End Interview</strong> to see your results.
            </p>
            <button
              onClick={() => stopCameraAndNavigate('/practice/results')}
              style={{
                padding: '14px 40px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-red)',
                background: 'var(--color-red)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              End Interview
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={handleSkip}
              style={{
                padding: '12px 28px',
                maxWidth: 200,
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-gray-200)',
                background: '#fff',
                color: 'var(--color-black)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Skip →
            </button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitAnswer}
              style={{ maxWidth: 200 }}
            >
              Submit Answer
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        <div style={{
          marginTop: 24,
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
        }}>
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  idx === currentQuestionIndex
                    ? 'var(--color-red)'
                    : idx < currentQuestionIndex
                    ? 'var(--color-green, #10b981)'
                    : 'var(--color-gray-300)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
