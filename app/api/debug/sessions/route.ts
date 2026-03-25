import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('nuid')?.value
  const sessions = await prisma.practiceSession.findMany({
    where:   { userId: userId ?? undefined },
    orderBy: { createdAt: 'desc' },
    take:    10,
  })
  return Response.json(sessions)
}
