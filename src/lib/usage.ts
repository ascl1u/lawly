import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkAnalysisUsage(
  userId: string,
  supabase: SupabaseClient
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('analysis_usage, analysis_limit, tier, status')
    .eq('user_id', userId)
    .single()

  if (!subscription || !subscription?.analysis_limit || subscription.analysis_limit <= 0) {
    return { allowed: false, remaining: 0, limit: 0 }
  }

  const remaining = Math.max(subscription.analysis_limit - subscription.analysis_usage, 0)
  return {
    allowed: remaining > 0,
    remaining,
    limit: subscription.analysis_limit
  }
}

export async function incrementAnalysisUsage(
  userId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; remaining: number }> {
  try {
    const { data, error } = await supabase
      .rpc('increment_usage', { 
        user_id: userId, 
        x: 1 
      })
      .select('analysis_usage, analysis_limit')
      .single()

    if (error) throw error

    const remaining = Math.max(data.analysis_limit - data.analysis_usage, 0)
    return { success: true, remaining }
  } catch (error) {
    console.error('Usage increment failed:', error)
    return { success: false, remaining: 0 }
  }
} 