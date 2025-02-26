// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth/server'
// import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/stripe/subscription'
import { UsageMeter } from '@/components/dashboard/usage-meter'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const subscription = await getUserSubscription(session.user.id)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      {subscription?.isPro && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-semibold mb-4">Usage Overview</h2>
          <UsageMeter 
            usage={subscription.analysisUsage} 
            limit={subscription.analysisLimit} 
          />
          <p className="text-sm text-gray-600 mt-3">
            Resets on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}