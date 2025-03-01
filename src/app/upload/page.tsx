'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type FileStatus = 'idle' | 'uploading' | 'uploaded' | 'error'

export default function UploadPage() {
  const { user, loading: authLoading, supabase } = useAuth()
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [fileStatus, setFileStatus] = useState<FileStatus>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const validateFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    console.log('File type:', file.type)
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, Word, or text file')
      return false
    }
    setUploadError(null)
    return true
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setFileStatus('uploading')
    setUploadError(null)

    try {
      const documentId = crypto.randomUUID()
      
      // Create a safe filename by encoding non-ASCII characters
      const originalFileName = selectedFile.name
      
      // Create a new File object with an ASCII-only name
      const timestamp = Date.now()
      const fileExtension = originalFileName.split('.').pop() || ''
      const safeFileName = `file_${timestamp}.${fileExtension}`
      
      // Create a new File object with the safe name
      const safeFile = new File([selectedFile], safeFileName, {
        type: selectedFile.type,
      })
      
      const filePath = `${user.id}/${documentId}/${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, safeFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          id: documentId,
          user_id: user.id,
          file_name: originalFileName, // Store the original filename in the database
          encoded_file_name: safeFileName, // Store the safe filename for storage operations
          file_type: selectedFile.type,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error(dbError.message)
      }

      setDocumentId(documentId)
      setFileStatus('uploaded')
    } catch (error) {
      console.error('Upload error:', error)
      setFileStatus('error')
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.')
    }
  }

  const handleAnalyze = async () => {
    if (!documentId) return
    setIsAnalyzing(true)
    
    try {
      await fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      })

      router.push(`/documents/${documentId}?processing=true`)
    } catch (error) {
      console.error('Error starting analysis:', error)
      setUploadError('Failed to start analysis')
      setIsAnalyzing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground mb-2">Loading...</div>
          <div className="text-muted-foreground">Please wait while we verify your session</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Upload Document</h1>
      </div>
      
      <div className="bg-primary shadow-lg sm:rounded-lg p-8">
        <div 
          className={`relative border-2 border-dashed rounded-lg p-12 text-center
            ${dragActive ? 'border-secondary bg-secondary/10' : 'border-secondary/50'}
            ${selectedFile ? 'border-accent bg-accent/10' : ''}
            ${fileStatus === 'error' ? 'border-destructive bg-destructive/10' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt"
          />
          
          {selectedFile ? (
            <div className="text-accent">
              <p className="text-lg font-semibold">{selectedFile.name}</p>
              <p className="text-sm">Ready to analyze</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-primary-foreground">
                Drag and drop your document here, or
              </p>
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 mt-2 border border-transparent text-base font-medium rounded-md shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer"
              >
                Browse files
              </label>
              <p className="text-sm text-primary-foreground/80 mt-2">
                Supported formats: PDF, Word, or plain text
              </p>
            </>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 text-destructive text-center">
            {uploadError}
          </div>
        )}

        {selectedFile && (
          <div className="mt-6 flex justify-center space-x-4">
            {fileStatus !== 'uploaded' && (
              <button
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                  ${fileStatus === 'uploading' 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                  }`}
                onClick={handleUpload}
                disabled={fileStatus === 'uploading'}
              >
                {fileStatus === 'uploading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload Document'}
              </button>
            )}

            {fileStatus === 'uploaded' && (
              <button
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-accent-foreground bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing Document...' : 'Analyze Document'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}