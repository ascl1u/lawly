'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_DETAILS, type PlanType, getPriceIdForPlan } from '@/config/stripe'

export default function PricingClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubscribe = async (plan: PlanType) => {
    // Reset error state
    setErrorMessage(null)
    
    const priceId = getPriceIdForPlan(plan)
    if (!priceId) {
      console.log('Skipping subscription for free tier')
      return
    }

    try {
      setLoading(plan)
      console.log(`Subscribing to ${plan} plan with price ID:`, priceId)
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create checkout session')
      }
      
      if (!data.url) {
        throw new Error('No checkout URL returned')
      }
      
      // Redirect to Stripe checkout
      router.push(data.url)
    } catch (error) {
      console.error('Checkout error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {errorMessage && (
        <div className="col-span-1 md:col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {errorMessage}</p>
          <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
        </div>
      )}
      
      {(Object.keys(PLAN_DETAILS) as PlanType[]).map((plan) => {
        const priceId = getPriceIdForPlan(plan)
        return (
          <div key={plan} className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold">{PLAN_DETAILS[plan].name}</h2>
            <p className="text-xl mt-2">${PLAN_DETAILS[plan].price}/month</p>
            <ul className="mt-4 space-y-2">
              {PLAN_DETAILS[plan].features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan || !priceId}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-blue-300"
            >
              {!priceId ? 'Current Plan' : 
               loading === plan ? 'Loading...' : 'Subscribe'}
            </button>
          </div>
        )
      })}
    </div>
  )
} 