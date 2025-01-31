'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Container } from '@/components/ui/Container'

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
    <Container>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Lawly
        </h1>
        <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Understand Legal Documents with AI
        </h2>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Upload your legal documents and get instant insights, summaries, and risk analysis powered by AI.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 space-x-4">
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Document
              </button>
              <button
                onClick={handleMyDocumentsClick}
                className="inline-flex items-center px-6 py-3 border border-blue-400 text-base font-medium rounded-md text-blue-400 bg-transparent hover:bg-gray-800"
              >
                My Documents
              </button>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
