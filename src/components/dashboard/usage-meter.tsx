import { Progress } from '@/components/ui/progress'

interface UsageMeterProps {
  used: number
  limit: number
  tier: 'free' | 'pro' | 'pay_as_you_go'
  resetDate?: string | null
}

export function UsageMeter({ used, limit, tier, resetDate }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const isUnlimited = tier === 'pay_as_you_go'
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Analysis Usage</span>
        <span>
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      
      <Progress value={isUnlimited ? 0 : percentage} className="h-2" />
      
      {resetDate && (
        <p className="text-xs text-muted-foreground">
          Resets on {new Date(resetDate).toLocaleDateString()}
        </p>
      )}
      
      {tier === 'free' && used >= limit && (
        <p className="text-xs text-amber-600 font-medium mt-2">
          You&apos;ve reached your free limit. Upgrade for more analyses.
        </p>
      )}
    </div>
  )
} 