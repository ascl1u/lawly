// src/components/subscription/feature-gate.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { UserSubscription } from '@/lib/stripe/subscription'

interface FeatureGateProps {
  children: React.ReactNode
  subscription: UserSubscription | null
  requiredTier: 'pro' | 'pay_as_you_go'
}

export function FeatureGate({ children, subscription, requiredTier }: FeatureGateProps) {
  const router = useRouter()
  
  // Check if user has required tier access
  const hasAccess = subscription?.tier === requiredTier || 
    (requiredTier === 'pay_as_you_go' && subscription?.tier === 'pro')
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  return (
    <div className="rounded-lg border p-6 text-center">
      <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
      <p className="text-sm text-gray-500 mb-4">
        This feature requires the {requiredTier === 'pro' ? 'Pro Plan' : 'Pay-As-You-Go Plan'}.
      </p>
      <Button onClick={() => router.push('/pricing')}>
        Upgrade Now
      </Button>
    </div>
  )
}