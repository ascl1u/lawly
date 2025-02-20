'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'
import { MainSidebar } from '@/components/main-sidebar'
import { Header } from '@/components/header'

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const hideNavigation = pathname.startsWith('/auth/') || pathname === '/'
  const hideFooter = pathname.startsWith('/auth/') || pathname.includes('/documents/')

  if (hideNavigation) {
    return (
      <div className="h-full flex flex-col">
        <main className="flex-1 flex flex-col justify-center">
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>
          {!hideFooter && <Footer />}
        </main>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1">
        <MainSidebar 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      {!hideFooter && <Footer />}
    </div>
  )
}