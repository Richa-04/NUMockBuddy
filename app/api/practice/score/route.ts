export const maxDuration = 60;

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXPERT_CONFIG = [
  { name: 'Communication',   accent: '#2563eb', bg: '#eff6ff' },
  { name: 'Technical',       accent: '#7c3aed', bg: '#f5f3ff' },
  { name: 'Problem-Solving', accent: '#0891b2', bg: '#ecfeff' },
  { name: 'Behavioral',      accent: '#059669', bg: '#ecfdf5' },
  { name: 'Confidence',      accent: '#d97706', bg: '#fffbeb' },
  { name: 'Overall',         accent: '#c8102e', bg: '#fff1f2' },
]

const DEFAULT_EXPERT_SCORES = EXPERT_CONFIG.map(e => ({
  name:     e.name,
  score:    0,
  feedback: 'No answer provided.',
  accent:   e.accent,
  bg:       e.bg,
}))

const DEFAULT_FEEDBACK = {
  strengths:    ['No answers were submitted.'],
  improvements: ['Submit answers to receive personalised feedback.'],
  summary:      'No answers were provided for this session.',
}

function extractText(msg: Anthropic.Message): string {
  return (msg.content[0] as { type: 'text'; text: string }).text
}

function fixLiteralNewlines(text: string): string {
  let out = ''
  let inString = false
  let escaped = false
  for (const ch of text) {
    if (escaped) {
      out += ch; escaped = false
    } else if (ch === '\\') {
      out += ch; escaped = true
    } else if (ch === '"') {
      out += ch; inString = !inString
    } else if (inString && ch === '\n') {
      out += '\\n'
    } else if (inString && ch === '\r') {
      out += '\\r'
    } else if (inString && ch === '\t') {
      out += '\\t'
    } else {
      out += ch
    }
  }
  return out
}

function parseJSON<T>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?\r?\n?/, '')
    .replace(/\r?\n?```$/, '')
    .trim()

  try { return JSON.parse(cleaned) } catch { /* fall through */ }

  const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) } catch { /* fall through */ }
  }

  const src = jsonMatch?.[1] ?? cleaned
  const fixed = fixLiteralNewlines(src)
  try { return JSON.parse(fixed) } catch (e) {
    console.error('parseJSON all attempts failed.\nRaw text:', text, '\nError:', e)
    throw e
  }
}

interface ScoresAndFeedback {
  experts: Array<{ name: string; score: number; feedback: string }>
  strengths: string[]
  improvements: string[]
  summary: string
}

async function callScores(
  questions: string[],
  answers: string[],
  totalFillerCount: number,
  role: string,
): Promise<ScoresAndFeedback> {
  const prompt =
`You are a panel of 6 interview experts scoring a ${role} interview. Each expert evaluates only their domain.

Expert evaluation criteria:
- Communication: jargon usage, clarity of explanation, sentence structure, conciseness
- Technical: solution correctness, edge cases handled, time/space complexity, code quality
- Problem-Solving: problem breakdown, logical thinking, whether requirements were clarified
- Behavioral: STAR format usage, specificity of examples, relevance to question
- Confidence: filler word count is ${totalFillerCount} (penalise if high), decisive language, directness
- Overall: holistic interview readiness for ${role} role

Return ONLY this JSON, no other text:
{"experts":[{"name":"Communication","score":7,"feedback":"Explained concepts clearly but overused technical jargon"},{"name":"Technical","score":6,"feedback":"Correct approach but missed edge cases and complexity"},{"name":"Problem-Solving","score":7,"feedback":"Broke problem down well, clarified requirements first"},{"name":"Behavioral","score":7,"feedback":"Used STAR format with specific relevant examples"},{"name":"Confidence","score":6,"feedback":"Decisive language but too many filler words used"},{"name":"Overall","score":7,"feedback":"Strong candidate, needs deeper technical depth"}],"strengths":["strength1","strength2"],"improvements":["improvement1","improvement2"],"summary":"One sentence overall summary"}

Rules: scores 1-10, each feedback is specific and actionable, ≤20 words, strengths/improvements ≤8 words each, summary ≤20 words.

Q: ${JSON.stringify(questions)}
A: ${JSON.stringify(answers)}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })
  return parseJSON<ScoresAndFeedback>(extractText(msg))
}

type ModelAnswer = { question: string; language: string; answer: string }

