'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Card, CardHeader } from '@/components/ui/Card'
import { DocumentActions } from '@/components/ui/DocumentActions'
import { redis } from '@/lib/queue'

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
    const jobId = `doc:${doc.id}`

    try {
      await Promise.all([
        // Delete from Supabase
        supabase.from('documents').delete().eq('id', doc.id),
        supabase.storage.from('documents').remove([`${user.id}/${doc.id}/${doc.file_name}`]),
        // Delete from Redis
        redis.del(jobId)
      ])

      setDocuments(documents.filter(d => d.id !== doc.id))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
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

  return (
    <Container>
      <Card>
        <CardHeader 
          title="My Documents" 
          subtitle={`${documents.length} document${documents.length === 1 ? '' : 's'}`} 
        />
        <div className="border-t border-gray-700">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">No documents yet</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {documents.map((doc) => (
                <li key={doc.id} className="hover:bg-gray-700">
                  <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                    <button
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-400 truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-gray-300">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                    <DocumentActions onDelete={() => handleDelete(doc)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </Container>
  )
} 