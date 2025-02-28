'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UserSubscription } from '@/lib/stripe/subscription'
import { formatDate } from '@/lib/utils'

interface SubscriptionCardProps {
  subscription: UserSubscription | null
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      
      // Redirect to the Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast.error('Failed to open subscription management portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If no subscription data, show upgrade option
  if (!subscription || !subscription.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>
            You are currently on the free plan with limited features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Analysis limit: {subscription?.users.analysis_limit || 1} per month</p>
          <p>Usage: {subscription?.users.analysis_usage || 0} used this month</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Upgrade to Pro'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Get button text based on subscription state
  const getButtonText = () => {
    if (isLoading) return 'Loading...'
    if (subscription.cancel_at_period_end) return 'Update Subscription'
    return 'Manage Subscription'
  }

  // For active subscriptions
  return (
    <Card>
      <CardHeader>
        <CardTitle>{subscription.isPro ? 'Pro Plan' : 'Standard Plan'}</CardTitle>
        <CardDescription>
          {subscription.status === 'trialing' 
            ? 'Your trial ends soon' 
            : subscription.cancel_at_period_end 
              ? 'Your subscription will end at the current period end'
              : 'Your subscription renews automatically'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Status: <span className="font-medium capitalize">{subscription.status}</span>
            {subscription.cancel_at_period_end && (
              <span className="ml-2 text-amber-600 font-medium">(Canceling)</span>
            )}
          </p>
          <p>Analysis limit: <span className="font-medium">{subscription.users.analysis_limit}</span> per month</p>
          <p>Usage: <span className="font-medium">{subscription.users.analysis_usage}</span> used this month</p>
          {subscription.currentPeriodEnd && (
            <p>
              {subscription.cancel_at_period_end 
                ? 'Expires' 
                : 'Renews'}: <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline"
          onClick={handleManageSubscription}
          disabled={isLoading}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
} 