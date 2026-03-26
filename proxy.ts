import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/practice', '/volunteers', '/resume', '/resume-ai', '/companies', '/help', '/feedback']

export function proxy(req: NextRequest) {
  const nuid = req.cookies.get('nuid')?.value
  const email = req.cookies.get('email')?.value
  const isLoggedIn = !!(nuid || email)
  const path = req.nextUrl.pathname

  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/practice/:path*', '/volunteers/:path*', '/resume/:path*', '/resume-ai/:path*', '/companies/:path*', '/help/:path*', '/feedback/:path*', '/login', '/signup'],
}
