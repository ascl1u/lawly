'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        console.log('Session details:', {
          hasSession: !!session,
          user: session?.user || null,
          expiresAt: session?.expires_at || null
        })

        // Check if session is about to expire (within 5 minutes)
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000)
          const fiveMinutes = 5 * 60 * 1000
          if (expiresAt.getTime() - Date.now() < fiveMinutes) {
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) throw refreshError
          }
        }

        setUser(session?.user ?? null)
      } catch (e) {
        console.error('Session check error:', e)
        setError(e instanceof Error ? e : new Error('Session check failed'))
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, {
        hasSession: !!session,
        user: session?.user || null
      })

      if (event === 'SIGNED_OUT') {
        router.push('/')
      }

      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return { user, loading, error }
} 