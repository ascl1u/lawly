import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis/client'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  const { userId } = await request.json()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' }, 
      { status: 400 }
    )
  }

  try {
    const supabaseAdmin = await createAdminClient()
    
    // Initialize user with free tier
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        tier: 'free',
        analysis_limit: 1
      })

    if (userError) {
      console.error('User init failed:', userError)
      return NextResponse.json(
        { error: 'Failed to initialize user' },
        { status: 500 }
      )
    }
    
    // Check if user already has a Stripe customer
    const existingCustomerId = await redis.get<string>(REDIS_KEYS.USER_TO_CUSTOMER(userId))
    
    if (!existingCustomerId) {
      // Get user email from Supabase
      const { data: userData, error: emailError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()
        
      if (emailError) {
        console.error('Failed to get user email:', emailError)
      }
      
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email: userData?.email || undefined,
        metadata: {
          userId: userId
        }
      })
      
      // Store the mapping in Redis
      await redis.set(REDIS_KEYS.USER_TO_CUSTOMER(userId), customer.id)
      
      // Also store the reverse mapping
      await redis.set(`stripe:customer_to_user:${customer.id}`, userId)
      
      console.log('✅ Created new Stripe customer for user:', {
        userId,
        customerId: customer.id
      })
      
      // Initialize subscription record
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: customer.id,
          status: 'active'
        })

      if (error) {
        console.error('Subscription init failed:', error)
        return NextResponse.json(
          { error: 'Failed to initialize subscription' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth init failed:', error)
    return NextResponse.json(
      { error: 'Failed to initialize user and subscription' },
      { status: 500 }
    )
  }
} 