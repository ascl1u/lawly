import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true
})

export type SubscriptionTier = 'free' | 'pro' | 'pay_as_you_go'

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO!,
  pay_as_you_go: process.env.STRIPE_PRICE_ID_PAYG!
} as const 