'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/container'
import { DocumentDetails } from '@/types'
import { DocumentViewer } from '@/components/document-viewer'
import { RiskSidebar } from '@/components/risk-sidebar'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { SummarySidebar } from '@/components/summary-sidebar'
import { ChatSidebar } from '@/components/chat-sidebar'
import { Progress } from '@/components/progress-bar'
import { ResizableLayout } from '@/components/resizable-layout'
import { DocumentOutline } from '@/components/document-outline'
// import { Button } from '@/components/ui/button'

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
  const [isProcessing, setIsProcessing] = useState(false)
  // const [showOutline, setShowOutline] = useState(true)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    const checkJobStatus = async () => {
      if (!jobId) return false
      console.log('🔄 Polling job status:', { jobId })
      const response = await fetch(`/api/jobs/${jobId}`)
      const job = await response.json()
      console.log('📊 Poll result:', job)
      
      if (!job) return false
      
      if (job.status === 'failed') {
        console.error('❌ Job failed:', job.error)
        setError(job.error || 'Processing failed')
        return true
      }
      
      return job.status === 'completed'
    }

    const fetchDocument = async () => {
      console.log('DocumentPage: Fetching document with state:', {
        userId: user?.id,
        isDeleted,
        documentId: id
      });

      if (!user || isDeleted) return true;

      try {
        const { data: document, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        console.log('DocumentPage: Fetch result:', {
          hasError: !!error,
          documentData: document,
          errorCode: error?.code
        });

        if (error) {
          if (error.code === 'PGRST116') {
            setIsDeleted(true)
            return true
          }
          throw error
        }

        console.log('Fetched document:', document)

        // Only set jobId if document is being processed
        if (document.status !== 'analyzed' && document.status !== 'pending') {
          setJobId(`doc:${document.id}`)
          setIsProcessing(true)
        }

        if (document.status === 'analyzed') {
          // Fetch analysis data if document is analyzed
          const [summaryResult, risksResult] = await Promise.all([
            supabase.from('summaries').select('*').eq('document_id', id).single(),
            supabase.from('risk_analyses').select('*').eq('document_id', id)
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
            })) || []
          })
        } else {
          setDocument(document)
        }

        setLoading(false)
        return document.status === 'analyzed'
      } catch (e) {
        console.error('Error fetching document:', e)
        setError(e instanceof Error ? e.message : 'Failed to load document')
        setLoading(false)
        return true
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

  console.log('Document data:', document);

  return (
    <Container className="h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col">
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
                <Progress status={document.status} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {document.status === 'analyzed' ? (
          <div className="flex-1 overflow-hidden">
            <ResizableLayout
              mainContent={
                <div className="flex h-full">
                  <div className="w-64 border-r border-gray-700">
                    <DocumentOutline document={document} />
                  </div>
                  <div className="flex-1">
                    <DocumentViewer document={document} />
                  </div>
                </div>
              }
              sidebarContent={
                activeView === 'risks' ? (
                  <RiskSidebar document={document} />
                ) : activeView === 'summary' ? (
                  <SummarySidebar document={document} />
                ) : (
                  <ChatSidebar document={document} />
                )
              }
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <p className="mb-4">
                {isProcessing ? 'Please wait while we analyze your document...' : 'Document uploaded. Click analyze to begin processing.'}
              </p>
              {!isProcessing && document.status === 'pending' && (
                <button
                  onClick={async () => {
                    setIsProcessing(true)
                    try {
                      const response = await fetch('/api/process-document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ documentId: id })
                      })
                      
                      if (!response.ok) {
                        throw new Error('Failed to start analysis')
                      }
                      
                      // Wait for the status to be updated before setting jobId
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      setJobId(`doc:${id}`)
                    } catch (error) {
                      console.error('Error starting analysis:', error)
                      setError('Failed to start analysis')
                      setIsProcessing(false)
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Analyze Document
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
} 