async function callModelAnswers(
  questions: string[],
  role: string,
  interviewType: string,
  selectedLanguage: string,
): Promise<ModelAnswer[]> {
  const isTechnical = interviewType === 'Technical'
  const isBehavioral = interviewType === 'Behavioral' || interviewType === 'HR'
  const qList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')

  let instruction: string
  let exampleAnswer: string
  let lang: string

  if (isTechnical) {
    lang = selectedLanguage
    instruction = `Write a concise ${selectedLanguage} code solution. Max 15 lines. No comments, no test cases — solution only. CRITICAL: embedded in JSON — use \\n for newlines, spaces for indentation, NO literal newline characters.`
    exampleAnswer = `def solve(n):\\n    if n == 0:\\n        return 0\\n    return n + solve(n - 1)`
  } else if (isBehavioral) {
    lang = 'text'
    instruction = 'Write a STAR-format answer (Situation, Task, Action, Result). Plain text. Max 40 words. No code.'
    exampleAnswer = '<STAR format, max 40 words>'
  } else {
    lang = 'text'
    instruction = `Write a structured answer with exactly these four sections. Use "**Section:**" as header. Bullet points only. Max 50 words total. CRITICAL: embedded in JSON — use \\n for newlines, NO literal newline characters.`
    exampleAnswer = `**Requirements:**\\n- 10M req/day, low latency\\n\\n**Architecture:**\\nClient → LB → API → Cache → DB\\n\\n**Key Components:**\\n- Cache: Redis\\n- DB: sharded PostgreSQL\\n\\n**Trade-offs:**\\n- Availability over consistency`
  }

  const buildPrompt = (inst: string, example: string) =>
`${inst}

Return ONLY a JSON array, no markdown, no extra text:
[{"question":"<exact question>","language":"${lang}","answer":"${example}"}]

Questions:
${qList}`

  const callOnce = async (inst: string, example: string) => {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(inst, example) }],
    })
    return parseJSON<ModelAnswer[]>(extractText(msg))
  }

  try {
    return await callOnce(instruction, exampleAnswer)
  } catch {
    console.warn('callModelAnswers: first attempt failed, retrying with shorter prompt')
  }

  const shortInstruction = isTechnical
    ? `Write a ${selectedLanguage} solution. Max 8 lines. No comments. Use \\n for newlines.`
    : 'One sentence answer per question. Plain text only.'
  const shortExample = isTechnical
    ? `def solve(n):\\n    return n`
    : '<one sentence>'

  try {
    return await callOnce(shortInstruction, shortExample)
  } catch {
    console.error('callModelAnswers: both attempts failed, returning empty array')
    return []
  }
}

export async function POST(request: NextRequest) {
  const email = request.cookies.get('email')?.value
  const nuid  = request.cookies.get('nuid')?.value
  let userId: string | null = nuid ?? null
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { nuid: true } })
    userId = user?.nuid ?? nuid ?? null
  }

  const {
    questions,
    answers,
    role,
    interviewType,
    totalFillerCount = 0,
    selectedLanguage = 'python',
    company = '',
    jobType = '',
    answeredCount = 0,
    skippedCount = 0,
    totalRepeated = 0,
    saveToDB = true,
  } = await request.json()

  const hasAnswers = Array.isArray(answers) && answers.some((a: string) => a?.trim())

  const [scoresResult, modelAnswersResult] = await Promise.all([
    hasAnswers
      ? callScores(questions, answers, totalFillerCount, role).catch(err => {
          console.error('callScores failed:', err)
          return null
        })
      : Promise.resolve(null),
    callModelAnswers(questions, role, interviewType, selectedLanguage).catch(err => {
      console.error('callModelAnswers failed:', err)
      return [] as ModelAnswer[]
    }),
  ])

  // ── Compute scores (use defaults when no answers provided) ──────────────────
  const expertScores = hasAnswers && scoresResult
    ? scoresResult.experts.map(e => {
        const config = EXPERT_CONFIG.find(c => c.name === e.name)
        return {
          name:     e.name,
          score:    e.score,
          feedback: e.feedback,
          accent:   config?.accent ?? '#666',
          bg:       config?.bg ?? '#f9f9f9',
        }
      })
    : DEFAULT_EXPERT_SCORES

  const overallScore = hasAnswers && scoresResult
    ? Math.round(expertScores.reduce((sum, e) => sum + e.score, 0) / expertScores.length)
    : 0

  const verdict: string =
    overallScore >= 9 ? 'Strong'     :
    overallScore >= 7 ? 'Very Good'  :
    overallScore >= 5 ? 'Good'       :
    overallScore >= 3 ? 'Needs Work' : 'Incomplete'

  // ── Save session and capture ID so client can update video scores later ──
  // Always save regardless of whether answers were provided.
  // saveToDB=false means StrictMode sent a duplicate request — skip.
  // 3-second window is a backup dedup in case the client flag misfires.
  let sessionId: string | null = null
  if (saveToDB) {
    try {
      const existing = await prisma.practiceSession.findFirst({
        where: {
          userId:        userId,
          company,
          role,
          interviewType,
          createdAt:     { gte: new Date(Date.now() - 3_000) },
        },
        select: { id: true },
      })
      if (existing) {
        console.log('PracticeSession save skipped (duplicate within 3s):', existing.id)
        sessionId = existing.id
      } else {
        const saved = await prisma.practiceSession.create({
          data: {
            userId:        userId,
            company,
            role,
            interviewType,
            jobType,
            overallScore,
            verdict,
            answeredCount,
            skippedCount,
            totalFillers:  totalFillerCount,
            totalRepeated,
            eyeContact:    null,
            confidence:    null,
            engagement:    null,
          },
        })
        sessionId = saved.id
        console.log('PracticeSession saved:', saved.id, 'for user:', userId)
      }
    } catch (err) {
      console.error('PracticeSession save failed:', err)
    }
  } else {
    console.log('PracticeSession save skipped (client dedup flag)')
  }

  if (!hasAnswers) {
    return Response.json({
      overallScore: 0,
      verdict: 'Incomplete',
      expertScores: DEFAULT_EXPERT_SCORES,
      strengths:    DEFAULT_FEEDBACK.strengths,
      improvements: DEFAULT_FEEDBACK.improvements,
      summary:      DEFAULT_FEEDBACK.summary,
      modelAnswers: modelAnswersResult,
      sessionId,
    })
  }

  if (!scoresResult) {
    return Response.json(
      { error: 'Failed to score interview', modelAnswers: modelAnswersResult, sessionId },
      { status: 500 },
    )
  }

  return Response.json({
    overallScore,
    verdict,
    expertScores,
    strengths:    scoresResult.strengths,
    improvements: scoresResult.improvements,
    summary:      scoresResult.summary,
    modelAnswers: modelAnswersResult,
    sessionId,
  })
}