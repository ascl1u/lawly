"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CheckoutVerification() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [verifying, setVerifying] = useState(!!sessionId)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!sessionId) return
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/stripe/checkout-status?session_id=${sessionId}`)
        
        if (!res.ok) {
          throw new Error(`Status check failed: ${res.status}`)
        }
        
        const data = await res.json()
        
        if (data.valid) {
          // Remove session_id from URL without page reload
          router.push('/dashboard', { scroll: false })
          setVerifying(false)
        } else {
          // Increment attempts and continue polling
          setAttempts(prev => prev + 1)
          
          // Poll again in 2 seconds
          setTimeout(checkStatus, 2000)
        }
      } catch (error) {
        console.error('Failed to verify checkout:', error)
        setError(error instanceof Error ? error.message : 'Verification failed')
        setVerifying(false)
      }
    }
    
    checkStatus()
    
    // Set a timeout to stop polling after 30 seconds (15 attempts)
    const timeout = setTimeout(() => {
      setVerifying(false)
      setError('Verification timed out. Your subscription may still be processing.')
    }, 30000)
    
    return () => clearTimeout(timeout)
  }, [sessionId, router])
  
  if (!verifying && !error) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {verifying ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Finalizing your subscription</h3>
              <p className="mt-2 text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Attempt {attempts}/15
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-red-500">Verification Issue</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <button 
                onClick={() => router.push('/dashboard', { scroll: false })}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
              >
                Continue to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 