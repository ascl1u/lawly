'use client'

import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const handleSubmit = async (values: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (!error) {
      const redirectTo = searchParams.get('redirect') || '/documents'
      router.push(redirectTo)
    }
  }

  return <AuthForm type="login" onSubmit={handleSubmit} />
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
} 