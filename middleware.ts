import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/practice', '/dashboard', '/volunteers', '/resume', '/resume-ai']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected && !req.cookies.get('nuid')?.value) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/practice/:path*', '/dashboard/:path*', '/volunteers/:path*', '/resume/:path*', '/resume-ai/:path*'],
}
