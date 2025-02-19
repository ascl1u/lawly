'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { FileText, Upload, Menu } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Footer } from '@/components/footer'
import { UserAvatarMenu } from '@/components/user-avatar-menu'
import Link from 'next/link'
import { UpgradeButton } from '@/components/upgrade-button'

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
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-gray-800 text-white transition-all duration-300 flex flex-col`}
        >
          <nav className="flex-1 p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 p-2 hover:bg-gray-700 rounded-lg w-full flex items-center"
            >
              <Menu className="h-5 w-5 min-w-[20px]" />
              {sidebarOpen && <span className="ml-2">Toggle Menu</span>}
            </button>
            <Link
              href="/documents"
              className="mb-2 p-2 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <FileText className="h-5 w-5 min-w-[20px]" />
              {sidebarOpen && <span className="ml-2">Documents</span>}
            </Link>
            <Link
              href="/upload"
              className="p-2 hover:bg-gray-700 rounded-lg flex items-center"
            >
              <Upload className="h-5 w-5 min-w-[20px]" />
              {sidebarOpen && <span className="ml-2">Upload</span>}
            </Link>
          </nav>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <Logo />
              <div className="flex items-center gap-4">
                <UpgradeButton />
                <UserAvatarMenu />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      {!hideFooter && <Footer />}
    </div>
  )
}