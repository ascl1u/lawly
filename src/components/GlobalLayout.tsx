'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-800 transition-all duration-300 ease-in-out flex flex-col`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-4 hover:bg-gray-700"
        >
          <Menu className="w-6 h-6 text-gray-400" />
        </button>
        
        <nav className="flex-1 pt-4">
          {navigationItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full p-4 flex items-center text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <item.icon className="w-6 h-6" />
              {isSidebarOpen && (
                <span className="ml-4">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center text-red-400 hover:bg-gray-700 hover:text-red-300 border-t border-gray-700"
        >
          <LogOut className="w-6 h-6" />
          {isSidebarOpen && <span className="ml-4">Sign Out</span>}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}