'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UpgradeButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/pricing')}
      variant="outline"
      className="border-secondary bg-primary-foreground text-primary hover:bg-primary-foreground/90"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Get Pro Access
    </Button>
  )
} 