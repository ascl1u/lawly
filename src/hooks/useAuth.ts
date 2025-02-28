'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleAuthError = (error: AuthError | Error) => {
    console.error('Auth error:', error)
    if (error.message?.includes('already registered')) {
      throw new Error('This email is already registered. Please sign in instead.')
    } else if (error.message?.includes('Invalid login')) {
      throw new Error('Invalid email or password.')
    } else {
      throw new Error('An unexpected error occurred. Please try again.')
    }
  }

  return {
    user,
    loading,
    supabase,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } catch (error) {
        handleAuthError(error instanceof Error ? error : new Error('Unknown error'))
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            data: {
              analysis_usage: 0,
              analysis_limit: 1,
              tier: 'free'
            }
          }
        })
        console.log('Auth signup metadata:', user?.app_metadata)
        if (authError) throw authError
        
        // Check if user already exists
        if (user?.identities?.length === 0) {
          throw new Error('This email is already registered. Please sign in instead.')
        }
        
        return { data: { user } }
      } catch (error) {
        handleAuthError(error instanceof Error ? error : new Error('Unknown error'))
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  }
} 