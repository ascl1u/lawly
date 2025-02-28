import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { handleSubscriptionChange, handleInvoiceEvent } from '@/lib/stripe/subscription-handlers'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  // Skip during static build analysis
  if (typeof req === 'undefined') {
    console.log('Build-time analysis detected, skipping API route execution')
    return new Response('Build time', { status: 200 })
  }

  try {
    console.log('📥 Webhook received')
    const rawBody = await req.text()
    const signature = (await headers()).get('stripe-signature')
    
    if (!signature) {
      console.error('❌ Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    try {
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

      try {
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

          case 'billing_portal.session.created': {
            const portalSession = event.data.object as Stripe.BillingPortal.Session;
            console.log('✅ Customer portal session created:', {
              id: portalSession.id,
              customer: portalSession.customer,
              returnUrl: portalSession.return_url
            });
            break;
          }

          case 'customer.subscription.trial_will_end': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('⚠️ Trial will end soon:', {
              subscription: subscription.id,
              customer: subscription.customer
            });
            break;
          }

          default:
            console.log('📝 Unhandled event type:', event.type)
        }
        
        return NextResponse.json({ received: true })
      } catch (error) {
        console.error(`❌ Error processing webhook event ${event.type}:`, error)
        // Return 200 to acknowledge receipt even if processing failed
        // This prevents Stripe from retrying the webhook
        return NextResponse.json({ 
          received: true,
          warning: 'Event received but processing failed'
        })
      }
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 