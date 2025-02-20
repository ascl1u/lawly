'use client'

import Link from 'next/link'
import { FileText, Upload, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MainSidebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function MainSidebar({ sidebarOpen, onToggleSidebar }: MainSidebarProps) {
  return (
    <aside
      className={cn(
        "bg-primary text-primary-foreground transition-all duration-300 flex flex-col",
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <nav className="flex-1 p-4">
        <button
          onClick={onToggleSidebar}
          className="mb-4 p-2 hover:bg-primary-foreground/10 rounded-lg w-full flex items-center"
        >
          <Menu className="h-5 w-5 min-w-[20px]" />
          {sidebarOpen && <span className="ml-2">Toggle Menu</span>}
        </button>
        
        <Link
          href="/documents"
          className="mb-2 p-2 hover:bg-primary-foreground/10 rounded-lg flex items-center"
        >
          <FileText className="h-5 w-5 min-w-[20px]" />
          {sidebarOpen && <span className="ml-2">Documents</span>}
        </Link>
        
        <Link
          href="/upload"
          className="p-2 hover:bg-primary-foreground/10 rounded-lg flex items-center"
        >
          <Upload className="h-5 w-5 min-w-[20px]" />
          {sidebarOpen && <span className="ml-2">Upload</span>}
        </Link>
      </nav>
    </aside>
  )
} 