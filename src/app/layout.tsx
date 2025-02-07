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
    <html lang="en">
      <body className={inter.className}>
        <GlobalLayout>
          {children}
        </GlobalLayout>
      </body>
    </html>
  )
}
