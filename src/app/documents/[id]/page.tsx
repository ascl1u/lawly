'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Card, CardHeader, CardSection } from '@/components/ui/Card'

interface DocumentDetails {
  id: string
  file_name: string
  file_type: string
  file_url: string | null
  parsed_text: string | null
  uploaded_at: string
  status: 'pending' | 'parsing' | 'analyzed' | 'error'
  parsed_at: string | null
}

export default function DocumentPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setDocument(data)
      } catch (e) {
        console.error('Error fetching document:', e)
        setError(e instanceof Error ? e.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id, user, supabase])

  if (authLoading || loading) {
    return (
      <Container>
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-600">
          <div className="text-2xl font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </Container>
    )
  }

  if (!document) return null

  return (
    <Container>
      <Card>
        <CardHeader 
          title={document.file_name}
          subtitle={`${new Date(document.uploaded_at).toLocaleDateString()} - ${document.status}`}
        />

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-8">
            <CardSection title="Document Summary">
              <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
            </CardSection>

            <CardSection title="Risk Analysis">
              <div className="h-32 bg-gray-100 rounded-md animate-pulse" />
            </CardSection>

            <CardSection title="Ask Questions">
              <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
            </CardSection>
          </div>
        </div>
      </Card>
    </Container>
  )
} 