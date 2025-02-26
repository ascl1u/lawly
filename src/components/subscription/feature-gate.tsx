// src/components/subscription/feature-gate.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { UserSubscription } from '@/lib/stripe/subscription'

interface FeatureGateProps {
  children: React.ReactNode
  subscription: UserSubscription | null
  requiredTier?: 'pro' | 'pay_as_you_go'
}

export function FeatureGate({ 
  children, 
  subscription, 
  requiredTier = 'pro' 
}: FeatureGateProps) {
  const router = useRouter()
  
  // No subscription or inactive
  if (!subscription || !subscription.isActive) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
        <p className="mb-4">This feature requires an active subscription.</p>
        <Button onClick={() => router.push('/pricing')}>
          Subscribe Now
        </Button>
      </div>
    )
  }
  
  // Has subscription but wrong tier
  if (requiredTier === 'pro' && subscription.tier !== 'pro') {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-xl font-bold mb-2">Pro Feature</h3>
        <p className="mb-4">This feature is only available on the Pro plan.</p>
        <Button onClick={() => router.push('/pricing')}>
          Upgrade to Pro
        </Button>
      </div>
    )
  }
  
  // All checks passed, render children
  return <>{children}</>
}