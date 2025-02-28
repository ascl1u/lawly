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

      // Validate session token
      const { data: { user: validUser }, error: validationError } = await supabase.auth.getUser(
        session?.access_token
      )

      if (validationError || !validUser) {
        console.error('Session validation error:', validationError)
        throw new Error('Invalid session token')
      }

      console.log('Session validated:', { 
        userId: validUser.id,
        userEmail: validUser.email
      })

      if (!session?.user) {
        console.error('No user in session after validation')
        throw new Error('No user session after validation')
      }

      // Initialize user data if needed
      try {
        // Check if user exists in public.users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', validUser.id)
          .single();
        
        if (!existingUser) {
          // Create user record with default values
          await supabase.from('users').insert({
            id: validUser.id,
            email: validUser.email,
            analysis_usage: 0,
            analysis_limit: 1,
            tier: 'free'
          });
          
          console.log('Created new user record for:', validUser.id);
        }
      } catch (initError) {
        console.error('Failed to initialize user data:', initError);
        // Continue with redirect even if this fails
      }

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