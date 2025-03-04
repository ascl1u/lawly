/**
 * Migration script to move existing Stripe customers to the KV store
 * 
 * Run this script with:
 * npx tsx src/scripts/migrate-stripe-to-kv.ts
 */

import { createAdminClient } from '../lib/supabase/admin'
import { redis, REDIS_KEYS } from '../lib/redis/client'
import { syncStripeDataToKV } from '../lib/stripe/sync'

async function migrateStripeToKV() {
  console.log('🚀 Starting Stripe to KV migration')
  
  try {
    // Get all users with subscriptions from Supabase
    const supabase = await createAdminClient()
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('user_id, stripe_customer_id, stripe_subscription_id')
      .not('stripe_customer_id', 'is', null)
    
    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    }
    
    console.log(`Found ${subscriptions.length} subscriptions to migrate`)
    
    // Process each subscription
    for (const sub of subscriptions) {
      try {
        if (!sub.stripe_customer_id) {
          console.log(`⚠️ Skipping subscription without customer ID for user ${sub.user_id}`)
          continue
        }
        
        console.log(`Processing user ${sub.user_id} with customer ${sub.stripe_customer_id}`)
        
        // Store the mapping in Redis
        await redis.set(REDIS_KEYS.USER_TO_CUSTOMER(sub.user_id), sub.stripe_customer_id)
        
        // Also store the reverse mapping
        await redis.set(`stripe:customer_to_user:${sub.stripe_customer_id}`, sub.user_id)
        
        // Sync the customer data to KV
        await syncStripeDataToKV(sub.stripe_customer_id)
        
        console.log(`✅ Successfully migrated user ${sub.user_id}`)
      } catch (subError) {
        console.error(`❌ Error migrating user ${sub.user_id}:`, subError)
      }
    }
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
migrateStripeToKV().catch(console.error) 