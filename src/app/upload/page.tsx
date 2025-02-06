'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type FileStatus = 'idle' | 'uploading' | 'uploaded' | 'error'

export default function UploadPage() {
  const { user, loading } = useAuth()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [fileStatus, setFileStatus] = useState<FileStatus>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSignOut = async () => {
    console.log('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      console.log('Signed out successfully')
      router.push('/')
    }
  }

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
      alert('Please upload a PDF, Word, or text file')
      return false
    }
    return true
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setFileStatus('uploading')
    setUploadError(null)

    try {
      const documentId = crypto.randomUUID()
      const filePath = `${user.id}/${documentId}/${selectedFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
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
          file_name: selectedFile.name,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">Please wait while we verify your session</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-gray-800 shadow sm:rounded-lg p-8">
        <div 
          className={`relative border-2 border-dashed rounded-lg p-12 text-center
            ${dragActive ? 'border-blue-400 bg-gray-700' : 'border-gray-600'}
            ${selectedFile ? 'border-green-400 bg-gray-700' : ''}
            ${fileStatus === 'error' ? 'border-red-400 bg-gray-700' : ''}
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
            <div className="text-green-400">
              <p className="text-lg font-semibold">{selectedFile.name}</p>
              <p className="text-sm">Ready to analyze</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-200">
                Drag and drop your document here, or
              </p>
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Browse files
              </label>
              <p className="text-sm text-gray-300 mt-2">
                Supported formats: PDF, Word, or plain text
              </p>
            </>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 text-red-600 text-center">
            {uploadError}
          </div>
        )}

        {selectedFile && (
          <div className="mt-6 flex justify-center space-x-4">
            {fileStatus !== 'uploaded' && (
              <button
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white
                  ${fileStatus === 'uploading' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                onClick={handleUpload}
                disabled={fileStatus === 'uploading'}
              >
                {fileStatus === 'uploading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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