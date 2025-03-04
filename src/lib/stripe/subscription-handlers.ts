import type { Stripe } from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { stripe } from './server'

export async function handleSubscriptionChange(
  event: Stripe.Event,
  supabase: SupabaseClient
) {
  console.log('🎯 Processing subscription event:', {
    type: event.type,
    id: event.id
  })

  try {
    const data = event.data.object
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = data as Stripe.Checkout.Session
        await handleCheckoutCompletion(session, supabase)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = data as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const tier = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'free'
        
        console.log('🔄 Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          priceId,
          tier
        })
        
        // Get the user ID from metadata or database
        let userId = subscription.metadata?.userId || subscription.metadata?.user_id
        
        if (!userId) {
          // If no userId in metadata, find it in our database
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
            
          if (subError || !subData) {
            console.error('❌ Failed to find subscription in database:', subError)
            throw subError || new Error('Subscription not found')
          }
          
          userId = subData.user_id
        }
        
        try {
          // Use a transaction to update both subscription and user records atomically
          const { data, error } = await supabase.rpc('handle_subscription_update', {
            p_user_id: userId,
            p_subscription_id: subscription.id,
            p_status: subscription.status,
            p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            p_cancel_at_period_end: subscription.cancel_at_period_end,
            p_price_id: priceId,
            p_tier: tier,
            p_analysis_limit: tier === 'pro' ? 30 : 1
          });
          
          if (error) {
            console.error('❌ Failed to update subscription and user:', error);
            throw error;
          }
          
          console.log('✅ Subscription and user updated successfully:', data);
        } catch (error) {
          console.error('❌ Error in subscription update transaction:', error);
          
          // Fallback to separate updates if transaction fails
          console.log('⚠️ Falling back to separate updates');
          
          // Update subscription record
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              price_id: priceId
            })
            .eq('stripe_subscription_id', subscription.id)
          
          if (updateError) {
            console.error('❌ Failed to update subscription:', updateError)
            throw updateError
          }
          
          // If subscription is canceled at period end, we don't change the tier yet
          // The user keeps pro benefits until the end of the period
          if (subscription.cancel_at_period_end) {
            console.log('ℹ️ Subscription set to cancel at period end:', {
              userId,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
            })
            
            // No immediate changes to user tier or analysis limit
          } 
          // If subscription status changed (not just cancel_at_period_end flag)
          else if (['active', 'trialing'].includes(subscription.status)) {
            // Update user tier for active subscriptions
            const analysisLimit = tier === 'pro' ? 30 : 1
            
            const { error: userError } = await supabase
              .from('users')
              .update({ 
                tier,
                analysis_limit: analysisLimit
              })
              .eq('id', userId)
            
            if (userError) {
              console.error('❌ Failed to update user tier:', userError)
              throw userError
            }
            
            console.log('✅ User tier and analysis limit updated:', {
              userId,
              tier,
              analysisLimit
            })
          }
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = data as Stripe.Subscription
        
        console.log('🔄 Subscription deleted:', {
          subscriptionId: subscription.id,
          status: subscription.status
        })
        
        // Get the user ID from metadata or database
        let userId = subscription.metadata?.userId || subscription.metadata?.user_id
        
        if (!userId) {
          // If no userId in metadata, find it in our database
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
            
          if (subError || !subData) {
            console.error('❌ Failed to find subscription in database:', subError)
            throw subError || new Error('Subscription not found')
          }
          
          userId = subData.user_id
        }
        
        try {
          // Use a transaction to update both subscription and user records atomically
          const { data, error } = await supabase.rpc('handle_subscription_deletion', {
            p_user_id: userId,
            p_subscription_id: subscription.id,
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          });
          
          if (error) {
            console.error('❌ Failed to process subscription deletion:', error);
            throw error;
          }
          
          console.log('✅ Subscription deletion processed successfully:', data);
        } catch (error) {
          console.error('❌ Error in subscription deletion transaction:', error);
          
          // Fallback to separate updates if transaction fails
          console.log('⚠️ Falling back to separate updates');
          
          // Update subscription record
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              cancel_at_period_end: false,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
          
          if (updateError) {
            console.error('❌ Failed to update subscription:', updateError)
            throw updateError
          }
          
          // Always downgrade to free tier when subscription is fully deleted
          const { error: userError } = await supabase
            .from('users')
            .update({ 
              tier: 'free',
              analysis_limit: 1 // Free tier limit
            })
            .eq('id', userId)
          
          if (userError) {
            console.error('❌ Failed to update user tier:', userError)
            throw userError
          }
          
          console.log('✅ User downgraded to free tier:', {
            userId,
            analysisLimit: 1
          })
        }
        
        break
      }
    }
  } catch (error) {
    console.error('❌ Subscription handler error:', {
      eventType: event.type,
      error
    })
    throw error
  }
}

