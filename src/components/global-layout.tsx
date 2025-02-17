'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { FileText, Upload, Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Logo } from '@/components/logo'
import { Footer } from '@/components/footer'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Initialize from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebarOpen')
    if (stored !== null) {
      setIsSidebarOpen(stored === 'true')
    }
  }, [])

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString())
  }, [isSidebarOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleNavigation = (href: string) => {
    if (!user) {
      if (href === '/documents') {
        router.push('/auth/login?redirect=/documents')
      } else {
        router.push('/auth/login')
      }
    } else {
      router.push(href)
    }
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

  // Only hide sidebar for auth pages
  const isAuthPage = pathname.startsWith('/auth/')

  if (isAuthPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <nav className="bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Logo />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div className={`
          ${isSidebarOpen ? 'w-64' : 'w-16'} 
          min-w-[4rem] 
          bg-gray-800 
          transition-all 
          duration-300 
          flex 
          flex-col
          fixed 
          h-screen
        `}>
          <div className="p-4">
            {isSidebarOpen ? <Logo /> : null}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-4 hover:bg-gray-700 flex justify-center"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>
          
          <nav className="flex-1 pt-4">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="w-full p-4 flex items-center justify-center text-gray-400 hover:bg-gray-700"
              >
                <item.icon className="w-6 h-6" />
                {isSidebarOpen && <span className="ml-4">{item.label}</span>}
              </button>
            ))}
          </nav>

          {user && (
            <button
              onClick={handleSignOut}
              className="w-full p-4 flex items-center justify-center text-red-400 hover:bg-gray-700 mt-auto"
            >
              <LogOut className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-4">Sign Out</span>}
            </button>
          )}
        </div>
        <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
          {children}
        </main>
      </div>
      <footer className={`${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <Footer />
      </footer>
    </div>
  )
}