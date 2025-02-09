'use client'

import { Container } from '@/components/ui/Container'

export default function TermsOfService() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert">
          <h2>Last Updated: {new Date().toLocaleDateString()}</h2>
          
          <section className="mt-8">
            <h3>1. Acceptance of Terms</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </section>

          <section className="mt-8">
            <h3>2. Use License</h3>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </section>

          <section className="mt-8">
            <h3>3. Disclaimer</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </section>
        </div>
      </div>
    </Container>
  )
} 