import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { processStripeEvent } from '@/lib/stripe/sync'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    console.error('❌ Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    // Verify the event with Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    console.log('✅ Webhook signature verified:', {
      type: event.type,
      id: event.id
    })

    // Process the event asynchronously
    // We don't await this to respond to Stripe quickly
    processStripeEvent(event).catch(error => {
      console.error('❌ Error processing webhook event:', {
        type: event.type,
        error
      })
    })

    // Respond to Stripe immediately
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
} 