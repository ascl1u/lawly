import './globals.css'
import { Inter } from 'next/font/google'
import { GlobalLayout } from '@/components/GlobalLayout'

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
    <html lang="en" className="bg-gray-900">
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <GlobalLayout>
          {children}
        </GlobalLayout>
      </body>
    </html>
  )
}
