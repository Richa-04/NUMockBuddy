import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const nuid = req.cookies.get('nuid')?.value
  if (!nuid) return NextResponse.json({ loggedIn: false })

  try {
    const user = await prisma.user.findUnique({
      where: { nuid },
      select: { fullName: true, nuid: true },
    })
    if (!user) return NextResponse.json({ loggedIn: false })
    return NextResponse.json({ loggedIn: true, fullName: user.fullName, nuid: user.nuid })
  } catch {
    return NextResponse.json({ loggedIn: false })
  }
}
