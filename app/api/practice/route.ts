import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(company: string, role: string, interviewType: string, jobType: string): string {
  const ctx = `Company: ${company}, Job Type: ${jobType}`
  const tail = `\nReturn ONLY a JSON array of 5 strings, no other text.`

  if (interviewType === 'Technical') {
    switch (role) {
      case 'SWE':
        return `You are an expert SWE interviewer. Generate exactly 5 hands-on coding questions. Each must require writing actual code. Focus on: algorithms, data structures, system design implementation, debugging, or optimization.\n${ctx}${tail}`

      case 'Data Science':
        return `You are an expert data science interviewer. Generate exactly 5 hands-on coding questions. Each must require writing actual code. Focus on: pandas/numpy manipulation, ML model implementation, statistical analysis, data cleaning, or ML pipelines.\n${ctx}${tail}`

      case 'ML Engineer':
        return `You are an expert ML engineering interviewer. Generate exactly 5 hands-on coding questions. Focus on: ML algorithm implementation, model training/evaluation, MLOps pipelines, feature engineering, or model optimization.\n${ctx}${tail}`

      case 'Data Engineer':
        return `You are an expert data engineering interviewer. Generate exactly 5 hands-on coding questions. Focus on: ETL/ELT pipeline design, data warehousing concepts, Apache Spark transformations, Airflow DAGs, or SQL performance tuning.\n${ctx}${tail}`

      case 'Data Analyst':
        return `You are an expert data analyst interviewer. Generate exactly 5 hands-on questions. Focus on: complex SQL queries, Python pandas data manipulation, statistical analysis, data visualization, or business metrics interpretation.\n${ctx}${tail}`

      case 'BA':
        return `You are an expert business analyst interviewer. Generate exactly 5 technical questions. Focus on: SQL queries for reporting, Excel/spreadsheet analysis, requirements gathering scenarios, data interpretation, or process mapping.\n${ctx}${tail}`

      case 'Audit':
        return `You are an expert IT audit interviewer. Generate exactly 5 technical questions. Focus on: IT audit frameworks (COBIT, SOX), compliance checks, risk assessment procedures, control testing, or audit tool usage.\n${ctx}${tail}`

      case 'DevOps/Cloud Engineer':
        return `You are an expert DevOps interviewer. Generate exactly 5 hands-on technical questions. Focus on: CI/CD pipeline design, Docker/Kubernetes configuration, cloud infrastructure (AWS/GCP/Azure), infrastructure-as-code, or monitoring/observability.\n${ctx}${tail}`

      case 'QA/SDET':
        return `You are an expert QA/SDET interviewer. Generate exactly 5 hands-on technical questions. Focus on: test automation frameworks, writing test cases for edge cases, API testing, performance testing, or bug reproduction and analysis.\n${ctx}${tail}`

      default:
        return `You are an expert technical interviewer. Generate exactly 5 hands-on coding questions for a ${role} role. Each must require writing actual code.\n${ctx}${tail}`
    }
  }

  if (interviewType === 'System Design') {
    switch (role) {
      case 'TPM':
        return `You are an expert TPM interviewer. Generate exactly 5 system design questions focused on: technical project planning, cross-team coordination challenges, dependency management, technical risk mitigation, or delivery estimation.\n${ctx}${tail}`

      case 'PM':
        return `You are an expert PM interviewer. Generate exactly 5 product design questions focused on: product roadmap prioritization, feature trade-off analysis, success metrics definition, user research approach, or go-to-market strategy.\n${ctx}${tail}`

      default:
        return `You are an expert system design interviewer. Generate exactly 5 system design questions for a ${role} role. Focus on scalable architecture, trade-offs, and real-world constraints.\n${ctx}${tail}`
    }
  }

  // Behavioral and HR — generic prompt works well for all roles
  return `You are an expert interviewer. Generate exactly 5 ${interviewType} interview questions for the following criteria. Return ONLY a JSON array of 5 strings, no other text.
Company: ${company}
Role: ${role}
Interview Type: ${interviewType}
Job Type: ${jobType}`
}

export async function POST(request: Request) {
  try {
    const { company, role, interviewType, jobType } = await request.json()

    const prompt = buildPrompt(company, role, interviewType, jobType)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
