import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null

    if (!token_hash || !type) {
      return NextResponse.redirect(
        new URL('/auth/login?error=Missing confirmation parameters', request.url)
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    // Create or update user record after successful verification
    if (data.user) {
      // No need to update anything - Supabase handles confirmation automatically
      // The trigger will have already created the public user record
      console.log('Successfully confirmed user:', data.user.id)
    }

    return NextResponse.redirect(
      new URL(`/api/auth/callback?next=${encodeURIComponent('/upload')}`, request.url)
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=Failed to verify email', request.url)
    )
  }
} 