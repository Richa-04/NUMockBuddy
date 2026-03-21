'use client'

import { useState } from 'react'
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

  modelAnswers: [
    {
      question: 'Given an array of integers, return the indices of the two numbers that add up to a given target.',
      language: 'python',
      answer: `# Optimal: hash map — O(n) time, O(n) space
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}                        # value → index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []                        # no solution (empty input)

# Key points:
# • Check complement BEFORE inserting to avoid using the same index twice.
# • Handles empty array gracefully (returns []).
# • Time: O(n)  |  Space: O(n)`,
    },
    {
      question: 'Find the length of the longest substring without repeating characters.',
      language: 'python',
      answer: `# Sliding window — O(n) time, O(min(n, k)) space  (k = charset size)
def length_of_longest_substring(s: str) -> int:
    char_index = {}
    left = max_len = 0

    for right, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= left:
            left = char_index[ch] + 1   # shrink window past the duplicate
        char_index[ch] = right
        max_len = max(max_len, right - left + 1)

    return max_len

# Key points:
# • Shrink window only when the duplicate is inside the current window.
# • One-pass; no inner loop — strictly O(n).
# • Edge cases: empty string → 0, all-same chars → 1.`,
    },
    {
      question: 'Design a URL shortening service. How would you handle scalability?',
      language: 'text',
      answer: `High-level design:

1. ID generation
   • Base-62 encode a unique ID (a-z, A-Z, 0-9) → 7 chars ≈ 3.5 trillion URLs.
   • Options: auto-increment DB ID, distributed counter (Snowflake), random + collision check.

2. Storage
   • Write path: hash → long URL stored in key-value store (DynamoDB / Redis + Postgres).
   • Read path: cache hot URLs in Redis (TTL ~24 h) to keep DB reads low.

3. Redirection
   • 301 (permanent) — browser caches; reduces server load but loses analytics.
   • 302 (temporary) — every visit hits server; better for click tracking.

4. Scalability
   • Stateless API servers behind a load balancer — horizontal scaling.
   • Read replicas for the DB; writes go to primary.
   • CDN for global redirect latency.
   • Rate-limit by IP to prevent abuse.

5. Edge cases
   • URL validation before shortening.
   • Expiry / TTL support per link.
   • Custom aliases (check availability first).`,
    },
    {
      question: 'Detect whether a linked list has a cycle.',
      language: 'python',
      answer: `# Floyd's "tortoise and hare" — O(n) time, O(1) space
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

# Key points:
# • Two pointers at different speeds — if a cycle exists they must eventually meet.
# • No extra memory (unlike storing visited nodes in a set).
# • If fast reaches None, the list is acyclic.
# • To find the cycle entry point: reset one pointer to head after meeting,
#   then advance both one step at a time — they meet at the entry node.`,
    },
    {
      question: 'What is the difference between SQL and NoSQL databases? When would you use each?',
      language: 'text',
      answer: `SQL (Relational)
────────────────────────────────────────────
• Structured schema — tables, rows, foreign keys.
• ACID transactions — strong consistency.
• Best for: financial systems, e-commerce orders, anything needing JOINs
  or complex queries across related data.
• Examples: PostgreSQL, MySQL, SQLite.

NoSQL (Non-relational)
────────────────────────────────────────────
• Flexible schema — documents, key-value, wide-column, graph.
• BASE model — eventual consistency; trades consistency for availability/speed.
• Best for: high write throughput, unstructured data, horizontal scaling,
  caching, real-time feeds, user profiles.
• Examples: MongoDB (document), Redis (key-value), Cassandra (wide-column).

Decision framework:
  Need complex queries / strict consistency?  → SQL
  Need massive scale / flexible schema?       → NoSQL
  Both?                                       → Polyglot persistence (use both)

Interview tip: mention CAP theorem — no system can guarantee Consistency,
Availability, and Partition Tolerance simultaneously.`,
    },
  ],
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

  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

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

          {/* ── 4. Model Answers ── */}
          <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            background: '#fff',
            marginBottom: 48,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-gray-200)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)', margin: 0 }}>
                Model Answers
              </h2>
            </div>

            {MOCK.modelAnswers.map((item, idx) => {
              const isOpen = openQuestion === idx
              const total = MOCK.modelAnswers.length
              return (
                <div
                  key={idx}
                  style={{ borderBottom: idx < total - 1 ? '1px solid var(--color-gray-200)' : 'none' }}
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => setOpenQuestion(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: '20px 32px',
                      background: isOpen ? '#fafafa' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Question number badge */}
                    <span style={{
                      flexShrink: 0,
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: isOpen ? 'var(--color-red)' : 'var(--color-gray-200)',
                      color: isOpen ? '#fff' : 'var(--color-gray-600)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      marginTop: 1,
                      transition: 'all 0.15s ease',
                    }}>
                      {idx + 1}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: isOpen ? 'var(--color-red)' : 'var(--color-gray-500)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: 4,
                      }}>
                        Question {idx + 1} of {total}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 500,
                        color: 'var(--color-black)', lineHeight: 1.5,
                      }}>
                        {item.question}
                      </div>
                    </div>

                    {/* Chevron */}
                    <span style={{
                      flexShrink: 0,
                      fontSize: 18,
                      color: 'var(--color-gray-400)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      marginTop: 2,
                      lineHeight: 1,
                    }}>
                      ▾
                    </span>
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div style={{ padding: '0 32px 24px' }}>
                      <div style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid #1e293b',
                      }}>
                        <div style={{
                          background: '#1e293b',
                          padding: '10px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
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
                          margin: 0,
                          padding: '20px',
                          background: '#0f172a',
                          color: '#e2e8f0',
                          fontSize: 13,
                          lineHeight: 1.7,
                          overflowX: 'auto',
                          fontFamily: 'var(--font-mono, "Fira Code", "Cascadia Code", monospace)',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {item.answer}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
