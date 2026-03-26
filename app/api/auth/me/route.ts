import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
<<<<<<< HEAD
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
=======
  const email = req.cookies.get('email')?.value
  const nuid = req.cookies.get('nuid')?.value

  if (!email && !nuid) {
    return NextResponse.json({ loggedIn: false })
  }

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findUnique({ where: { nuid: nuid! } })

  if (!user) {
    return NextResponse.json({ loggedIn: false })
  }

  return NextResponse.json({
    loggedIn: true,
    user: {
      fullName: user.fullName,
      nuid: user.nuid,
      email: user.email,
    },
  })
}
>>>>>>> e0ec3ae1cd9742428cc529486a526f9df7278798
