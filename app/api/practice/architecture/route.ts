import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { question } = await req.json()
    if (!question) {
      return Response.json({ error: 'Missing question' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Generate a simple ASCII architecture diagram for this system design question: ${question}. Use arrows (→, ↓, ↑) and boxes. Keep it under 20 lines. Show main components and data flow only.`,
        },
      ],
    })

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    return Response.json({ diagram: text })
  } catch (e) {
    console.error('Architecture diagram error:', e)
    return Response.json({ error: 'Failed to generate diagram' }, { status: 500 })
  }
}
