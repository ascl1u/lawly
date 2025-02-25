import { SubscriptionStatus } from '@/components/subscription-status'

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <SubscriptionStatus />
    </div>
  )
} 