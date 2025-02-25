import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createAdminClient() {
  if (process.env.NODE_ENV === 'production' && !globalThis.Request) {
    console.log('🔧 Build-time detected, returning mock admin client')
    
    const mockAdminClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null })
          }),
          order: () => ({ data: [], error: null }),
          limit: () => ({ data: [], error: null })
        }),
        upsert: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
      }),
      auth: {
        admin: {
          getUserById: () => ({ data: { user: null }, error: null })
        }
      },
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' }, error: null })
        })
      }
    }
    
    return mockAdminClient as unknown as SupabaseClient
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      }
    }
  )
}