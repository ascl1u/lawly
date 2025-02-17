'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Container } from '@/components/ui/container'
import { Button } from "@/components/ui/button"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { ArrowRight, PlayCircle } from "lucide-react"

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
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Container className="bg-gray-900">
        <div className="flex flex-col items-center text-center py-8 lg:py-12">
          <div className="flex flex-col items-center gap-2 mb-6">
            <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl">Lawly</h1>
            <div className="inline-flex items-center rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-sm text-blue-400">
              <span>Powered by Advanced AI</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tighter text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Decode Legal Jargon in Seconds
          </h2>

          <p className="mt-6 max-w-3xl text-lg text-gray-400 md:text-xl">
            Upload contracts, agreements, or terms of service. Get instant summaries, risk alerts, and plain-language
            explanations powered by AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : (
              <>
                <Button onClick={handleUploadClick} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Upload Document
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={handleMyDocumentsClick}
                  variant="outline"
                  size="lg"
                  className="border-blue-400 text-blue-400 hover:bg-gray-800 text-lg px-8"
                >
                  My Documents
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          <div className="mt-12 relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Watch Demo Video</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Features />
      <Testimonials />
      <FAQ />
    </div>
  )
}
