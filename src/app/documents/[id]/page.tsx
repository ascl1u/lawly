'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { DocumentDetails } from '@/types'
import { DocumentViewer } from '@/components/DocumentViewer'
import { RiskSidebar } from '@/components/RiskSidebar'
import { SidebarToggle } from '@/components/ui/SidebarToggle'
import { SummarySidebar } from '@/components/SummarySidebar'
import { ChatSidebar } from '@/components/ChatSidebar'

export default function DocumentPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'risks' | 'summary' | 'chat'>('risks')

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

        // Debug log 1
        console.log('Document data:', document)

        // Fetch summary, risks, and messages in parallel
        const [summaryResult, risksResult, messagesResult] = await Promise.all([
          supabase
            .from('summaries')
            .select('summary_text, simplified_text')
            .eq('document_id', id)
            .single(),
          supabase
            .from('risk_analyses')
            .select('risk_severity, risk_description, suggested_action')
            .eq('document_id', id),
          supabase
            .from('messages')
            .select('id, content, role, created_at')
            .eq('document_id', id)
            .order('created_at', { ascending: true })
        ])

        setDocument({
          ...document,
          summary: summaryResult.data,
          risks: risksResult.data || [],
          messages: messagesResult.data || []
        })

        // Debug log 4
        console.log('Final document state:', {
          ...document,
          summary: summaryResult.data,
          risks: risksResult.data || [],
          messages: messagesResult.data || []
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
              <SidebarToggle activeView={activeView} onToggle={setActiveView} />
            </div>
          </div>
        </div>

        {/* Main Content */}
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
      </div>
    </Container>
  )
} 