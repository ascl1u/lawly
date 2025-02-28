import { getUserSubscription } from '@/lib/stripe/subscription'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const handlePortal = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const subscription = await getUserSubscription(user.id)
      if (!subscription?.stripeCustomerId) {
        throw new Error('No active subscription')
      }

      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handlePortal}
        disabled={loading}
        variant="outline"
      >
        {loading ? 'Loading...' : 'Manage Billing'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}