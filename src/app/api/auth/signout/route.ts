import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    )

    // Clear all Supabase-related cookies
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token'
    ]
    
    cookieNames.forEach(name => {
      response.cookies.set({
        name,
        value: '',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    })

    return response
  } catch (error) {
    console.error('Server-side sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}
