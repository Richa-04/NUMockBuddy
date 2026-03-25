import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const nuid = cookieStore.get('nuid')?.value

    if (!nuid) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { nuid },
      select: {
        fullName: true,
        nuid: true,
        email: true,
        program: true,
        gradYear: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { userId: nuid },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ user, sessions })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}