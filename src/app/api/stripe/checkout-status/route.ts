import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session ID' },
      { status: 400 }
    )
  }

  console.log('🔍 Checking checkout status for session:', sessionId)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, user_id, stripe_checkout_session_id')
    .eq('stripe_checkout_session_id', sessionId)
    .single()

  if (error) {
    console.log('❓ No subscription found for session:', sessionId)
    return NextResponse.json(
      { valid: false, status: 'pending' },
      { status: 200 }
    )
  }

  console.log('✅ Found subscription for session:', {
    sessionId,
    userId: data.user_id,
    status: data.status
  })

  return NextResponse.json({
    valid: true,
    status: data.status
  })
} 