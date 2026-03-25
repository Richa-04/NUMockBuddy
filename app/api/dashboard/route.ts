import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const emailCookie = req.cookies.get('email')?.value
    const nuidCookie  = req.cookies.get('nuid')?.value

    if (!emailCookie && !nuidCookie) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: emailCookie ? { email: emailCookie } : { nuid: nuidCookie! },
      select: {
        fullName: true,
        nuid:     true,
        email:    true,
        program:  true,
        gradYear: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const sessions = await prisma.practiceSession.findMany({
      where:   { userId: user.nuid },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ user, sessions })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}