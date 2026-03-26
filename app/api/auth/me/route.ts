import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = req.cookies.get('email')?.value
  const nuid  = req.cookies.get('nuid')?.value

  if (!email && !nuid) return NextResponse.json({ loggedIn: false })

  try {
    const user = email
      ? await prisma.user.findUnique({ where: { email }, select: { fullName: true, nuid: true } })
      : await prisma.user.findUnique({ where: { nuid: nuid! }, select: { fullName: true, nuid: true } })

    if (!user) return NextResponse.json({ loggedIn: false })
    return NextResponse.json({ loggedIn: true, fullName: user.fullName, nuid: user.nuid })
  } catch {
    return NextResponse.json({ loggedIn: false })
  }
}
