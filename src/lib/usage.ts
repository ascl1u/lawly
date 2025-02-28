import type { SupabaseClient } from '@supabase/supabase-js'

type UsageResult = {
  allowed: boolean
  remaining: number
  limit: number
  resetCycle?: string
}

export async function checkAnalysisUsage(
  userId: string,
  supabase: SupabaseClient
): Promise<UsageResult> {
  const { data: user, error } = await supabase
    .from('users')
    .select('analysis_usage, analysis_limit, reset_cycle, tier')
    .eq('id', userId)
    .single()
    .throwOnError()

  if (error || !user) {
    console.error('Usage check failed:', error)
    return { allowed: false, remaining: 0, limit: 0 }
  }

  const remaining = Math.max(user.analysis_limit - user.analysis_usage, 0)
  return {
    allowed: remaining > 0,
    remaining,
    limit: user.analysis_limit,
    resetCycle: user.reset_cycle || '1 month'
  }
}

export async function incrementAnalysisUsage(
  userId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; remaining?: number }> {
  const { error } = await supabase.rpc('increment_analysis_usage', {
    user_id: userId
  })
  
  if (error) {
    console.error('Increment error:', error)
    return { success: false }
  }
  const { remaining } = await checkAnalysisUsage(userId, supabase)
  return { success: true, remaining }
} 