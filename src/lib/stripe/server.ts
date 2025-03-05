import Stripe from 'stripe'
import { STRIPE_PRICE_IDS } from '@/config/stripe'

// Re-export for convenience
export { STRIPE_PRICE_IDS }

// Create a build-time safe version of Stripe
function createStripeClient() {
  // Detect build time
  if (process.env.NODE_ENV === 'production' && !globalThis.Request) {
    console.log('🔧 Build-time detected, returning mock Stripe client')
    
    // Return a mock Stripe instance with the methods we use
    return {
      checkout: {
        sessions: {
          create: () => ({ url: 'https://mock-checkout-url.com' })
        }
      },
      webhooks: {
        constructEvent: () => ({ type: 'mock.event', id: 'mock_id' })
      },
      customers: {
        create: () => ({ id: 'mock_customer_id' })
      },
      subscriptions: {
        retrieve: () => ({ id: 'mock_subscription_id', status: 'active' })
      }
    } as unknown as Stripe
  }
  
  // Real Stripe instance for runtime
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not defined')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
  })
}

export const stripe = createStripeClient()