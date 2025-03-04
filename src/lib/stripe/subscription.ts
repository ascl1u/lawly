import { auth } from '@/lib/auth/server'
import { getSubscriptionData } from './sync'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'none'
export type SubscriptionTier = 'pro' | 'free'

export interface UserSubscription {
  status: SubscriptionStatus
  tier: SubscriptionTier
  isActive: boolean
  isPro: boolean
  analysisLimit: number
  analysisUsage: number
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  paymentMethod: {
    brand: string | null
    last4: string | null
  } | null
}

/**
 * Get the current user's subscription status
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  if (!userId) {
    // Try to get the user ID from the session if not provided
    const session = await auth()
    userId = session?.user?.id
    
    if (!userId) return null
  }
  
  try {
    // Get subscription data from KV store
    const subData = await getSubscriptionData(userId)
    
    if (!subData) {
      console.log('No subscription data found for user:', userId)
      return null
    }
    
    // Get analysis usage from database
    const supabase = await createClient()
    const { data: userData, error } = await supabase
      .from('users')
      .select('analysis_usage')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Failed to get user analysis usage:', error)
    }
    
    // Transform KV data to our interface
    return {
      status: subData.status as SubscriptionStatus,
      tier: subData.tier,
      isActive: ['active', 'trialing'].includes(subData.status),
      isPro: subData.tier === 'pro' && ['active', 'trialing'].includes(subData.status),
      analysisLimit: subData.analysisLimit,
      analysisUsage: userData?.analysis_usage || 0,
      currentPeriodEnd: subData.status !== 'none' && 'currentPeriodEnd' in subData && subData.currentPeriodEnd
        ? new Date(subData.currentPeriodEnd * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subData.status !== 'none' && 'cancelAtPeriodEnd' in subData
        ? subData.cancelAtPeriodEnd
        : false,
      paymentMethod: subData.status !== 'none' && 'paymentMethod' in subData
        ? subData.paymentMethod
        : null
    }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return null
  }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId?: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return !!subscription?.isActive
}

/**
 * Check if a user has pro tier access
 */
export async function hasProAccess(userId?: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return !!subscription?.isPro
}

/**
 * Force update a user's tier and analysis limit in the database
 * This is useful for debugging and ensuring data consistency
 */
export async function forceUpdateUserTier(
  userId: string, 
  tier: SubscriptionTier, 
  analysisLimit: number
): Promise<boolean> {
  try {
    console.log('🔄 Force updating user tier:', { userId, tier, analysisLimit })
    
    const supabase = await createAdminClient()
    
    const { error } = await supabase
      .from('users')
      .update({
        tier,
        analysis_limit: analysisLimit,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      console.error('❌ Error force updating user tier:', error)
      return false
    }
    
    console.log('✅ User tier force updated successfully')
    return true
  } catch (error) {
    console.error('❌ Error force updating user tier:', error)
    return false
  }
}