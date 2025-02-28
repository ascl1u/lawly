import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await request.json()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' }, 
      { status: 400 }
    )
  }

  const supabaseAdmin = await createAdminClient()
  
  const { error: userError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      tier: 'free'
    })

  if (userError) {
    console.error('User init failed:', userError)
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    )
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      status: 'active'
    })

  if (error) {
    console.error('Subscription init failed:', error)
    return NextResponse.json(
      { error: 'Failed to initialize subscription' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
} 