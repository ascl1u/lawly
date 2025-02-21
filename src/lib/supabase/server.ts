import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  console.log('Creating server client')
  const cookieStore = await cookies()
  
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('Server client cookies found:', allCookies.length)
          return allCookies
        },
        setAll(cookiesToSet) {
          console.log('Attempting to set cookies in server client:', cookiesToSet.length)
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.log('Cookie setting failed:', error)
          }
        },
      },
    }
  )
  console.log('Server client created successfully')
  return client
}