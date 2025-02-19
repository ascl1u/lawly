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
      className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Get Pro Access
    </Button>
  )
} 