import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null
export type SubscriptionTier = 'pro' | 'pay_as_you_go' | null

export interface UserSubscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  isActive: boolean
  isPro: boolean
  analysisUsage: number
  analysisLimit: number
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
    .select('*')
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
    tier: data.tier as SubscriptionTier,
    status: data.status as SubscriptionStatus,
    currentPeriodEnd: data.current_period_end,
    isActive: ['active', 'trialing'].includes(data.status),
    isPro: data.tier === 'pro' && ['active', 'trialing'].includes(data.status),
    analysisUsage: data.analysis_usage,
    analysisLimit: data.analysis_limit
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