'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
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

// Single-word fillers for visual highlighting
const HIGHLIGHT_FILLERS = new Set(['um', 'uh', 'like', 'so', 'basically', 'literally', 'actually', 'right', 'yeah', 'okay'])

function countRepeatedWords(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
    .map(w => w.replace(/[.,!?'"]+$/, ''))
  let count = 0
  for (let i = 1; i < words.length; i++) {
    if (words[i].length > 1 && words[i] === words[i - 1]) count++
  }
  return count
}

function renderHighlightedWords(text: string) {
  const tokens = text.split(/(\s+)/)
  // Build cleaned word list for consecutive duplicate detection (skip whitespace tokens)
  const words = tokens.map(t => /^\s+$/.test(t) ? '' : t.toLowerCase().replace(/[.,!?'"]+$/, ''))
  // Mark indices that are part of a consecutive duplicate pair
  const repeatedIdx = new Set<number>()
  let prevWord = ''
  let prevWordIdx = -1
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (!w) continue // whitespace token
    if (w.length > 1 && w === prevWord) {
      repeatedIdx.add(prevWordIdx)
      repeatedIdx.add(i)
    }
    prevWord = w
    prevWordIdx = i
  }

  return tokens.map((token, i) => {
    if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
    const clean = words[i]
    let bg = ''
    let title = ''
    if (HIGHLIGHT_FILLERS.has(clean)) { bg = '#fef08a'; title = 'filler word' }
    else if (repeatedIdx.has(i)) { bg = '#bbf7d0'; title = 'repeated word' }
    return bg
      ? <mark key={i} title={title} style={{ background: bg, borderRadius: 2, padding: '0 2px', color: '#78350f', fontStyle: 'normal' }}>{token}</mark>
      : <span key={i}>{token}</span>
  })
}

// Extend window type for SpeechRecognition (kept for type safety, no longer used at runtime)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}


// ─── Whiteboard Canvas ────────────────────────────────────────────────────────

type DrawTool = 'pen' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'eraser'

function WhiteboardCanvas({ canvasRef }: { canvasRef: { current: HTMLCanvasElement | null } }) {
  const [tool, setTool] = useState<DrawTool>('pen')
  const [color, setColor] = useState('#1e293b')
  const [size, setSize] = useState(2)
  const drawing = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const snap = useRef<ImageData | null>(null)
  const history = useRef<ImageData[]>([])
  const historyIndex = useRef(-1)

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null

  // Save canvas state to history (called after each completed action)
  const saveSnapshot = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    // Truncate any redo states
    history.current = history.current.slice(0, historyIndex.current + 1)
    history.current.push(imageData)
    historyIndex.current = history.current.length - 1
  }

  const undo = () => {
    if (historyIndex.current <= 0) return
    historyIndex.current -= 1
    const ctx = getCtx()
    if (!ctx) return
    ctx.putImageData(history.current[historyIndex.current], 0, 0)
  }

  const redo = () => {
    if (historyIndex.current >= history.current.length - 1) return
    historyIndex.current += 1
    const ctx = getCtx()
    if (!ctx) return
    ctx.putImageData(history.current[historyIndex.current], 0, 0)
  }

  // Initialize white canvas and save initial snapshot
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    history.current = [imageData]
    historyIndex.current = 0
  }, [canvasRef])

  // Keyboard undo/redo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) { redo() } else { undo() }
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const drawArrowhead = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headLen = Math.max(12, size * 4)
    const angle = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = getCtx()
    if (!ctx) return
    const p = getPos(e)
    if (tool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        ctx.font = `${size * 6 + 8}px sans-serif`
        ctx.fillStyle = color
        ctx.fillText(text, p.x, p.y)
        saveSnapshot()
      }
      return
    }
    drawing.current = true
    origin.current = p
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
    } else {
      snap.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = getCtx()
    if (!ctx) return
    const p = getPos(e)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? size * 8 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    } else if (snap.current) {
      ctx.putImageData(snap.current, 0, 0)
      const { x: ox, y: oy } = origin.current
      ctx.beginPath()
      if (tool === 'rect') {
        ctx.strokeRect(ox, oy, p.x - ox, p.y - oy)
      } else if (tool === 'circle') {
        const rx = (p.x - ox) / 2
        const ry = (p.y - oy) / 2
        ctx.ellipse(ox + rx, oy + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (tool === 'line') {
        ctx.moveTo(ox, oy)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      } else if (tool === 'arrow') {
        ctx.moveTo(ox, oy)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        drawArrowhead(ctx, ox, oy, p.x, p.y)
      }
    }
  }

  const onUp = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    drawing.current = false
    snap.current = null
    // For pen/eraser, save after stroke ends; for shapes, save after mouseup
    saveSnapshot()
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = getCtx()
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveSnapshot()
  }

  const TOOLS: { id: DrawTool; label: string }[] = [
    { id: 'pen', label: 'Pen' },
    { id: 'line', label: 'Line' },
    { id: 'arrow', label: 'Arrow' },
    { id: 'rect', label: 'Rect' },
    { id: 'circle', label: 'Circle' },
    { id: 'text', label: 'Text' },
    { id: 'eraser', label: 'Erase' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            border: `1.5px solid ${tool === t.id ? '#dc2626' : '#e5e7eb'}`,
            background: tool === t.id ? '#fff1f2' : '#fff',
            color: tool === t.id ? '#dc2626' : 'var(--color-black)',
          }}>
            {t.label}
          </button>
        ))}
        <input
          type="color" value={color} title="Stroke color"
          onChange={e => setColor(e.target.value)}
          style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', padding: 2 }}
        />
        <select value={size} onChange={e => setSize(Number(e.target.value))} style={{
          padding: '3px 6px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12,
        }}>
          {[1, 2, 4, 6, 10].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button onClick={undo} title="Undo (Ctrl+Z)" style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12,
            cursor: 'pointer', border: '1.5px solid #e5e7eb', background: '#fff',
            fontFamily: 'var(--font-body)',
          }}>
            Undo
          </button>
          <button onClick={redo} title="Redo (Ctrl+Shift+Z)" style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12,
            cursor: 'pointer', border: '1.5px solid #e5e7eb', background: '#fff',
            fontFamily: 'var(--font-body)',
          }}>
            Redo
          </button>
          <button onClick={clear} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12,
            cursor: 'pointer', border: '1.5px solid #e5e7eb', background: '#fff',
            fontFamily: 'var(--font-body)',
          }}>
            Clear
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        width={1400}
        height={500}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        style={{
          width: '100%', height: '500px', display: 'block',
          borderRadius: '8px', border: '1px solid #e5e7eb',
          cursor: tool === 'text' ? 'text' : 'crosshair',
          background: '#ffffff', touchAction: 'none',
        }}
      />
    </div>
  )
}

