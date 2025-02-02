'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Card, CardHeader, CardSection } from '@/components/ui/Card'
import { DocumentDetails } from '@/types'
import { DocumentViewer } from '@/components/DocumentViewer'

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
        const { data: document, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        // Fetch analysis
        const { data: summary } = await supabase
          .from('summaries')
          .select('summary_text, simplified_text')
          .eq('document_id', id)
          .single()

        // Fetch risks
        const { data: risks } = await supabase
          .from('risk_analyses')
          .select('risk_severity, risk_description, suggested_action')
          .eq('document_id', id)

        setDocument({
          ...document,
          analysis: summary,
          risks: risks || []
        })
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
              {document.summary ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Summary</h4>
                    <p className="mt-1 text-sm text-gray-900">{document.summary.summary_text}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Simplified Version</h4>
                    <p className="mt-1 text-sm text-gray-900">{document.summary.simplified_text}</p>
                  </div>
                </div>
              ) : (
                <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
              )}
            </CardSection>

            <CardSection title="Risk Analysis">
              {document.risks ? (
                <div className="space-y-4">
                  {document.risks.map((risk, index) => (
                    <div key={index} className={`p-4 rounded-md border ${
                      risk.risk_severity === 'high' ? 'border-red-200 bg-red-50' :
                      risk.risk_severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <h4 className="font-medium">{risk.risk_description}</h4>
                      <p className="mt-1 text-sm text-gray-600">{risk.suggested_action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 bg-gray-100 rounded-md animate-pulse" />
              )}
            </CardSection>

            <CardSection title="Ask Questions">
              <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
            </CardSection>

            <CardSection title="Document Content">
              <DocumentViewer document={document} />
            </CardSection>
          </div>
        </div>
      </Card>
    </Container>
  )
} 