import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/documents'
  
  console.log('Auth callback initiated:', { code: !!code, error, error_description })

  if (error) {
    console.error('Auth callback error params:', { error, error_description })
    return NextResponse.redirect(
      new URL(`/auth/login?error=${error_description}`, request.url)
    )
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      console.log('Exchanging code for session...')
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        throw error
      }

      console.log('Session obtained:', { 
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        hasSession: !!session 
      })

      if (!session?.user) {
        console.error('No user in session after exchange')
        throw new Error('No user session after code exchange')
      }

      // Create or update user record with logging
      console.log('Attempting user upsert:', { 
        id: session.user.id,
        email: session.user.email 
      })

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'id'
          }
        )

      if (upsertError) {
        console.error('User upsert error:', upsertError)
        throw upsertError
      }

      console.log('User upsert successful')
      return NextResponse.redirect(new URL(redirectTo, request.url))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed', request.url)
      )
    }
  }

  console.log('No code provided, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login', request.url))
} 