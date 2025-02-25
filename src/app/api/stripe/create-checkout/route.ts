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
    console.log('💰 Stripe - Checkout initiated with price:', priceId)
    console.log('💰 Stripe - Available price IDs:', Object.values(STRIPE_PRICE_IDS))
    
    // Validate priceId
    if (!Object.values(STRIPE_PRICE_IDS).includes(priceId)) {
      console.error('❌ Stripe - Invalid price ID:', priceId)
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get or create customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: subscription?.stripe_customer_id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        tier: priceId === STRIPE_PRICE_IDS.pro ? 'pro' : 'pay_as_you_go'
      }
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