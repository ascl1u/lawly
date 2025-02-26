import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { hasActiveSubscription } from '@/lib/stripe/subscription'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hasSubscription = await hasActiveSubscription(session.user.id)
  
  if (hasSubscription) {
    return NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL)
    )
  }

  return NextResponse.json({ hasActiveSubscription: false })
} 