import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  
  if (error) {
    // Redirect to signup with error message
    return NextResponse.redirect(
      new URL(`/auth/signup?error=${error_description}`, request.url)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Add a small delay to ensure confirmation is complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create user profile after email confirmation
      await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email
        }, {
          onConflict: 'id'
        })
      
      return NextResponse.redirect(new URL('/upload', request.url))
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
} 