'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

interface SubscriptionDetails {
  tier: 'free' | 'pro' | 'pay_as_you_go'
  documentsUsed: number
  documentsLimit: number | null
  validUntil?: string
  credits?: number
}

export function SubscriptionStatus() {
  // const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subscription, ] = useState<SubscriptionDetails>({ //setSubscription
    tier: 'free',
    documentsUsed: 0,
    documentsLimit: 1
  })

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST'
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierDisplay = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'Pro Plan'
      case 'pay_as_you_go':
        return 'Pay-As-You-Go'
      default:
        return 'Free Plan'
    }
  }

  const getUsageDisplay = () => {
    if (subscription.tier === 'pay_as_you_go') {
      return `Credits remaining: ${subscription.credits || 0}`
    }
    return `${subscription.documentsUsed} / ${subscription.documentsLimit || '∞'} documents used`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Current Plan</span>
              <span className="font-medium">{getTierDisplay(subscription.tier)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Usage</span>
              <span>{getUsageDisplay()}</span>
            </div>
            {subscription.validUntil && (
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Renews</span>
                <span>{new Date(subscription.validUntil).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleManageSubscription}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Manage Subscription'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 