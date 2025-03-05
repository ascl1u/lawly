/**
 * Stripe Configuration
 * 
 * This file provides a centralized configuration for all Stripe-related settings.
 * It handles both server-side and client-side environments and provides fallbacks
 * for development environments.
 */

// Price IDs for different subscription tiers
export const STRIPE_PRICE_IDS = {
  // Use the environment variable with a fallback for development
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_placeholder',
} as const;

// Type for price IDs
export type StripePriceId = typeof STRIPE_PRICE_IDS[keyof typeof STRIPE_PRICE_IDS];

// Plan types
export type PlanType = 'free' | 'pro';

/**
 * Helper function to determine if we're using test or production Stripe credentials
 */
export function isTestStripeEnvironment(): boolean {
  const priceId = STRIPE_PRICE_IDS.PRO;
  // Check if the price ID matches the test price ID pattern
  return priceId.includes('price_1QvoTKBaoZfv78Xz8ItkixvD');
}

/**
 * Plan details including features and pricing
 */
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
}>;

/**
 * Helper function to get the price ID for a specific plan
 */
export function getPriceIdForPlan(plan: PlanType): string | undefined {
  // Handle the case where priceId might not exist on the free plan
  return plan === 'pro' ? PLAN_DETAILS.pro.priceId : undefined;
}

/**
 * Helper function to get the plan type from a price ID
 */
export function getPlanFromPriceId(priceId: string): PlanType {
  return priceId === STRIPE_PRICE_IDS.PRO ? 'pro' : 'free';
} 