import { stripe } from './server'
import { redis, REDIS_KEYS, StripeSubscriptionCache } from '../redis/client'
import { createAdminClient } from '../supabase/admin'
import type { Stripe } from 'stripe'
import { getPlanFromPriceId } from '@/config/stripe'

/**
 * Syncs all Stripe data for a customer to Redis KV store
 * This is the single source of truth for subscription state
 */
export async function syncStripeDataToKV(customerId: string): Promise<StripeSubscriptionCache> {
  console.log('🔄 Syncing Stripe data to KV for customer:', customerId)
  
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    })

    // If no subscriptions, store basic "none" status
    if (subscriptions.data.length === 0) {
      const subData: StripeSubscriptionCache = { 
        status: 'none',
        tier: 'free',
        analysisLimit: 1
      }
      
      await redis.set(REDIS_KEYS.CUSTOMER_DATA(customerId), subData)
      
      // Also update the database to ensure consistency
      await updateDatabaseFromCache(customerId, subData)
      
      return subData
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0]
    
    // Determine tier and analysis limit based on price ID
    const priceId = subscription.items.data[0]?.price.id
    const tier = getPlanFromPriceId(priceId)
    const analysisLimit = tier === 'pro' ? 30 : 1

    // Store complete subscription state
    const subData: StripeSubscriptionCache = {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0]?.price.id || null,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      tier,
      analysisLimit,
      paymentMethod:
        subscription.default_payment_method &&
        typeof subscription.default_payment_method !== 'string'
          ? {
              brand: subscription.default_payment_method.card?.brand ?? null,
              last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : null,
    }

    // Store the data in Redis
    await redis.set(REDIS_KEYS.CUSTOMER_DATA(customerId), subData)
    
    // Also update the database to ensure consistency
    await updateDatabaseFromCache(customerId, subData)
    
    console.log('✅ Stripe data synced successfully for customer:', customerId)
    return subData
  } catch (error) {
    console.error('❌ Error syncing Stripe data to KV:', error)
    throw error
  }
}

/**
 * Updates the database with data from the cache to ensure consistency
 */
async function updateDatabaseFromCache(
  customerId: string, 
  cacheData: StripeSubscriptionCache
): Promise<void> {
  try {
    // Get user ID from customer ID
    const customerToUserKey = `stripe:customer_to_user:${customerId}`
    const userId = await redis.get<string>(customerToUserKey)
    
    if (!userId) {
      console.error('❌ Could not find user ID for customer:', customerId)
      return
    }
    
    console.log('🔄 Updating database from cache:', { 
      userId, 
      customerId,
      tier: cacheData.tier,
      analysisLimit: cacheData.analysisLimit,
      status: cacheData.status
    })
    
    const supabase = await createAdminClient()
    
    // Update subscription record if it's a subscription with an ID
    if (cacheData.status !== 'none' && 'subscriptionId' in cacheData && cacheData.subscriptionId) {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: cacheData.subscriptionId,
          status: cacheData.status,
          price_id: cacheData.priceId,
          current_period_start: cacheData.currentPeriodStart 
            ? new Date(cacheData.currentPeriodStart * 1000).toISOString() 
            : null,
          current_period_end: cacheData.currentPeriodEnd 
            ? new Date(cacheData.currentPeriodEnd * 1000).toISOString() 
            : null,
          cancel_at_period_end: cacheData.cancelAtPeriodEnd,
          updated_at: new Date().toISOString()
        }, 
        { onConflict: 'user_id' })
        
      if (subscriptionError) {
        console.error('❌ Error updating subscription record:', subscriptionError)
      } else {
        console.log('✅ Subscription record updated successfully')
      }
    }
    
    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        tier: cacheData.tier,
        analysis_limit: cacheData.analysisLimit,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      
    if (userError) {
      console.error('❌ Error updating user record:', userError)
    } else {
      console.log('✅ User record updated successfully:', {
        tier: cacheData.tier,
        analysisLimit: cacheData.analysisLimit
      })
    }
      
    console.log('✅ Database updated from cache for user:', userId)
  } catch (error) {
    console.error('❌ Error updating database from cache:', error)
  }
}

/**
 * Gets the subscription data for a user from Redis KV
 */
export async function getSubscriptionData(userId: string): Promise<StripeSubscriptionCache | null> {
  try {
    // Get customer ID from user ID
    const customerId = await redis.get<string>(REDIS_KEYS.USER_TO_CUSTOMER(userId))
    
    if (!customerId) {
      console.log('⚠️ No Stripe customer found for user:', userId)
      return null
    }
    
    // Get subscription data from customer ID
    const subData = await redis.get<StripeSubscriptionCache>(REDIS_KEYS.CUSTOMER_DATA(customerId))
    
    if (!subData) {
      // If no data in KV, sync from Stripe
      return await syncStripeDataToKV(customerId)
    }
    
    return subData
  } catch (error) {
    console.error('❌ Error getting subscription data:', error)
    return null
  }
}

/**
 * Processes a Stripe event by syncing the relevant customer data
 */
export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  // Skip processing if the event isn't relevant
  if (!ALLOWED_EVENTS.includes(event.type)) {
    console.log('⏭️ Skipping non-tracked event:', event.type)
    return
  }

  // Extract customer ID from the event
  const { customer: customerId } = event.data.object as {
    customer?: string | Stripe.Customer
  }
  
  // Handle both string and object customer references
  const customerIdString = typeof customerId === 'string' 
    ? customerId 
    : customerId?.id
  
  if (!customerIdString) {
    console.error('❌ No customer ID found in event:', event.type)
    return
  }

  // Sync the customer data to KV
  await syncStripeDataToKV(customerIdString)
}

// List of Stripe events that should trigger a sync
export const ALLOWED_EVENTS: Stripe.Event.Type[] = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.pending_update_applied',
  'customer.subscription.pending_update_expired',
  'customer.subscription.trial_will_end',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'invoice.upcoming',
  'invoice.marked_uncollectible',
  'invoice.payment_succeeded',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
] 