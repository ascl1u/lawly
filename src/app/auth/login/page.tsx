'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, loading: authLoading } = useAuth()
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
      await signIn(values.email, values.password)
      const redirectTo = searchParams.get('redirect') || '/documents'
      router.push(redirectTo)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm 
      type="login" 
      onSubmit={handleSubmit} 
      error={error}
      loading={loading || authLoading}
    />
  )
}

export default LoginForm 