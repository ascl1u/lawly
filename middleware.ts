import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  console.log('Middleware check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    cookies: req.cookies.getAll().map(c => c.name)
  })

  const path = req.nextUrl.pathname

  if (session && path.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/upload', req.url))
  }

  if (!session && (path.startsWith('/upload') || path.startsWith('/documents'))) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/upload/:path*', '/documents/:path*', '/auth/login']
} 