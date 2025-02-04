'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { DocumentDetails } from '@/types'
import { DocumentViewer } from '@/components/DocumentViewer'
import { RiskSidebar } from '@/components/RiskSidebar'
import { SidebarToggle } from '@/components/ui/SidebarToggle'
import { SummarySidebar } from '@/components/SummarySidebar'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ProgressBar } from '@/components/ProgressBar'

export default function DocumentPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'risks' | 'summary' | 'chat'>('risks')
  const [isDeleted, setIsDeleted] = useState(false)
  const router = useRouter()
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    const checkJobStatus = async () => {
      if (!jobId) return false
      console.log('🔄 Polling job status:', { jobId })
      const response = await fetch(`/api/jobs/${jobId}`)
      const job = await response.json()
      console.log('📊 Poll result:', job)
      
      if (job.status === 'failed') {
        console.error('❌ Job failed:', job.error)
        setError(job.error || 'Processing failed')
        return true
      }
      
      return job.status === 'completed'
    }

    const fetchDocument = async () => {
      if (!user || isDeleted) return true

      try {
        const { data: document, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setIsDeleted(true)
            return true
          }
          throw error
        }

        // Set jobId for any non-analyzed status
        if (document.status !== 'analyzed') {
          setJobId(`doc:${document.id}`)
          setDocument(document)
          return false
        }

        // Fetch analysis data if document is analyzed
        const [summaryResult, risksResult, messagesResult] = await Promise.all([
          supabase.from('summaries').select('*').eq('document_id', id).single(),
          supabase.from('risk_analyses').select('*').eq('document_id', id),
          supabase.from('messages').select('*').eq('document_id', id).order('created_at', { ascending: true })
        ])

        setDocument({
          ...document,
          summary: {
            summary_text: summaryResult.data?.summary_text || null,
            simplified_text: summaryResult.data?.simplified_text || null
          },
          risks: risksResult.data?.map(risk => ({
            risk_severity: risk.risk_severity,
            risk_description: risk.risk_description,
            suggested_action: risk.suggested_action
          })) || [],
          messages: messagesResult.data || []
        })

        return true
      } catch (e) {
        console.error('Error fetching document:', e)
        setError(e instanceof Error ? e.message : 'Failed to load document')
        return true
      } finally {
        setLoading(false)
      }
    }

    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        const completed = await checkJobStatus()
        if (completed) {
          clearInterval(pollingInterval)
          fetchDocument()
        }
      }, 2000)
    }

    fetchDocument().then(completed => {
      if (!completed) {
        startPolling()
      }
    })

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [id, user, supabase, isDeleted, jobId])

  if (isDeleted) {
    router.push('/documents')
    return null
  }

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
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">{document.file_name}</h1>
                <p className="text-sm text-gray-400">
                  {new Date(document.uploaded_at).toLocaleDateString()} - {document.status}
                </p>
              </div>
              {document.status === 'analyzed' && (
                <SidebarToggle activeView={activeView} onToggle={setActiveView} />
              )}
            </div>
            {document.status !== 'analyzed' && (
              <div className="mt-6">
                <ProgressBar status={document.status} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {document.status === 'analyzed' ? (
          <div className="flex-1 flex overflow-hidden bg-gray-900">
            {/* Document Panel (70%) */}
            <div className="w-[70%] overflow-auto p-6 bg-gray-900">
              <DocumentViewer document={document} />
            </div>

            {/* Sidebar (30%) */}
            <div className="w-[30%] border-l border-gray-700 bg-gray-900 overflow-auto">
              {activeView === 'risks' ? (
                <RiskSidebar document={document} />
              ) : activeView === 'summary' ? (
                <SummarySidebar document={document} />
              ) : (
                <ChatSidebar document={document} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <p>Please wait while we analyze your document...</p>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
} 