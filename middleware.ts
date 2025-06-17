import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api')

  // Allow access to public routes and API routes
  if (isPublicRoute) {
    return response
  }

  // Redirect to sign-in if not authenticated and trying to access protected route
  if (!session && !isAuthRoute) {
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if authenticated and trying to access auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 