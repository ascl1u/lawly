'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'

function ConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (!token_hash || !type) {
          throw new Error('Missing confirmation parameters')
        }

        const response = await fetch(
          `/api/auth/confirm?token_hash=${token_hash}&type=${type}`,
          { method: 'GET' }
        )

        if (!response.ok) throw new Error('Verification failed')
        
        setStatus('success')
        setMessage('Email verified successfully! You can now sign in.')
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Verification failed')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <Card className="p-6">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </Card>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <Card className="p-6">
        <p>Loading...</p>
      </Card>
    }>
      <ConfirmContent />
    </Suspense>
  )
} 