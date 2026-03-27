import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(company: string, role: string, interviewType: string, jobType: string): string {
  const tail = `Company: ${company}, Job Type: ${jobType}. Return ONLY a JSON array of 5 question strings, no other text.`

  if (interviewType === 'Technical') {
    switch (role) {
      case 'Software Engineer':
        return `Generate 5 coding interview questions for a SWE (algorithms, data structures, debugging). ${tail}`
      case 'Data Science':
        return `Generate 5 coding interview questions for a Data Scientist (pandas, ML, statistics). ${tail}`
      case 'Machine Learning Engineer':
        return `Generate 5 coding interview questions for an MLE (ML algorithms, model training, MLOps). ${tail}`
      case 'Data Engineer':
        return `Generate 5 coding interview questions for a Data Engineer (ETL, Spark, SQL, Airflow). ${tail}`
      case 'Data Analyst':
        return `Generate 5 interview questions for a Data Analyst (SQL, pandas, visualization, metrics). ${tail}`
      case 'Business Analyst':
        return `Generate 5 interview questions for a Business Analyst (SQL, requirements, data interpretation). ${tail}`
      case 'Audit':
        return `Generate 5 interview questions for an IT Auditor (COBIT, SOX, compliance, risk assessment). ${tail}`
      case 'DevOps / Cloud Engineer':
        return `Generate 5 interview questions for a DevOps Engineer (CI/CD, Docker, Kubernetes, cloud). ${tail}`
      case 'Quality Assurance / Software Development Engineer in Test':
        return `Generate 5 interview questions for a QA/SDET (test automation, API testing, edge cases). ${tail}`
      default:
        return `Generate 5 technical coding interview questions for a ${role}. ${tail}`
    }
  }

  if (interviewType === 'System Design') {
    switch (role) {
      case 'Technical Program Manager':
        return `Generate 5 system design interview questions for a TPM (project planning, coordination, risk). ${tail}`
      case 'Product Manager':
        return `Generate 5 product design interview questions for a PM (roadmap, trade-offs, metrics, GTM). ${tail}`
      default:
        return `Generate 5 system design interview questions for a ${role} (scalability, trade-offs, architecture). ${tail}`
    }
  }

  return `Generate 5 ${interviewType} interview questions for a ${role} at ${company} (${jobType}). Return ONLY a JSON array of 5 strings, no other text.`
}

export async function POST(request: Request) {
  try {
    const { company, role, interviewType, jobType } = await request.json()

    const prompt = buildPrompt(company, role, interviewType, jobType)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: 'text'; text: string }).text
    const cleaned = text.replace(/^```(?:json)?\r?\n?/, '').replace(/\r?\n?```$/, '').trim()
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
