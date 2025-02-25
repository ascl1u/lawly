import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {

  if (process.env.NODE_ENV === 'production' && !globalThis.Request) {
    console.log('🔧 Build-time detected, returning mock Supabase client')
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null })
          })
        })
      }),
      auth: {
        getUser: () => ({ data: { user: null }, error: null }),
        getSession: () => ({ data: { session: null }, error: null }),
        exchangeCodeForSession: () => ({ data: { session: null }, error: null })
      }
    }
  }

  console.log('🔑 Server - Creating client')
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
            console.log('🔑 Server - Cookies set:', cookiesToSet.length)
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}