// src/components/subscription/subscription-status.tsx
import { getUserSubscription } from '@/lib/stripe/subscription'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth/server'

export async function SubscriptionStatus() {
  const session = await auth()
  if (!session?.user) return null
  
  const subscription = await getUserSubscription(session.user.id)
  
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
      
      {subscription ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-medium">
                {subscription.tier === 'pro' ? 'Pro' : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-medium ${
                subscription.isActive ? 'text-green-500' : 'text-amber-500'
              }`}>
                {subscription.status === 'active' ? 'Active' : 
                 subscription.status === 'trialing' ? 'Trial' : 
                 subscription.status === 'past_due' ? 'Past Due' : 
                 subscription.status === 'canceled' ? 'Canceled' : 
                 'Inactive'}
              </p>
            </div>
          </div>
          
          {subscription.currentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">Renews On</p>
              <p className="font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {subscription.tier === 'pro' && (
            <div>
              <p className="text-sm text-muted-foreground">Analyses Used</p>
              <p className="font-medium">
                {subscription.users?.analysis_usage || 0} / {subscription.users?.analysis_limit || 30}
              </p>
            </div>
          )}
          
          <form action="/api/stripe/create-portal" method="POST">
            <Button type="submit" className="w-full">
              Manage Subscription
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <p>You don&apos;t have an active subscription.</p>
          <Button asChild className="w-full">
            <a href="/pricing">View Plans</a>
          </Button>
        </div>
      )}
    </div>
  )
}