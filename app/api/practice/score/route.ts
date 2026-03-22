import Anthropic from '@anthropic-ai/sdk'

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


function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

interface ScoresAndFeedback {
  experts: Array<{ name: string; score: number; feedback: string }>
  strengths: string[]
  improvements: string[]
  summary: string
}

async function callScoresAndFeedback(
  questions: string[],
  answers: string[],
): Promise<ScoresAndFeedback> {
  const prompt = `You are an interviewer. Score this interview response.
Return ONLY this JSON with no other text:
{"experts":[{"name":"Communication","score":7,"feedback":"Clear explanation"},{"name":"Technical","score":6,"feedback":"Good approach"},{"name":"Problem-Solving","score":7,"feedback":"Structured thinking"},{"name":"Behavioral","score":7,"feedback":"Good examples"},{"name":"Confidence","score":6,"feedback":"Steady delivery"},{"name":"Overall","score":7,"feedback":"Solid performance"}],"strengths":["strength1","strength2"],"improvements":["improvement1","improvement2"],"summary":"Brief summary here"}

Questions: ${JSON.stringify(questions)}
Answers: ${JSON.stringify(answers)}

Replace the example values with real scores. Keep all text under 8 words.`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })
  return parseJSON<ScoresAndFeedback>((msg.content[0] as { type: 'text'; text: string }).text)
}

async function callModelAnswersOnly(
  questions: string[],
  role: string,
  interviewType: string,
): Promise<Array<{ question: string; language: string; answer: string }>> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Respond with ONLY a valid JSON array. No markdown, no explanation, no code blocks.

Provide model answers for a ${role} ${interviewType} interview. Max 30 words per answer.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

[{"question":"<exact question>","language":"<python|javascript|java|cpp|text>","answer":"<max 30 words>"}]`,
    }],
  })
  return parseJSON((msg.content[0] as { type: 'text'; text: string }).text)
}

export async function POST(request: Request) {
  try {
    const { questions, answers, role, interviewType } = await request.json()

    const hasAnswers = Array.isArray(answers) && answers.some((a: string) => a?.trim())

    if (!hasAnswers) {
      const modelAnswers = await callModelAnswersOnly(questions, role, interviewType)
      return Response.json({
        overallScore: 0,
        verdict: 'Incomplete',
        expertScores: DEFAULT_EXPERT_SCORES,
        strengths:    DEFAULT_FEEDBACK.strengths,
        improvements: DEFAULT_FEEDBACK.improvements,
        summary:      DEFAULT_FEEDBACK.summary,
        modelAnswers,
      })
    }

    // Two parallel calls: scores+feedback and model answers
    const [result, modelAnswers] = await Promise.all([
      callScoresAndFeedback(questions, answers),
      callModelAnswersOnly(questions, role, interviewType),
    ])

    const expertScores = result.experts.map(e => {
      const config = EXPERT_CONFIG.find(c => c.name === e.name)
      return {
        name:     e.name,
        score:    e.score,
        feedback: e.feedback,
        accent:   config?.accent ?? '#666',
        bg:       config?.bg ?? '#f9f9f9',
      }
    })

    const overallScore = Math.round(
      expertScores.reduce((sum, e) => sum + e.score, 0) / expertScores.length,
    )

    const verdict =
      overallScore >= 9 ? 'Strong'     :
      overallScore >= 7 ? 'Good'       :
      overallScore >= 5 ? 'Needs Work' : 'Incomplete'

    return Response.json({
      overallScore,
      verdict,
      expertScores,
      strengths:    result.strengths,
      improvements: result.improvements,
      summary:      result.summary,
      modelAnswers,
    })
  } catch (err) {
    console.error('/api/practice/score error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to score interview' },
      { status: 500 },
    )
  }
}
