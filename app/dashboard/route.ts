import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const nuid = searchParams.get('nuid')

    if (!nuid) {
      return NextResponse.json({ error: 'NUID required' }, { status: 400 })
    }

    // Fetch user profile
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

    // Fetch practice sessions if your schema has them
    // const sessions = await prisma.practiceSession.findMany({
    //   where: { userNuid: nuid },
    //   orderBy: { createdAt: 'desc' },
    // })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}