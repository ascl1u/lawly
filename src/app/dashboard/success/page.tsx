import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { redis, REDIS_KEYS } from '@/lib/redis/client'
import { syncStripeDataToKV } from '@/lib/stripe/sync'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return redirect('/login')
  }

  const sessionId = await searchParams.session_id
  if (!sessionId) {
    return redirect('/dashboard')
  }

  try {
    // Get the customer ID for this user
    const customerId = await redis.get<string>(REDIS_KEYS.USER_TO_CUSTOMER(session.user.id))
    
    if (!customerId) {
      console.error('❌ No Stripe customer found for user:', session.user.id)
      return redirect('/dashboard?error=no-customer')
    }
    
    // Sync the latest data from Stripe to our KV store
    const subscriptionData = await syncStripeDataToKV(customerId)
    
    // Double-check that the database was updated correctly
    if (subscriptionData) {
      const supabase = await createAdminClient()
      
      // Verify the user record was updated
      const { data: userData } = await supabase
        .from('users')
        .select('tier, analysis_limit')
        .eq('id', session.user.id)
        .single()
      
      console.log('🔍 Current user data in database:', userData)
      
      // If the user record doesn't match the subscription data, update it directly
      if (userData && (userData.tier !== subscriptionData.tier || userData.analysis_limit !== subscriptionData.analysisLimit)) {
        console.log('⚠️ User record doesn\'t match subscription data, updating directly')
        
        const { error } = await supabase
          .from('users')
          .update({
            tier: subscriptionData.tier,
            analysis_limit: subscriptionData.analysisLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id)
        
        if (error) {
          console.error('❌ Error updating user record directly:', error)
        } else {
          console.log('✅ User record updated directly:', {
            tier: subscriptionData.tier,
            analysisLimit: subscriptionData.analysisLimit
          })
        }
      }
    }
    
    // Redirect to dashboard
    return redirect('/dashboard?subscription=active')
  } catch (error) {
    console.error('❌ Error syncing subscription data:', error)
    return redirect('/dashboard?error=sync-failed')
  }
} 