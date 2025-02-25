export const STRIPE_PRICE_IDS = {
  PRO: 'price_1QvoTKBaoZfv78Xz8ItkixvD',
  PAYG: 'price_1QvoYABaoZfv78Xz6ThNR5pv'
} as const

export type StripePriceId = typeof STRIPE_PRICE_IDS[keyof typeof STRIPE_PRICE_IDS]

export const PLAN_DETAILS = {
  PRO: {
    name: 'Pro',
    priceId: STRIPE_PRICE_IDS.PRO,
    price: 20,
    features: [
      'Unlimited document analysis',
      'Priority support',
      'Advanced analytics'
    ]
  },
  PAYG: {
    name: 'Pay as you go',
    priceId: STRIPE_PRICE_IDS.PAYG,
    price: 1,
    features: [
      'Pay per document',
      'Basic analytics',
      'Email support'
    ]
  }
} as const

export type PlanType = keyof typeof PLAN_DETAILS 