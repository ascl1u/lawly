import { createClient } from '@/lib/supabase/server'

export async function auth() {
  console.log('🔐 Server Auth - Starting authentication check')
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('❌ Server Auth Error:', error)
    return null
  }

  console.log('✅ Server Auth - User authenticated:', user?.id)
  return {
    user: {
      id: user.id,
      email: user.email
    }
  }
}