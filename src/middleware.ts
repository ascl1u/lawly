import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Ensure middleware runs before any other server code
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}

export async function middleware(request: NextRequest) {
  // Initialize logging for debugging
  console.log('🚀 Middleware - Initializing')
  return await updateSession(request)
} 