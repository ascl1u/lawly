'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Container } from '@/components/container'
import { Button } from "@/components/ui/button"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleUploadClick = () => {
    console.log('Upload clicked, user state:', { user, loading })
    if (user) {
      console.log('User is logged in, redirecting to upload')
      router.push('/upload')
    } else {
      console.log('User is not logged in, redirecting to login')
      router.push('/auth/login')
    }
  }

  const handleMyDocumentsClick = () => {
    if (user) {
      router.push('/documents')
    } else {
      router.push('/auth/login?redirect=/documents')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary">
        <Container>
          <div className="flex flex-col items-center text-center py-8 lg:py-12">
            <div className="flex flex-col items-center gap-2 mb-6">
              <h1 className="text-5xl font-bold text-primary-foreground sm:text-6xl md:text-7xl">
                Lawly
              </h1>
              <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm text-secondary">
                <span>Powered by Advanced AI</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tighter text-primary-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              Decode Legal Jargon in Seconds
            </h2>

            <p className="mt-6 max-w-3xl text-lg text-primary-foreground/80 md:text-xl">
              Upload contracts, agreements, or terms of service. Get instant summaries, risk alerts, and plain-language
              explanations powered by AI.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {loading ? (
                <div className="text-primary-foreground">Loading...</div>
              ) : (
                <>
                  <Button 
                    onClick={handleUploadClick} 
                    size="lg" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8"
                  >
                    Upload Document
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleMyDocumentsClick}
                    variant="outline"
                    size="lg"
                    className="border-secondary bg-background text-secondary-foreground hover:bg-secondary/10 text-lg px-8"
                  >
                    My Documents
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>
      <Features />
      <Testimonials />
      <FAQ />
    </div>
  )
}
