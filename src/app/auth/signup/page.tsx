'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthForm } from '@/components/auth/auth-form'

function SignUpForm() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/upload'
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(undefined)
    setLoading(true)

    try {
      const { error: checkError } = await supabase.auth.resetPasswordForEmail(values.email)

      if (!checkError) {
        setError('An account with this email already exists')
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`
        }
      })

      if (signUpError) throw signUpError
      setError('Please check your email to verify your account')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm 
      type="signup" 
      onSubmit={handleSubmit} 
      error={error}
      loading={loading}
    />
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
} 