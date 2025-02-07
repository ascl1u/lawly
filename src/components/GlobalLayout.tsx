'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Logo from './Logo'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigationItems = [
    {
      label: 'My Documents',
      icon: FileText,
      href: '/documents',
    },
    {
      label: 'Upload Document',
      icon: Upload,
      href: '/upload',
    },
  ]

  // Only show sidebar for authenticated routes
  if (!user || window.location.pathname === '/' || window.location.pathname.startsWith('/auth/')) {
    return (
      <>
        <nav className="bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Logo />
            </div>
          </div>
        </nav>
        {children}
      </>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 transition-all duration-300`}>
        <div className="p-4">
          <Logo />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 hover:bg-gray-700">
          <Menu className="w-6 h-6 text-gray-400" />
        </button>
        
        <nav className="flex-1 pt-4">
          {navigationItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full p-4 flex items-center text-gray-400 hover:bg-gray-700"
            >
              <item.icon className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-4">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center text-red-400 hover:bg-gray-700"
        >
          <LogOut className="w-6 h-6" />
          {isSidebarOpen && <span className="ml-4">Sign Out</span>}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}