function InterviewSessionContent() {
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
  const SQL_DEFAULT_ROLES = ['Data Engineer', 'Data Analyst']
  const [language, setLanguage] = useState(
    SQL_DEFAULT_ROLES.includes(searchParams.get('role') ?? '') ? 'sql' : 'python'
  )
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
  const [totalRepeatedCount, setTotalRepeatedCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoFrames = useRef<string[]>([])
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRef = useRef<any>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<AudioWorkletNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const shouldListenRef = useRef(false)
  const isSpeechOnlyRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [excalidrawDiagrams, setExcalidrawDiagrams] = useState<string[]>([])

  // Load params from URL and fetch questions
  useEffect(() => {
    // Clear dedup flag at the start of every new session so the results page
    // always saves a fresh PracticeSession to the DB.
    sessionStorage.removeItem('practiceSessionSaved')

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

  // Initialize camera + stop on unmount
  useEffect(() => {
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
      // Stop transcription engine
      shouldListenRef.current = false
      sourceRef.current?.disconnect()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      audioContextRef.current = null
      if (speechRef.current) {
        if (typeof speechRef.current.close === 'function') {
          speechRef.current.close()
        } else if (typeof speechRef.current.stop === 'function') {
          speechRef.current.stop()
        }
        speechRef.current = null
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
  }, [])

  // Stop transcription on tab close / browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const tracks = streamRef.current?.getTracks() ?? []
      tracks.forEach(track => {
        track.enabled = false
        track.stop()
      })
      shouldListenRef.current = false
      sourceRef.current?.disconnect()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      audioContextRef.current = null
      if (speechRef.current) {
        if (typeof speechRef.current.close === 'function') {
          speechRef.current.close()
        } else if (typeof speechRef.current.stop === 'function') {
          speechRef.current.stop()
        }
        speechRef.current = null
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Capture a video frame every 10 s (max 5 frames)
  useEffect(() => {
    if (!videoActive) return
    const capture = () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return
      if (videoFrames.current.length >= 5) return
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]
      if (b64) videoFrames.current.push(b64)
    }
    capture() // capture one immediately
    frameIntervalRef.current = setInterval(capture, 10000)
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    }
  }, [videoActive])

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

  // Cleanup transcription on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      sourceRef.current?.disconnect()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      audioContextRef.current = null
      if (speechRef.current) {
        if (typeof speechRef.current.close === 'function') {
          speechRef.current.close()
        } else if (typeof speechRef.current.stop === 'function') {
          speechRef.current.stop()
        }
        speechRef.current = null
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
    }
  }, [])

  const startWebSpeechFallback = (audioStream: MediaStream) => {
    console.log('Starting Web Speech API fallback...')
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported')
      audioStream.getTracks().forEach(t => t.stop())
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      if (!shouldListenRef.current) return
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (interim) setInterimTranscript(interim)
      if (final) {
        setInterimTranscript('')
        setTranscript(prev => prev + final)
        if (isSpeechOnlyRef.current) setAnswer(prev => prev + final)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => console.error('Web Speech error:', e.error)
    recognition.start()
    speechRef.current = recognition
    shouldListenRef.current = true
    setIsListening(true)
  }

  const startSpeech = async () => {
    if (micEnabled) return
    console.log('Starting speech...')

    // Request mic access
    let audioStream: MediaStream
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = audioStream
    } catch (err) {
      console.error('Mic access denied:', err)
      return
    }

    // Hide the banner immediately — don't wait for async connection
    setMicEnabled(true)

    // Get temporary AssemblyAI token from server
    let token: string
    try {
      const res = await fetch('/api/assemblyai-token', { method: 'POST' })
      const data = await res.json()
      if (!data.token) throw new Error('No token returned')
      token = data.token
      console.log('Got AssemblyAI token')
    } catch (err) {
      console.error('Failed to get AssemblyAI token, falling back to Web Speech:', err)
      startWebSpeechFallback(audioStream)
      return
    }

    // Dynamically import to avoid SSR issues
    const { StreamingTranscriber } = await import('assemblyai')

    // Create AudioContext for PCM capture
    const audioContext = new AudioContext({ sampleRate: 16000 })
    audioContextRef.current = audioContext

    const transcriber = new StreamingTranscriber({
      token,
      sampleRate: audioContext.sampleRate,
      encoding: 'pcm_s16le',
      speechModel: 'universal-streaming-english',
    })

    transcriber.on('turn', (t: { end_of_turn: boolean; transcript: string }) => {
      console.log('Turn event fired:', t.transcript, '| end_of_turn:', t.end_of_turn)
      if (!shouldListenRef.current) return
      if (!t.end_of_turn) {
        setInterimTranscript(t.transcript)
      } else if (t.transcript) {
        setInterimTranscript('')
        const finalText = t.transcript + ' '
        setTranscript(prev => prev + finalText)
        if (isSpeechOnlyRef.current) setAnswer(prev => prev + finalText)
      }
    })

    transcriber.on('error', (err: unknown) => {
      console.error('AssemblyAI transcriber error:', err)
    })

    transcriber.on('close', (code: number, reason: string) => {
      console.log('AssemblyAI connection closed:', code, reason)
      if (shouldListenRef.current) {
        // Unexpected close while still supposed to be listening — fall back to Web Speech
        console.log('Unexpected AssemblyAI close, falling back to Web Speech...')
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        speechRef.current = null
        startWebSpeechFallback(audioStream)
      } else {
        setIsListening(false)
      }
    })

    try {
      await transcriber.connect()
      console.log('Transcriber connected successfully')
    } catch (err) {
      console.error('Transcriber connect failed:', err)
      audioContext.close()
      audioContextRef.current = null
      startWebSpeechFallback(audioStream)
      return
    }

    speechRef.current = transcriber

    // Mic → AudioWorklet → AssemblyAI WebSocket
    try {
      await audioContext.audioWorklet.addModule('/audio-processor.worklet.js')
    } catch (err) {
      console.error('AudioWorklet load failed, falling back to Web Speech:', err)
      audioContext.close()
      audioContextRef.current = null
      transcriber.close()
      speechRef.current = null
      startWebSpeechFallback(audioStream)
      return
    }

    const source = audioContext.createMediaStreamSource(audioStream)
    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')

    workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
      if (!shouldListenRef.current || !speechRef.current) return
      const float32 = e.data
      const int16 = new Int16Array(float32.length)
      for (let i = 0; i < float32.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)))
      }
      try { speechRef.current.sendAudio(int16.buffer) } catch { /* ignore after close */ }
    }

    source.connect(workletNode)
    workletNode.connect(audioContext.destination)
    processorRef.current = workletNode
    sourceRef.current = source

    shouldListenRef.current = true
    setIsListening(true)
  }

  const currentQuestion = questions[currentQuestionIndex] ?? ''
  const totalQuestions = questions.length || 5
  const allAnswered = questions.length > 0 && submittedAnswers.length === questions.length

  const CODE_ROLES = ['Software Engineer', 'Data Science', 'Machine Learning Engineer', 'Data Engineer', 'Data Analyst', 'DevOps / Cloud Engineer', 'Quality Assurance / Software Development Engineer in Test']
  const isTechnicalCode = interviewType === 'Technical' && CODE_ROLES.includes(role)
  const isSpeechOnly = interviewType === 'Behavioral' || interviewType === 'HR'
  const isSystemDesign = interviewType === 'System Design'

  isSpeechOnlyRef.current = isSpeechOnly

  const handleSubmitAnswer = async () => {
    if (allAnswered) return

    const currentAnswer = answer
    const currentTranscript = transcript

    let finalAnswer = currentAnswer
    if (isTechnicalCode && currentTranscript) {
      finalAnswer = currentAnswer + (currentAnswer.trim() ? '\n\n[Spoken explanation]:\n' : '') + currentTranscript
    } else if (isSystemDesign) {
      let diagramBase64 = ''
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png')
        diagramBase64 = dataUrl.split(',')[1] ?? ''
      }
      setExcalidrawDiagrams(prev => [...prev, diagramBase64])
      finalAnswer = `[Whiteboard diagram attached]\n\nVerbal Explanation:\n${currentTranscript}`
    }

    const newSubmitted = [...submittedAnswers, finalAnswer]
    setSubmittedAnswers(newSubmitted)
    setAnsweredIndices(prev => [...prev, currentQuestionIndex])
    setAnswer('')
    setTranscript('')
    setInterimTranscript('')
    const spokenText = isSpeechOnly ? currentAnswer : currentTranscript
    setTotalRepeatedCount(prev => prev + countRepeatedWords(spokenText))
    const fillers = countFillerWords(spokenText)
    setFillerBreakdown(prev => {
      const updated = { ...prev }
      for (const [word, count] of Object.entries(fillers)) {
        updated[word] = (updated[word] ?? 0) + count
      }
      return updated
    })

    const isLast = currentQuestionIndex === questions.length - 1
    if (isLast) {
      shouldListenRef.current = false
      sourceRef.current?.disconnect()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      audioContextRef.current = null
      if (speechRef.current) {
        if (typeof speechRef.current.close === 'function') {
          speechRef.current.close()
        } else if (typeof speechRef.current.stop === 'function') {
          speechRef.current.stop()
        }
        speechRef.current = null
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
      setIsListening(false)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const stopCameraAndNavigate = (path: string) => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions))
    sessionStorage.setItem('interviewAnswers', JSON.stringify(submittedAnswers))
    sessionStorage.setItem('answeredCount', String(answeredIndices.length))
    sessionStorage.setItem('skippedCount', String(skippedIndices.length))
    sessionStorage.setItem('fillerBreakdown', JSON.stringify(fillerBreakdown))
    sessionStorage.setItem('repeatedCount', String(totalRepeatedCount))
    sessionStorage.setItem('selectedLanguage', language)
    sessionStorage.setItem('interviewCompany', company)
    sessionStorage.setItem('interviewRole', role)
    sessionStorage.setItem('interviewType', interviewType)
    sessionStorage.setItem('interviewJobType', jobType)
    sessionStorage.setItem('excalidrawDiagrams', JSON.stringify(excalidrawDiagrams))
    sessionStorage.setItem('videoFrames', JSON.stringify(videoFrames.current))
    sessionStorage.removeItem('practiceSessionSaved') // reset dedup flag for new session

    // Stop transcription
    shouldListenRef.current = false
    sourceRef.current?.disconnect()
    processorRef.current?.disconnect()
    audioContextRef.current?.close()
    audioContextRef.current = null
    speechRef.current?.close()
    speechRef.current = null
    audioStreamRef.current?.getTracks().forEach(t => t.stop())
    audioStreamRef.current = null

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

    const isLast = currentQuestionIndex === questions.length - 1
    if (isLast) {
      shouldListenRef.current = false
      sourceRef.current?.disconnect()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
      audioContextRef.current = null
      if (speechRef.current) {
        if (typeof speechRef.current.close === 'function') {
          speechRef.current.close()
        } else if (typeof speechRef.current.stop === 'function') {
          speechRef.current.stop()
        }
        speechRef.current = null
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current = null
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

  // Filler count across all submitted + current transcript
  const totalFillerCount = Object.values(fillerBreakdown).reduce((a, b) => a + b, 0)
  const currentFillerCount = Object.values(countFillerWords(isSpeechOnly ? answer : transcript)).reduce((a, b) => a + b, 0)

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
      <style>{`
        @media (max-width: 768px) {
          .session-grid     { grid-template-columns: 1fr !important; }
          .session-header   { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .session-section  { padding-left: 16px !important; padding-right: 16px !important; }
          .session-timer    { align-self: flex-start !important; }
        }
      `}</style>
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

        {/* Header */}
        <div className="session-header" style={{
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
        <div className="session-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24, marginBottom: 24 }}>
          {/* Left: Question panel */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            background: '#fff',
            minHeight: 300,
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
              /* TECHNICAL: Monaco + Speech Transcript */
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
                  <option value="sql">SQL</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>

                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #1e293b' }}>
                  <MonacoEditor
                    height="350px"
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

                {/* Live Speech Transcript with highlighting */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    {currentFillerCount > 0 && (
                      <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>
                        Fillers: {currentFillerCount}
                      </span>
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
                    minHeight: 120,
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}>
                    {transcript
                      ? renderHighlightedWords(transcript)
                      : (!interimTranscript && 'Speak while coding — your explanation will appear here…')}
                    {interimTranscript && (
                      <span style={{ color: 'var(--color-gray-400)' }}>
                        {transcript ? ' ' : ''}{interimTranscript}
                      </span>
                    )}
                  </div>
                  {/* Highlighting legend */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { color: '#fef08a', label: 'filler word' },
                      { color: '#bbf7d0', label: 'repeated' },
                    ].map(({ color, label }) => (
                      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-gray-500)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            ) : isSpeechOnly ? (
              /* BEHAVIORAL / HR: Speech only with highlighting */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Speak your answer</span>
                  {currentFillerCount > 0 && (
                    <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>
                      Fillers: {currentFillerCount}
                    </span>
                  )}
                </div>
                <div style={{
                  flex: 1,
                  minHeight: 350,
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
                  {answer
                    ? renderHighlightedWords(answer)
                    : (!interimTranscript && 'Speak your answer — transcription is live…')}
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
                {/* Highlighting legend */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { color: '#fef08a', label: 'filler word' },
                    { color: '#bbf7d0', label: 'repeated' },
                  ].map(({ color, label }) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-gray-500)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

            ) : isSystemDesign ? (
              /* SYSTEM DESIGN: Excalidraw Whiteboard + Verbal Explanation */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Whiteboard
                  </span>
                  <WhiteboardCanvas canvasRef={canvasRef} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Verbal Explanation
                    </span>
                    {currentFillerCount > 0 && (
                      <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>
                        Fillers: {currentFillerCount}
                      </span>
                    )}
                  </div>
                  <div style={{
                    minHeight: 120,
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
                    {transcript
                      ? renderHighlightedWords(transcript)
                      : (!interimTranscript && 'Your verbal explanation will appear here as you speak...')}
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
                  {/* Highlighting legend */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { color: '#fef08a', label: 'filler word' },
                      { color: '#bbf7d0', label: 'repeated' },
                    ].map(({ color, label }) => (
                      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-gray-500)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                        {label}
                      </span>
                    ))}
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
                  minHeight: 350,
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
              {(totalFillerCount > 0 || totalRepeatedCount > 0) && (
                <span style={{ marginLeft: 8, color: '#92400e' }}>
                  {totalFillerCount > 0 ? `· ${totalFillerCount} total fillers` : ''}
                  {totalRepeatedCount > 0 ? ` · ${totalRepeatedCount} repeated this session` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Right: Video panel */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'flex-start',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 'var(--radius-md)',
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

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewSessionContent />
    </Suspense>
  )
}
