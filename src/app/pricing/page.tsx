'use client'

import { Container } from '@/components/container'
import { PricingCard } from '@/components/pricing-card'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (priceId: string) => {
    if (!user) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-muted-foreground">Choose the plan that&apos;s right for you</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          <PricingCard
            name="Free"
            price="Free"
            description="Try our basic features"
            features={[
              '1 document per month',
              'Basic LLM model',
              'Standard support'
            ]}
            buttonText="Get Started"
            onSelect={() => {}}
          />
          
          <PricingCard
            name="Pro"
            price="$20"
            description="For regular users"
            features={[
              '30 documents per month',
              'SOTA LLM model',
              'Priority support',
              'Advanced features'
            ]}
            buttonText={loading ? 'Loading...' : 'Subscribe'}
            popular
            onSelect={() => handleSubscribe('price_pro_monthly')}
          />

          <PricingCard
            name="Pay-As-You-Go"
            price="$1"
            description="Perfect for occasional use"
            features={[
              'Pay per document',
              'SOTA LLM model',
              'Priority support',
              'No monthly commitment'
            ]}
            buttonText={loading ? 'Loading...' : 'Get Started'}
            onSelect={() => handleSubscribe('price_pay_as_you_go')}
          />
        </div>
      </div>
    </Container>
  )
} 