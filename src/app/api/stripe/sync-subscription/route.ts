import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { redis, REDIS_KEYS } from '@/lib/redis/client'
import { syncStripeDataToKV } from '@/lib/stripe/sync'
import { forceUpdateUserTier } from '@/lib/stripe/subscription'

/**
 * API endpoint for manually syncing a user's subscription data
 * This is useful for debugging and ensuring data consistency
 */
export async function POST() {
  try {
    // Authenticate the user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Get the customer ID for this user
    const customerId = await redis.get<string>(REDIS_KEYS.USER_TO_CUSTOMER(userId))
    
    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found for user' }, { status: 404 })
    }
    
    // Sync the latest data from Stripe to our KV store
    const subscriptionData = await syncStripeDataToKV(customerId)
    
    // Force update the user's tier and analysis limit in the database
    if (subscriptionData) {
      await forceUpdateUserTier(
        userId, 
        subscriptionData.tier, 
        subscriptionData.analysisLimit
      )
    }
    
    return NextResponse.json({ 
      success: true,
      subscription: subscriptionData
    })
  } catch (error) {
    console.error('❌ Error syncing subscription data:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription data' },
      { status: 500 }
    )
  }
} 