import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface VideoAnalysisResult {
  eyeContact:  { score: number; tip: string }
  confidence:  { score: number; tip: string }
  engagement:  { score: number; tip: string }
}

export async function POST(req: Request) {
  try {
    const { frames } = await req.json() as { frames: string[] }
    if (!Array.isArray(frames) || frames.length === 0) {
      return Response.json({ error: 'No frames provided' }, { status: 400 })
    }

    // Use the middle frame as the primary analysis image; fall back to first
    const primary = frames[Math.floor(frames.length / 2)] ?? frames[0]

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: primary },
            },
            {
              type: 'text',
              text: `Analyze this interview candidate's body language. Rate each category 1-10 and give one short, encouraging tip (max 15 words).

Return ONLY this JSON, no other text:
{"eyeContact":{"score":7,"tip":"Try looking slightly above the camera for better eye contact."},"confidence":{"score":8,"tip":"Your posture is great — keep your shoulders relaxed."},"engagement":{"score":7,"tip":"A subtle smile helps convey enthusiasm."}}

Rules: scores 1-10, tips max 15 words, be encouraging but honest.`,
            },
          ],
        },
      ],
    })

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    // Strip code fences if present
    const cleaned = text.replace(/^```(?:json)?\r?\n?/, '').replace(/\r?\n?```$/, '').trim()
    const data = JSON.parse(cleaned) as VideoAnalysisResult

    return Response.json(data)
  } catch (e) {
    console.error('Video analysis error:', e)
    return Response.json({ error: 'Failed to analyse video' }, { status: 500 })
  }
}
