'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sync subscription')
      }

      await response.json()
      
      toast.success('Subscription synced successfully')
      
      // Refresh the page to show the updated subscription data
      router.refresh()
    } catch (error) {
      console.error('Error syncing subscription:', error)
      toast.error('Failed to sync subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSync}
      disabled={isLoading}
    >
      {isLoading ? 'Syncing...' : 'Sync Subscription'}
    </Button>
  )
} 