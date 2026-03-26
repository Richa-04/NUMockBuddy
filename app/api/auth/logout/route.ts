import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  }
  response.cookies.set('email', '', cookieOptions)
  response.cookies.set('nuid', '', cookieOptions)
  return response
}