// src/app/dashboard/account/page.tsx
import { auth } from '@/lib/auth/server'
// import { getUserSubscription } from '@/lib/stripe/subscription'
import { SubscriptionStatus } from '@/components/subscription/subscription-status'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="rounded-lg border p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              {/* Add more profile fields as needed */}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <SubscriptionStatus />
        </div>
      </div>
    </div>
  )
}