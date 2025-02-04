import { processDocument } from '@/functions/process-document'
import { redis } from '@/lib/queue'
import { NextResponse } from 'next/server'

export const maxDuration = 60 // limit for hobby plan

export async function POST(request: Request) {
  const { documentId } = await request.json()
  console.log('📥 Process document request:', { documentId })
  const jobId = `doc:${documentId}`

  try {
    console.log('🏁 Starting document processing')
    await redis.set(jobId, JSON.stringify({
      documentId,
      status: 'processing',
      updatedAt: new Date().toISOString()
    }))

    await processDocument(documentId)

    await redis.set(jobId, JSON.stringify({
      documentId,
      status: 'completed',
      updatedAt: new Date().toISOString()
    }))

    console.log('✅ Document processing completed')
    return NextResponse.json({ 
      success: true,
      jobId,
      message: 'Document processed successfully'
    })
  } catch (error) {
    console.error('❌ Processing error:', error)
    await redis.set(jobId, JSON.stringify({
      documentId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date().toISOString()
    }))

    return NextResponse.json(
      { error: 'Processing failed', jobId },
      { status: 500 }
    )
  }
} 