import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/documents'
  
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${error_description}`, request.url)
    )
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      if (!session?.user) {
        throw new Error('No user session after code exchange')
      }

      // Create or update user record
      await supabase
        .from('users')
        .upsert(
          {
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        )

      return NextResponse.redirect(new URL(redirectTo, request.url))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed', request.url)
      )
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
} 