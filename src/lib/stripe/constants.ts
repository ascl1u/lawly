export const STRIPE_PRICE_IDS = {
  PRO: 'price_1QvoTKBaoZfv78Xz8ItkixvD',
  PAYG: 'price_1QvoYABaoZfv78Xz6ThNR5pv'
} as const

export type StripePriceId = typeof STRIPE_PRICE_IDS[keyof typeof STRIPE_PRICE_IDS]

export type PlanType = 'free' | 'pro'

export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['1 document analysis per month', 'Basic support', 'Standard processing']
  },
  pro: {
    name: 'Pro',
    priceId: 'price_1QvoTKBaoZfv78Xz8ItkixvD',
    price: 20,
    features: ['30 document analyses per month', 'Priority support', 'Fast processing']
  }
} as const satisfies Record<PlanType, { 
  name: string
  priceId?: string
  price: number
  features: readonly string[]
}>