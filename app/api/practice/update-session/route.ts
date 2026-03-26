import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const nuid = request.cookies.get('nuid')?.value ?? null

    const { sessionId, eyeContact, confidence, engagement } = await request.json()

    // Prefer explicit sessionId; fall back to most recent session in last 5 min
    let targetId: string | null = sessionId ?? null
    if (!targetId) {
      const latest = await prisma.practiceSession.findFirst({
        where:   {
          userId:    nuid,
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        select:  { id: true },
      })
      targetId = latest?.id ?? null
    }

    if (!targetId) {
      return NextResponse.json({ error: 'No session found' }, { status: 404 })
    }

    await prisma.practiceSession.update({
      where: { id: targetId },
      data:  { eyeContact, confidence, engagement },
    })

    console.log('PracticeSession video scores updated:', targetId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('update-session failed:', err)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
