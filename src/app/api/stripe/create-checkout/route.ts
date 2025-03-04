import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe/server'
import { auth } from '@/lib/auth/server'
import { redis, REDIS_KEYS } from '@/lib/redis/client'

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

    const userId = session.user.id
    
    // Get or create Stripe customer
    let stripeCustomerId = await redis.get<string>(REDIS_KEYS.USER_TO_CUSTOMER(userId))
    
    // If no customer exists, create one
    if (!stripeCustomerId) {
      console.log('🆕 Creating new Stripe customer for user:', userId)
      
      const newCustomer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: userId
        }
      })
      
      stripeCustomerId = newCustomer.id
      
      // Store the mapping in Redis
      await redis.set(REDIS_KEYS.USER_TO_CUSTOMER(userId), stripeCustomerId)
      
      // Also store the reverse mapping
      await redis.set(`stripe:customer_to_user:${stripeCustomerId}`, userId)
      
      console.log('✅ Created new Stripe customer:', {
        userId,
        customerId: stripeCustomerId
      })
    }

    // Determine tier based on priceId
    const tier = priceId === STRIPE_PRICE_IDS.pro ? 'pro' : 'free'
    
    console.log('💰 Creating checkout session for tier:', tier)

    // Create checkout session with the customer ID
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        priceId: priceId,
        tier: tier
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier
        }
      }
    })

    console.log('✅ Checkout session created:', {
      sessionId: checkoutSession.id,
      customerId: stripeCustomerId,
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