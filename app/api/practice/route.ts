import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { company, role, interviewType, jobType } = await request.json()

    const isTechnical = interviewType === 'Technical'
    const isDS = role === 'Data Science'

    const prompt = isTechnical
      ? isDS
        ? `You are an expert data science interviewer. Generate exactly 5 hands-on coding and problem-solving questions for a Data Science role. Each question should require the candidate to write actual code. Focus on: pandas/numpy data manipulation, ML model implementation, statistical analysis, data cleaning, or building a simple ML pipeline from scratch.
Company: ${company}, Job Type: ${jobType}
Return ONLY a JSON array of 5 strings, no other text.`
        : `You are an expert technical interviewer. Generate exactly 5 hands-on coding and problem-solving questions. Each question should require the candidate to write actual code or design a system. Avoid theoretical or conceptual questions. Focus on: algorithms, data structures implementation, system design, debugging, or optimization problems.
Company: ${company}, Role: ${role}, Job Type: ${jobType}
Return ONLY a JSON array of 5 strings, no other text.`
      : `You are an expert technical interviewer. Generate exactly 5 interview questions based on the following criteria. Return ONLY a JSON array of 5 strings, no other text.
Company: ${company}
Role: ${role}
Interview Type: ${interviewType}
Job Type: ${jobType}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: 'text'; text: string }).text
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const questions: string[] = JSON.parse(cleaned)

    return Response.json({ questions })
  } catch (err) {
    console.error('/api/practice error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
