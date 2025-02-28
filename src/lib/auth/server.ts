import { createClient } from '@/lib/supabase/server'
import { AUTH_COOKIE_CONFIG } from '@/lib/constants/auth'
import { NextResponse } from 'next/server'

export async function auth() {
  console.log('🔐 Server Auth - Starting authentication check')
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('❌ Server Auth Error:', error)
    return null
  }

  console.log('✅ Server Auth - User authenticated:', user?.id)
  return {
    user: {
      id: user.id,
      email: user.email
    }
  }
}

export async function refreshAuthSession(response: NextResponse) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.refreshSession()
  
  if (session) {
    response.cookies.set('sb-access-token', session.access_token, AUTH_COOKIE_CONFIG)
    response.cookies.set('sb-refresh-token', session.refresh_token!, AUTH_COOKIE_CONFIG)
  }
  return response
}