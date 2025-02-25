'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_DETAILS, type PlanType } from '@/lib/stripe/constants'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)

  const handleSubscribe = async (plan: PlanType) => {
    try {
      setLoading(plan)
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: PLAN_DETAILS[plan].priceId
        })
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      
      router.push(url)
    } catch (error) {
      console.error('Checkout error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {(Object.keys(PLAN_DETAILS) as PlanType[]).map((plan) => (
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
            disabled={loading === plan}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md"
          >
            {loading === plan ? 'Loading...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  )
} 