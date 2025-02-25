import type { Stripe } from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function handleSubscriptionChange(
  event: Stripe.Event,
  supabase: SupabaseClient
) {
  console.log('🎯 Processing subscription event:', {
    type: event.type,
    id: event.id,
    object: event.object
  })

  const data = event.data.object as Stripe.Subscription

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = data as unknown as Stripe.Checkout.Session
        console.log('📦 Checkout session data:', {
          userId: session.metadata?.userId,
          customerId: session.customer,
          subscriptionId: session.subscription,
          tier: session.metadata?.tier
        })

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.metadata?.userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier: session.metadata?.tier,
            status: 'active',
            current_period_end: new Date(session.expires_at! * 1000).toISOString()
          })

        if (upsertError) {
          console.error('❌ Failed to upsert subscription:', upsertError)
          throw upsertError
        }

        console.log('✅ Successfully created subscription record')
        break

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('🔄 Subscription update data:', {
          subscriptionId: data.id,
          status: data.status,
          customerId: data.customer,
          currentPeriodEnd: new Date(data.current_period_end * 1000)
        })

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: event.type === 'customer.subscription.deleted' ? 'canceled' : data.status,
            current_period_start: new Date(data.current_period_start * 1000).toISOString(),
            current_period_end: new Date(data.current_period_end * 1000).toISOString(),
            cancel_at_period_end: data.cancel_at_period_end
          })
          .eq('stripe_subscription_id', data.id)

        if (updateError) {
          console.error('❌ Failed to update subscription:', updateError)
          throw updateError
        }

        // Verify the update
        const { data: verifyData, error: verifyError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', data.id)
          .single()

        if (verifyError) {
          console.error('❌ Failed to verify subscription update:', verifyError)
        } else {
          console.log('✅ Verified subscription update:', verifyData)
        }
        break
    }
  } catch (error) {
    console.error('❌ Subscription handler error:', {
      eventType: event.type,
      error
    })
    throw error
  }
}

export async function handleInvoiceEvent(
  event: Stripe.Event,
  supabase: SupabaseClient
) {
  const invoice = event.data.object as Stripe.Invoice
  console.log('💰 Processing invoice event:', {
    type: event.type,
    customerId: invoice.customer,
    amount: invoice.amount_paid
  })

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: event.type === 'invoice.paid' ? 'active' : 'past_due'
      })
      .eq('stripe_customer_id', invoice.customer as string)

    if (error) {
      console.error('❌ Failed to update subscription status:', error)
      throw error
    }

    console.log('✅ Successfully processed invoice event')
  } catch (error) {
    console.error('❌ Invoice handler error:', error)
    throw error
  }
} 