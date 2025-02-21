'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default function ConfirmPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <p>Verifying your email...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-green-600">✓ Verified</h1>
            <p>{message}</p>
            <a 
              href="/auth/login" 
              className="text-primary hover:underline"
            >
              Continue to login
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-red-600">× Error</h1>
            <p className="text-red-500">{message}</p>
            <a 
              href="/auth/signup" 
              className="text-primary hover:underline"
            >
              Back to sign up
            </a>
          </div>
        )}
      </Card>
    </div>
  )
} 