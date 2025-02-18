import './globals.css'
import { Inter } from 'next/font/google'
import { GlobalLayout } from '@/components/global-layout'
import { cn } from '@/lib/utils'

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn(inter.className, "h-full")}>
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  )
}
