import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lawly - AI-Powered Legal Assistant',
  description: 'Analyze and understand legal documents with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-900">
          <nav className="bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex-shrink-0">
                  <Link 
                    href="/" 
                    className="text-4xl font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    Lawly
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  )
}
