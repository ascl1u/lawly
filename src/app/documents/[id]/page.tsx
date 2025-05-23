'use client'

import { useAuth } from '@/hooks/useAuth'
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
// import { DocumentOutline } from '@/components/document-outline'
import { Switch } from "@/components/ui/switch"
// import { Button } from '@/components/ui/button'
import { LimitReachedMessage } from '@/components/limit-reached-message'
import { SubscriptionTier } from '@/types/supabase'

export default function DocumentPage() {
  const { id } = useParams()
  const { user, loading: authLoading, supabase } = useAuth()
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'risks' | 'summary' | 'chat'>('risks')
  const [isDeleted, setIsDeleted] = useState(false)
  const router = useRouter()
  const [jobId, setJobId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDocument, setShowDocument] = useState(true)
  const [userTier, setUserTier] = useState<SubscriptionTier>('free')
  const [analysisLimit, setAnalysisLimit] = useState(0)
  const [resetCycle, setResetCycle] = useState<string | null>(null)
  const [isLimitReached, setIsLimitReached] = useState(false)
  // const [showOutline, setShowOutline] = useState(true)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    const checkJobStatus = async () => {
      if (!jobId) return false
      console.log('🔄 Polling job status:', { jobId })
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          setError('Failed to check job status')
          return true
        }
        
        const job = await response.json()
        console.log('📊 Poll result:', job)
        
        if (job.status === 'error') {
          const errorMessage = job.error || 'Analysis limit reached'
          setError(errorMessage)
          
          // Check if the error is related to limits
          if (errorMessage.includes('limit')) {
            setIsLimitReached(true)
          }
          
          setJobId(null)
          setIsProcessing(false)
          return true
        }
        
        return job.status === 'completed'
      } catch (error) {
        console.error('Polling error:', error)
        return false
      }
    }

    const fetchDocument = async () => {
      console.log('DocumentPage: Fetching document with state:', {
        userId: user?.id,
        isDeleted,
        documentId: id
      });

      if (!user || isDeleted) return true;

      try {
        // Fetch user data to get tier and limits
        const { data: userData } = await supabase
          .from('users')
          .select('tier, analysis_limit, reset_cycle')
          .eq('id', user.id)
          .single();
          
        if (userData) {
          setUserTier(userData.tier)
          setAnalysisLimit(userData.analysis_limit)
          setResetCycle(userData.reset_cycle)
        }

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

        // Check if document has an error related to limits
        if (document.status === 'error' && document.error_message) {
          setError(document.error_message)
          
          if (document.error_message.includes('limit')) {
            setIsLimitReached(true)
          }
        }

        // Only start polling if document is in pending or parsing state
        if (document.status === 'pending' || document.status === 'parsing') {
          setJobId(`doc:${id}`)
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
      if (!completed && (document?.status === 'pending' || document?.status === 'parsing')) {
        startPolling()
      }
    })

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [id, user, supabase, isDeleted, document?.status, jobId])

  if (isDeleted) {
    router.push('/documents')
    return null
  }

  if (authLoading || loading) {
    return (
      <Container className="h-[calc(100vh-4rem)]">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground mb-2">Loading...</div>
            <div className="text-muted-foreground">Please wait while we load your document</div>
          </div>
        </div>
      </Container>
    )
  }

  if (isLimitReached) {
    return (
      <Container className="h-[calc(100vh-4rem)]">
        <div className="h-full flex items-center justify-center">
          <LimitReachedMessage 
            tier={userTier} 
            limit={analysisLimit}
            resetCycle={resetCycle || undefined}
          />
        </div>
      </Container>
    )
  }

  if (error || isDeleted) {
    return (
      <Container className="h-[calc(100vh-4rem)]">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-destructive mb-2">
              {isDeleted ? 'Document Deleted' : 'Error'}
            </div>
            <div className="text-destructive/80">
              {isDeleted 
                ? 'This document has been deleted or does not exist.'
                : error
              }
            </div>
            <button
              onClick={() => router.push('/documents')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Return to Documents
            </button>
          </div>
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
        <div className="bg-primary/95 border-b border-primary/20">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {document.file_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-primary-foreground/60">
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                    {document.status}
                  </span>
                </div>
              </div>
              {document.status === 'analyzed' ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={showDocument}
                      onCheckedChange={setShowDocument}
                      id="show-document"
                    />
                    <label 
                      htmlFor="show-document" 
                      className="text-sm text-primary-foreground/80"
                    >
                      Show Document
                    </label>
                  </div>
                  <div className="bg-secondary/10 rounded-full p-1">
                    <SidebarToggle activeView={activeView} onToggle={setActiveView} />
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <Progress status={document.status} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {document.status === 'analyzed' ? (
          <div className="flex-1 overflow-hidden bg-primary/5">
            {showDocument ? (
              <ResizableLayout
                mainContent={
                  <div className="h-full overflow-hidden">
                    <DocumentViewer document={document} />
                  </div>
                }
                sidebarContent={
                  <div className="h-full overflow-y-auto border-l border-primary/20">
                    <div className="p-4">
                      {activeView === 'risks' ? (
                        <RiskSidebar document={document} />
                      ) : activeView === 'summary' ? (
                        <SummarySidebar document={document} />
                      ) : (
                        <ChatSidebar document={document} />
                      )}
                    </div>
                  </div>
                }
              />
            ) : (
              <div className="h-full p-4">
                {activeView === 'risks' ? (
                  <RiskSidebar document={document} />
                ) : activeView === 'summary' ? (
                  <SummarySidebar document={document} />
                ) : (
                  <ChatSidebar document={document} />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-primary">
            <div className="text-center">
              <p className="mb-4 text-primary-foreground/80">
                {isProcessing 
                  ? 'Please wait while we analyze your document...' 
                  : 'Document uploaded. Click analyze to begin processing.'
                }
              </p>
              {!isProcessing && document.status === 'pending' && (
                <button
                  onClick={async () => {
                    setIsProcessing(true)
                    try {
                      const response = await fetch('/api/process-document', {
                        method: 'POST',
                        body: JSON.stringify({ documentId: id })
                      })

                      if (response.status === 402) {
                        setError('Analysis limit reached - please upgrade your plan')
                        setIsProcessing(false)
                        return
                      }
                      
                      if (!response.ok) throw new Error('Failed to start analysis')
                      
                      setJobId(`doc:${id}`)
                    } catch (error) {
                      console.error('Error starting analysis:', error)
                      setError(error instanceof Error ? error.message : 'Failed to start analysis')
                      setIsProcessing(false)
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-foreground bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Starting Analysis...' : 'Analyze Document'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
} 