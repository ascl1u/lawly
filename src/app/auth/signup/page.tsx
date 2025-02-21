'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/hooks/useAuth'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signUp, loading: authLoading } = useAuth()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/documents'
      router.push(redirectTo)
    }
  }, [user, router, searchParams])

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(undefined)
    setLoading(true)

    try {
      await signUp(values.email, values.password)
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
      loading={loading || authLoading}
    />
  )
}

export default SignUpForm 