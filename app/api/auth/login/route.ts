// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { nuid, password } = await req.json()

    if (!nuid || !password) {
      return NextResponse.json({ error: 'NUID and password are required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { nuid } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with this NUID.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    // TODO: set session cookie here (e.g. NextAuth, iron-session, or JWT)
    return NextResponse.json({ success: true, userId: user.id, name: user.fullName })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}