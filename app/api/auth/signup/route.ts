// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { nuid, fullName, email, program, gradYear, password } = await req.json()

    if (!nuid || !fullName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!/^\d{9}$/.test(nuid)) {
      return NextResponse.json({ error: 'NUID must be exactly 9 digits.' }, { status: 400 })
    }

    if (!email.endsWith('@northeastern.edu') && !email.endsWith('@husky.neu.edu')) {
      return NextResponse.json({ error: 'Must use a Northeastern email.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { nuid } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this NUID already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { nuid, fullName, email, program, gradYear, passwordHash },
    })

    const response = NextResponse.json({ success: true, userId: user.id })
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
    return NextResponse.json({ error: 'Signup failed.' }, { status: 500 })
  }
}