'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

const SAMPLE_QUESTIONS = {
  Technical: [
    'Design a URL shortening service. How would you handle scalability?',
    'Implement a function to find the longest substring without repeating characters.',
    'Explain how you would build a distributed cache system.',
    'Design a real-time notification system for a social network.',
    'How would you optimize database queries for a high-traffic e-commerce platform?',
  ],
  Behavioral: [
    'Tell me about a time when you had to work with a difficult team member.',
    'Describe a project where you had to learn something new quickly.',
    'Give an example of when you took ownership of a problem.',
    'Tell me about a time you failed and what you learned from it.',
    'Describe your experience working in an Agile/Scrum environment.',
  ],
  'System Design': [
    'Design Instagram. How would you handle storing and serving images?',
    'Design a real-time collaborative document editor like Google Docs.',
    'Design an online payment system. What are the key considerations?',
    'Design a video streaming platform like YouTube.',
    'Design a distributed job scheduling system.',
  ],
  HR: [
    'Why are you interested in this role and company?',
    'Where do you see yourself in 5 years?',
    'What are your greatest strengths and weaknesses?',
    'Tell me about your experience working in teams.',
    'Why are you leaving your current role?',
  ],
}

export default function InterviewSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [interviewType, setInterviewType] = useState('')
  const [jobType, setJobType] = useState('')
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [videoActive, setVideoActive] = useState(false)
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load params from URL
  useEffect(() => {
    const c = searchParams.get('company') || 'General'
    const r = searchParams.get('role') || 'SWE'
    const it = searchParams.get('interviewType') || 'Technical'
    const jt = searchParams.get('jobType') || 'Internship / Co-op'
    
    setCompany(c)
    setRole(r)
    setInterviewType(it)
    setJobType(jt)
  }, [searchParams])

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setVideoActive(true)
        }
      } catch (err) {
        console.error('Camera access denied:', err)
        setVideoActive(false)
      }
    }

    initCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const questions = SAMPLE_QUESTIONS[interviewType as keyof typeof SAMPLE_QUESTIONS] || SAMPLE_QUESTIONS.Technical
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  const handleSubmitAnswer = () => {
    const newSubmitted = [...submittedAnswers, answer]
    setSubmittedAnswers(newSubmitted)
    setAnswer('')
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer('')
    }
  }

  const handleEndInterview = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    router.push('/practice/results')
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

            <p style={{
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.6,
              color: 'var(--color-black)',
            }}>
              {currentQuestion}
            </p>
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

            {interviewType === 'Technical' ? (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your code here (Python, Java, JavaScript, etc.)..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-200)',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: 'var(--color-black)',
                  resize: 'none',
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              />
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-200)',
                  fontSize: 14,
                  color: 'var(--color-black)',
                  resize: 'none',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              />
            )}

            <div style={{
              marginTop: 12,
              fontSize: 12,
              color: 'var(--color-gray-500)',
            }}>
              {answer.length} characters
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          <button
            onClick={() => {
              setAnswer('')
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1)
              }
            }}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-gray-200)',
              background: currentQuestionIndex === 0 ? 'var(--color-gray-100)' : '#fff',
              color: currentQuestionIndex === 0 ? 'var(--color-gray-400)' : 'var(--color-black)',
              fontSize: 14,
              fontWeight: 600,
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ← Previous
          </button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmitAnswer}
            style={{ width: '100%' }}
          >
            Submit Answer
          </Button>

          <button
            onClick={handleEndInterview}
            style={{
              padding: '12px 20px',
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
            End Interview
          </button>
        </div>

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
