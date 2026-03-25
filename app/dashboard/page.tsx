'use client'

import { useState, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface User {
  fullName: string
  nuid: string
  program: string
  gradYear: string
  email: string
}

interface Session {
  id: string
  date: string
  company: string
  role: string
  type: string
  overallScore: number
  communication: number
  technical: number
  problemSolving: number
  behavioral: number
  confidence: number
  fillerWords: number
  status: string
}

// ─── Mock data (replace with real DB fetch) ──────────────────────────────────
const MOCK_USER: User = {
  fullName: 'Aparajita Sharma',
  nuid: '002568772',
  program: 'MSIS',
  gradYear: '2026',
  email: 'sharma.ap@northeastern.edu',
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', date: '2026-03-24', company: 'Meta', role: 'Software Engineer', type: 'Technical', overallScore: 2, communication: 2, technical: 1, problemSolving: 2, behavioral: 1, confidence: 2, fillerWords: 21, status: 'Incomplete' },
  { id: '2', date: '2026-03-20', company: 'Google', role: 'SWE Intern', type: 'Behavioral', overallScore: 6, communication: 7, technical: 5, problemSolving: 6, behavioral: 7, confidence: 6, fillerWords: 8, status: 'Complete' },
  { id: '3', date: '2026-03-15', company: 'Amazon', role: 'SDE Co-op', type: 'Technical', overallScore: 5, communication: 5, technical: 6, problemSolving: 5, behavioral: 4, confidence: 5, fillerWords: 12, status: 'Complete' },
  { id: '4', date: '2026-03-10', company: 'Microsoft', role: 'Explorer', type: 'Behavioral', overallScore: 4, communication: 4, technical: 3, problemSolving: 4, behavioral: 5, confidence: 4, fillerWords: 15, status: 'Complete' },
  { id: '5', date: '2026-03-05', company: 'Fidelity', role: 'Tech Co-op', type: 'Mixed', overallScore: 3, communication: 3, technical: 4, problemSolving: 3, behavioral: 3, confidence: 3, fillerWords: 18, status: 'Complete' },
]

const MOCK_COURSES = [
  { code: 'CS 5800', name: 'Algorithms', credits: 4, grade: 'A-' },
  { code: 'IS 5150', name: 'Data Management', credits: 4, grade: 'B+' },
  { code: 'CS 6140', name: 'Machine Learning', credits: 4, grade: 'A' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const scoreColor = (s: number) => s >= 7 ? '#16a34a' : s >= 4 ? '#d97706' : '#dc2626'
const scoreBg = (s: number) => s >= 7 ? '#f0fdf4' : s >= 4 ? '#fffbeb' : '#fef2f2'

const BAR_LABELS = ['Mar 5', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 24']
const BAR_DATA = [3, 4, 5, 6, 2]

const FILTER_OPTIONS = ['All Time', 'This Month', 'Technical Only', 'Behavioral Only']

// ─── Mini Bar Chart (pure CSS/SVG) ───────────────────────────────────────────
function BarChart({ filter }: { filter: string }) {
  const data = filter === 'Technical Only'
    ? [3, 0, 5, 0, 2]
    : filter === 'Behavioral Only'
    ? [0, 4, 0, 6, 0]
    : BAR_DATA

  const max = 10
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, padding: '0 4px' }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: val > 0 ? scoreColor(val) : '#ccc' }}>
            {val > 0 ? val : '–'}
          </span>
          <div style={{
            width: '100%',
            height: `${(val / max) * 90}px`,
            minHeight: val > 0 ? 4 : 0,
            background: val > 0
              ? `linear-gradient(to top, ${scoreColor(val)}, ${scoreColor(val)}88)`
              : '#f3f4f6',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.4s ease',
          }} />
          <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>{BAR_LABELS[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Radial Score ─────────────────────────────────────────────────────────────
function RadialScore({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="700">
        {score}
      </text>
    </svg>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user] = useState<User>(MOCK_USER)
  const [sessions] = useState<Session[]>(MOCK_SESSIONS)
  const [filter, setFilter] = useState('All Time')
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'courses'>('overview')

  const avgScore = Math.round(sessions.reduce((a, s) => a + s.overallScore, 0) / sessions.length * 10) / 10
  const bestScore = Math.max(...sessions.map(s => s.overallScore))
  const totalSessions = sessions.length
  const avgFillerWords = Math.round(sessions.reduce((a, s) => a + s.fillerWords, 0) / sessions.length)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user.fullName.split(' ')[0]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'var(--font-body)' }}>

      {/* Hero header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #EBEBEB',
        padding: '32px 40px 0',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Greeting row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 500,
                flexShrink: 0,
              }}>
                {firstName[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{greeting},</p>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 400,
                  color: 'var(--color-black)',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                }}>
                  {user.fullName}
                </h1>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                  NUID: {user.nuid} · {user.program} · Class of {user.gradYear}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Avg Score', value: `${avgScore}/10`, color: scoreColor(avgScore) },
                { label: 'Sessions', value: totalSessions, color: '#111' },
                { label: 'Best Score', value: `${bestScore}/10`, color: scoreColor(bestScore) },
                { label: 'Avg Filler Words', value: avgFillerWords, color: '#d97706' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#F7F6F3',
                  borderRadius: 12,
                  padding: '10px 18px',
                  textAlign: 'center',
                  minWidth: 80,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-display)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: 'none' }}>
            {(['overview', 'sessions', 'courses'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '10px 24px',
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--color-red)' : '#888',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--color-red)' : '2px solid transparent',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Score trend chart */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 2 }}>Score Trend</h2>
                  <p style={{ fontSize: 12, color: '#aaa' }}>Overall score across your last {totalSessions} sessions</p>
                </div>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: '1px solid #E5E5E5',
                    fontSize: 13,
                    color: '#444',
                    background: '#FAFAFA',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {FILTER_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <BarChart filter={filter} />
            </div>

            {/* Expert scores breakdown */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Latest Expert Scores</h2>
              {sessions[0] && (() => {
                const s = sessions[0]
                const metrics = [
                  { label: 'Communication', val: s.communication },
                  { label: 'Technical', val: s.technical },
                  { label: 'Problem Solving', val: s.problemSolving },
                  { label: 'Behavioral', val: s.behavioral },
                  { label: 'Confidence', val: s.confidence },
                ]
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {metrics.map(m => (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: '#555' }}>{m.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(m.val) }}>{m.val}/10</span>
                        </div>
                        <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                          <div style={{
                            height: '100%',
                            width: `${(m.val / 10) * 100}%`,
                            background: scoreColor(m.val),
                            borderRadius: 99,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Improvement tips */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Focus Areas</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🎯', title: 'Reduce filler words', desc: `Avg ${avgFillerWords} per session — aim for under 5`, color: '#fef2f2', border: '#fecaca' },
                  { icon: '💻', title: 'Strengthen technical skills', desc: 'Practice coding problems daily on LeetCode', color: '#eff6ff', border: '#bfdbfe' },
                  { icon: '📢', title: 'Use STAR format', desc: 'Structure behavioral answers clearly', color: '#f0fdf4', border: '#bbf7d0' },
                ].map(tip => (
                  <div key={tip.title} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 14px',
                    background: tip.color,
                    border: `1px solid ${tip.border}`,
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{tip.title}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === 'sessions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', fontFamily: 'var(--font-display)' }}>
                Practice Sessions
              </h2>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: '1px solid #E5E5E5', fontSize: 13,
                  color: '#444', background: '#FAFAFA',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {FILTER_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {sessions.map(s => (
              <div key={s.id} style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #EBEBEB',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <RadialScore score={s.overallScore} size={60} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{s.company} — {s.role}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      padding: '2px 8px', borderRadius: 99,
                      background: s.status === 'Complete' ? '#f0fdf4' : '#fef2f2',
                      color: s.status === 'Complete' ? '#16a34a' : '#dc2626',
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Type', val: s.type },
                      { label: 'Date', val: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                      { label: 'Filler Words', val: s.fillerWords },
                    ].map(item => (
                      <span key={item.label} style={{ fontSize: 12, color: '#888' }}>
                        <span style={{ color: '#bbb' }}>{item.label}: </span>{item.val}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'Comm', val: s.communication },
                    { label: 'Tech', val: s.technical },
                    { label: 'PS', val: s.problemSolving },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: scoreBg(m.val),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: scoreColor(m.val),
                      }}>
                        {m.val}
                      </div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              Enrolled Courses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {MOCK_COURSES.map(course => (
                <div key={course.code} style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #EBEBEB',
                  padding: '24px',
                  transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 600,
                    color: 'var(--color-red)',
                    background: 'rgba(200,16,46,0.06)',
                    padding: '3px 10px', borderRadius: 99,
                    marginBottom: 12,
                  }}>
                    {course.code}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: '#111', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
                    {course.name}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{course.credits} credits</span>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: course.grade.startsWith('A') ? '#16a34a' : '#d97706',
                      background: course.grade.startsWith('A') ? '#f0fdf4' : '#fffbeb',
                      padding: '4px 12px', borderRadius: 8,
                    }}>
                      {course.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interview readiness by course relevance */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB', padding: '24px', marginTop: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                Interview Readiness by Topic
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { topic: 'Data Structures & Algorithms', readiness: 40 },
                  { topic: 'System Design', readiness: 30 },
                  { topic: 'Behavioral / Leadership', readiness: 55 },
                  { topic: 'Machine Learning concepts', readiness: 70 },
                ].map(item => (
                  <div key={item.topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: '#555' }}>{item.topic}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(item.readiness / 10) }}>
                        {item.readiness}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                      <div style={{
                        height: '100%',
                        width: `${item.readiness}%`,
                        background: scoreColor(item.readiness / 10),
                        borderRadius: 99,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}