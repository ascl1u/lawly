'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/container'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DocumentActions } from '@/components/document-actions'

interface DocumentItem {
  id: string
  file_name: string
  uploaded_at: string
  status: 'pending' | 'parsing' | 'analyzed' | 'error'
}

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, file_name, uploaded_at, status')
          .order('uploaded_at', { ascending: false })

        if (error) throw error
        setDocuments(data?.map(doc => ({
          id: doc.id,
          file_name: doc.file_name,
          uploaded_at: doc.uploaded_at,
          status: doc.status
        })) || [])
      } catch (e) {
        console.error('Error fetching documents:', e)
        setError(e instanceof Error ? e.message : 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [user, supabase])

  const handleDelete = async (doc: DocumentItem) => {
    if (!user) return

    try {
      await Promise.all([
        // Delete from Supabase
        supabase.from('documents').delete().eq('id', doc.id),
        supabase.storage.from('documents').remove([`${user.id}/${doc.id}/${doc.file_name}`]),
        // Delete from Redis via API
        fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      ])

      setDocuments(documents.filter(d => d.id !== doc.id))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const analyzedDocuments = documents.filter(doc => doc.status === 'analyzed')
  const pendingDocuments = documents.filter(doc => doc.status !== 'analyzed')

  if (authLoading || loading) {
    return (
      <Container>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground mb-2">Loading...</div>
            <div className="text-muted-foreground">Please wait while we fetch your documents</div>
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-destructive mb-2">Error</div>
            <div className="text-destructive/80">{error}</div>
          </div>
        </div>
      </Container>
    )
  }

  const DocumentList = ({ docs }: { docs: DocumentItem[] }) => (
    <ul className="divide-y divide-primary/20">
      {docs.map((doc) => (
        <li key={doc.id} className="hover:bg-primary/10">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="flex-1 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-secondary truncate">
                  {doc.file_name}
                </p>
                <div className="flex items-center gap-4">
                  {doc.status !== 'analyzed' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                      {doc.status}
                    </span>
                  )}
                  <p className="text-sm text-primary-foreground/60">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
            <DocumentActions 
              onDelete={() => handleDelete(doc)} 
              status={doc.status}
              onAnalyze={async () => {
                try {
                  await fetch('/api/process-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documentId: doc.id })
                  })
                  router.push(`/documents/${doc.id}?processing=true`)
                } catch (error) {
                  console.error('Error starting analysis:', error)
                }
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    <Container>
      <Card className="bg-primary border-primary/20">
        <CardHeader className="border-b border-primary/20">
          <CardTitle className="text-primary-foreground">My Documents</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="border-t border-primary/20">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary-foreground/80">No documents yet</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Upload your first document
                </button>
              </div>
            ) : (
              <div className="divide-y divide-primary/20">
                {pendingDocuments.length > 0 && (
                  <div className="py-6">
                    <h3 className="text-lg font-semibold text-primary-foreground mb-4">
                      Pending Analysis
                    </h3>
                    <DocumentList docs={pendingDocuments} />
                  </div>
                )}
                
                {analyzedDocuments.length > 0 && (
                  <div className="py-6">
                    <h3 className="text-lg font-semibold text-primary-foreground mb-4">
                      Analyzed Documents
                    </h3>
                    <DocumentList docs={analyzedDocuments} />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Container>
  )
} 