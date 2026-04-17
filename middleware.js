import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'
import { COOKIE_NAME } from './lib/constants'

const PROTECTED = ['/dashboard', '/profile', '/my-tests', '/my-courses', '/attempt', '/analytics', '/bookmarks', '/leaderboard', '/custom-test', '/question-bank']

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED.some(p => pathname.startsWith(p))
  if (!needsAuth) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/profile/:path*', '/my-tests/:path*',
    '/my-courses/:path*', '/attempt/:path*', '/analytics/:path*',
    '/bookmarks/:path*', '/leaderboard/:path*', '/custom-test/:path*',
    '/question-bank/:path*',
  ],
}
