'use client'

import { Logo } from '@/components/logo'
import { UserAvatarMenu } from '@/components/user-avatar-menu'
import { UpgradeButton } from '@/components/upgrade-button'

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4 border-b border-primary/20">
      <div className="flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <UpgradeButton />
          <UserAvatarMenu />
        </div>
      </div>
    </header>
  )
} 