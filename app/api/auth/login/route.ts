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

    const response = NextResponse.json({ success: true, userId: user.id, name: user.fullName })
    response.cookies.set('nuid', user.nuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}