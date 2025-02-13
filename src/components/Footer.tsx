'use client'

import Link from 'next/link'
import { Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-800 w-full">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              © {new Date().getFullYear()} Lawly. All rights reserved.
            </span>
            <a 
              href="https://x.com/dingusmage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 
