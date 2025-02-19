'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
  onSelect: () => void
}

export function PricingCard({
  name,
  price,
  description,
  features,
  buttonText,
  popular,
  onSelect
}: PricingCardProps) {
  return (
    <Card className={`w-[300px] ${popular ? 'border-primary' : ''}`}>
      <CardHeader>
        {popular && (
          <div className="px-3 py-1 text-sm text-primary-foreground bg-primary rounded-full w-fit mb-2">
            Most Popular
          </div>
        )}
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-muted-foreground">/month</span>}
        </div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSelect} 
          className="w-full"
          variant={popular ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
} 