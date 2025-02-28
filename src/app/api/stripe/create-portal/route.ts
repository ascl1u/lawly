import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth/server'

export async function POST(req: Request) {
  // Skip during static build analysis
  if (typeof req === 'undefined') {
    console.log('Build-time analysis detected, skipping API route execution')
    return new Response('Build time', { status: 200 })
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.error('❌ Portal creation failed: No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status, cancel_at_period_end')
      .eq('user_id', session.user.id)
      .single()

    if (subscriptionError || !subscription?.stripe_customer_id) {
      console.error('❌ Portal creation failed: No subscription found', {
        userId: session.user.id,
        error: subscriptionError
      })
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    console.log('🔍 Creating portal session for customer:', {
      customerId: subscription.stripe_customer_id,
      subscriptionId: subscription.stripe_subscription_id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    })

    // Create a portal session with appropriate configuration based on subscription state
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      // Only specify flow_data for active subscriptions that aren't already canceling
      ...(subscription.status === 'active' && !subscription.cancel_at_period_end
        ? {
            flow_data: {
              type: 'subscription_cancel',
              subscription_cancel: {
                subscription: subscription.stripe_subscription_id
              }
            }
          }
        : {})
    })

    console.log('✅ Portal session created:', {
      url: portalSession.url,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('❌ Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}