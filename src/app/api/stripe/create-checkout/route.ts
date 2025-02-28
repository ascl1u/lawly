import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe/server'
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await req.json()

    // Validate priceId exists and is valid
    if (!priceId || !Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get or create customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    // Determine tier based on priceId
    const tier = priceId === STRIPE_PRICE_IDS.pro ? 'pro' : 'pay_as_you_go'
    
    console.log('💰 Stripe - Creating checkout session for tier:', tier)

    console.log('🔍 Checkout Init - User:', {
      id: session.user.id,
      email: session.user.email,
      hasCustomerId: !!subscription?.stripe_customer_id
    })

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: subscription?.stripe_customer_id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        priceId: priceId,
        tier: tier
      }
    })

    console.log('✅ Checkout Created - Stripe Session:', {
      sessionId: checkoutSession.id,
      customerId: subscription?.stripe_customer_id,
      url: checkoutSession.url
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}