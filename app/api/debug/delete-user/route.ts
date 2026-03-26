import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest) {
  const { nuid } = await req.json()
  await prisma.user.delete({ where: { nuid } })
  return Response.json({ deleted: true })
}
