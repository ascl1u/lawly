'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SubscriptionTier } from '@/types/supabase'

interface LimitReachedMessageProps {
  tier: SubscriptionTier
  limit: number
  resetCycle?: string
}

export function LimitReachedMessage({ tier, limit, resetCycle = '1 month' }: LimitReachedMessageProps) {
  const router = useRouter()
  
  const isFree = tier === 'free'
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-xl">Analysis Limit Reached</CardTitle>
        </div>
        <CardDescription>
          {isFree 
            ? `You've reached your free tier limit of ${limit} document analyses.`
            : `You've reached your Pro tier limit of ${limit} document analyses.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isFree 
            ? 'Upgrade to Pro for higher limits and additional features.'
            : `Your limit will reset at the beginning of your next billing cycle (${resetCycle}).`
          }
        </p>
        
        {isFree && (
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pro Plan Benefits
            </h3>
            <ul className="text-sm space-y-2">
              <li>• Higher document analysis limits</li>
              <li>• Priority processing</li>
              <li>• Advanced risk analysis</li>
              <li>• Unlimited document storage</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isFree ? (
          <Button 
            onClick={() => router.push('/pricing')}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        ) : (
          <Button 
            onClick={() => router.push('/documents')}
            variant="outline"
            className="w-full"
          >
            Return to Documents
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 