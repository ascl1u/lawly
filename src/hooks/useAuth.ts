'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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
  return {
    user,
    loading,
    supabase,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email: string, password: string) => {
      console.log('Attempting signup for:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })

      console.log('Signup response:', { data, error })

      if (error) {
        // Handle specific Supabase error codes
        switch (error.status) {
          case 400:
            if (error.message.includes('already registered')) {
              throw new Error('This email is already registered. Please sign in instead.')
            }
            break
          case 422:
            throw new Error('Invalid email or password format.')
            break
          default:
            console.error('Signup error:', error)
            throw new Error('An unexpected error occurred during sign up.')
        }
      }

      // Check if the user already exists
      if (data?.user?.identities?.length === 0) {
        console.log('User already exists:', data.user)
        throw new Error('This email is already registered. Please sign in instead.')
      }

      return { data }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  }
} 