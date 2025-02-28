import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null
export type SubscriptionTier = 'pro' | 'pay_as_you_go' | null

export interface UserSubscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeCheckoutSessionId: string | null
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  cancel_at_period_end: boolean
  isActive: boolean
  isPro: boolean
  tier: 'free' | 'pro' | 'pay_as_you_go'  // From users table
  users: {
    analysis_usage: number
    analysis_limit: number
    reset_cycle: string | null
  }
}

/**
 * Get the current user's subscription status
 */
export async function getUserSubscription(
  userId: string,
  supabase?: SupabaseClient
): Promise<UserSubscription | null> {
  if (!userId) return null
  
  // Use provided client or create a new one
  const client = supabase || await createClient()
  
  const { data, error } = await client
    .from('subscriptions')
    .select(`
      *,
      users!inner (
        tier,
        analysis_usage,
        analysis_limit,
        reset_cycle
      )
    `)
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    console.log('No subscription found for user:', userId)
    return null
  }
  
  // Transform database record to our interface
  return {
    id: data.id,
    userId: data.user_id,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    stripeCheckoutSessionId: data.stripe_checkout_session_id,
    status: data.status as SubscriptionStatus,
    currentPeriodEnd: data.current_period_end,
    cancel_at_period_end: data.cancel_at_period_end || false,
    isActive: ['active', 'trialing'].includes(data.status),
    isPro: data.users.tier === 'pro' && ['active', 'trialing'].includes(data.status),
    tier: data.users.tier,  // Get tier from users table
    users: {
      analysis_usage: data.users.analysis_usage,
      analysis_limit: data.users.analysis_limit,
      reset_cycle: data.users.reset_cycle
    }
  }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return !!subscription?.isActive
}

/**
 * Check if a user has pro tier access
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return !!subscription?.isPro
}