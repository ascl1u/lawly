// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth/server'
import { getUserSubscription } from '@/lib/stripe/subscription'
import { UsageMeter } from '@/components/dashboard/usage-meter'
import { SubscriptionCard } from '@/components/subscription/subscription-card'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
    
  const subscription = await getUserSubscription(session.user.id)
  
  // Extract usage data from subscription
  const usageData = {
    used: subscription?.analysisUsage || 0,
    limit: subscription?.analysisLimit || 1,
    tier: subscription?.tier || 'free',
    resetDate: subscription?.currentPeriodEnd
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Usage Overview</h2>
          <UsageMeter 
            used={usageData.used}
            limit={usageData.limit}
            tier={usageData.tier}
            resetDate={usageData.resetDate}
          />
        </div>
        
        <div>
          <SubscriptionCard subscription={subscription} />
        </div>
      </div>
    </div>
  )
}