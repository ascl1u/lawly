import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { hasActiveSubscription } from '@/lib/stripe/subscription'
import PricingClientPage from './pricing-client'

export default async function PricingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  
  const hasSubscription = await hasActiveSubscription(session.user.id)
  if (hasSubscription) redirect('/dashboard')
  
  return <PricingClientPage />
}