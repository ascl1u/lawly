'use client'

import { LogOut } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'

export function UserAvatarMenu() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      // 1. Server-side sign out
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Server sign out failed')
      }

      // 2. Client-side sign out
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // 3. Clear client state and redirect
      router.refresh()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Force reload as fallback
      window.location.href = '/'
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 border-2 border-primary-foreground/20">
          <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
            U
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-primary text-primary-foreground">
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="hover:bg-primary-foreground/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 