async function handleCheckoutCompletion(session: Stripe.Checkout.Session, supabase: SupabaseClient) {
  // Extract userId safely from metadata
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  const priceId = session.metadata?.priceId;
  
  console.log('🔄 Processing checkout completion:', {
    sessionId: session.id,
    userId,
    tier,
    priceId,
    allMetadata: session.metadata
  });

  // Validate required metadata
  if (!userId) {
    console.error('❌ Missing userId in session metadata');
    throw new Error('Missing userId in session metadata');
  }

  if (!tier) {
    console.error('❌ Missing tier in session metadata');
    throw new Error('Missing tier in session metadata');
  }

  if (!priceId) {
    console.error('❌ Missing priceId in session metadata');
    throw new Error('Missing priceId in session metadata');
  }

  try {
    // Get the customer ID from the session
    const customerId = session.customer as string;
    
    // Get the subscription ID from the session
    const subscriptionId = session.subscription as string;
    
    if (!subscriptionId) {
      console.error('❌ Missing subscription ID in session');
      throw new Error('Missing subscription ID in session');
    }
    
    // Fetch the actual subscription from Stripe to get accurate period end
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Calculate proper period end from the actual subscription
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
    
    console.log('📅 Subscription periods:', {
      currentPeriodStart,
      currentPeriodEnd
    });
    
    // Set analysis limit based on tier
    const analysisLimit = tier === 'pro' ? 30 : 1;
    
    // Begin a Supabase transaction to ensure atomic updates
    const { data, error } = await supabase.rpc('handle_checkout_completion', {
      p_user_id: userId,
      p_customer_id: customerId,
      p_subscription_id: subscriptionId,
      p_session_id: session.id,
      p_price_id: priceId,
      p_tier: tier,
      p_analysis_limit: analysisLimit,
      p_current_period_start: currentPeriodStart,
      p_current_period_end: currentPeriodEnd
    });
    
    if (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
    
    console.log('✅ Transaction completed successfully:', data);

    // Verify the update with a fresh query
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select(`
        tier, 
        analysis_limit,
        subscriptions:subscriptions(
          status,
          price_id,
          current_period_end,
          stripe_checkout_session_id
        )
      `)
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Failed to verify updates:', verifyError);
    } else {
      const subscription = verifyData.subscriptions?.[0] || {};
      console.log('✅ Verified updates:', {
        tier: verifyData.tier,
        analysisLimit: verifyData.analysis_limit,
        subscriptionStatus: subscription.status,
        priceId: subscription.price_id,
        currentPeriodEnd: subscription.current_period_end,
        sessionId: subscription.stripe_checkout_session_id
      });
    }
  } catch (error) {
    console.error('❌ Checkout completion error:', error);
    throw error;
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
    // Get the subscription ID from the invoice
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) {
      console.log('⚠️ No subscription ID found in invoice')
      return
    }
    
    // First, get the subscription to find the user ID
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id, price_id, cancel_at_period_end')
      .eq('stripe_subscription_id', subscriptionId)
      .single()
      
    if (subscriptionError || !subscriptionData) {
      console.error('❌ Failed to find subscription:', subscriptionError)
      return
    }
    
    const userId = subscriptionData.user_id
    
    if (!userId) {
      console.error('❌ No user ID found for subscription:', subscriptionId)
      return
    }
    
    // Get the current user data to determine tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single()
      
    if (userError) {
      console.error('❌ Failed to get user data:', userError)
      return
    }
    
    // If invoice is paid and subscription is not canceling
    if (event.type === 'invoice.paid' && !subscriptionData.cancel_at_period_end) {
      // Set analysis limit based on tier
      const tier = userData.tier
      const analysisLimit = tier === 'pro' ? 30 : 1
      
      // Update the user's analysis limit
      const { error: updateError } = await supabase
        .from('users')
        .update({ analysis_limit: analysisLimit })
        .eq('id', userId)
        
      if (updateError) {
        console.error('❌ Failed to update analysis limit:', updateError)
      } else {
        console.log('✅ Updated analysis limit for user:', {
          userId,
          tier,
          analysisLimit
        })
      }
    } else if (event.type === 'invoice.payment_failed') {
      // Handle payment failure - could add notification logic here
      console.log('⚠️ Payment failed for subscription:', {
        subscriptionId,
        userId
      })
    }
    
    console.log('✅ Successfully processed invoice event')
  } catch (error) {
    console.error('❌ Invoice event error:', error)
    throw error
  }
} 