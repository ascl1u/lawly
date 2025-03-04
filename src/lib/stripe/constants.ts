export const STRIPE_PRICE_IDS = {
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_placeholder',
} as const

export type StripePriceId = typeof STRIPE_PRICE_IDS[keyof typeof STRIPE_PRICE_IDS]

export type PlanType = 'free' | 'pro'

/**
 * Helper function to determine if we're using test or production Stripe credentials
 * This can be used to conditionally show test-specific UI or logging
 */
export function isTestStripeEnvironment(): boolean {
  const priceId = STRIPE_PRICE_IDS.PRO;
  // Check if the price ID matches the test price ID pattern
  return priceId.includes('price_1QvoTKBaoZfv78Xz8ItkixvD');
}

export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['1 document analysis per month', 'Basic support', 'Standard processing']
  },
  pro: {
    name: 'Pro',
    priceId: STRIPE_PRICE_IDS.PRO,
    price: 20,
    features: ['30 document analyses per month', 'Priority support', 'Fast processing']
  }
} as const satisfies Record<PlanType, { 
  name: string
  priceId?: string
  price: number
  features: readonly string[]
}>