import './globals.css'
import { Inter } from 'next/font/google'
import Logo from '@/components/Logo'

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
                  <Logo />
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
