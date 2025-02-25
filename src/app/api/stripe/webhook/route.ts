import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { handleSubscriptionChange, handleInvoiceEvent } from '@/lib/stripe/subscription-handlers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {

  // Skip during static build analysis
  if (typeof req === 'undefined') {
    console.log('Build-time analysis detected, skipping API route execution')
    return new Response('Build time', { status: 200 })
  }

  try {
    const rawBody = await req.text()
    const signature = (await headers()).get('stripe-signature')
    
    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    console.log('🔍 Webhook Debug:', {
      signaturePresent: !!signature,
      signatureLength: signature?.length,
      bodyLength: rawBody.length,
      secretPresent: !!process.env.STRIPE_WEBHOOK_SECRET,
      secretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7)
    })

    const event = await stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('✅ Webhook validated:', {
      type: event.type,
      id: event.id
    })

    const supabase = await createAdminClient()

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event, supabase)
        break
        
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event, supabase)
        break

      default:
        console.log('📝 Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 