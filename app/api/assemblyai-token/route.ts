import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

export async function POST() {
  console.log('AssemblyAI key exists:', !!process.env.ASSEMBLYAI_API_KEY)
  try {
    const token = await client.streaming.createTemporaryToken({ expires_in_seconds: 600 })
    return Response.json({ token })
  } catch (e) {
    console.error('AssemblyAI token error:', e)
    return Response.json({ error: 'Failed to create token' }, { status: 500 })
  }
}
