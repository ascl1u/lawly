'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { useAuth } from '@/hooks/useAuth'

function SignUpFormContent() {
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
      console.log('Submitting signup form:', values.email)
      await signUp(values.email, values.password)
      console.log('Signup successful, email verification required')
      setError('Please check your email to verify your account')
    } catch (e) {
      console.error('Signup error:', e)
      const errorMessage = e instanceof Error ? e.message : 'An error occurred during sign up'
      
      if (errorMessage.includes('already registered')) {
        setError(`${errorMessage} Click here to sign in.`)
      } else {
        setError(errorMessage)
      }
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

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpFormContent />
    </Suspense>
  )
} 