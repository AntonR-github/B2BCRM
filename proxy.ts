import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const publicPages = ['/login', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(req.nextUrl.pathname)
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
  const isPublicApi = req.nextUrl.pathname.startsWith('/api/') && !isAuthRoute
  if (isAuthRoute || isPublicApi) return NextResponse.next()
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoggedIn && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
