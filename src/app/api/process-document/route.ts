import { processDocument } from '@/functions/process-document'
import { updateJobStatus, REDIS_KEYS } from '@/lib/redis/client'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config'
import { checkAnalysisUsage } from '@/lib/usage'

export const maxDuration = 60 // limit for hobby plan

export async function POST(request: Request) {
  const { documentId } = await request.json()
  console.log('📥 Process document request:', { documentId })
  const jobId = REDIS_KEYS.DOCUMENT_JOB(documentId)

  try {
    // Get user ID from document
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (!document?.user_id) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get user tier
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('tier')
      .eq('id', document.user_id)
      .single()

    const userTier = user?.tier || 'free'

    // Check usage limits
    const { allowed, limit } = await checkAnalysisUsage(
      document.user_id, 
      supabaseAdmin
    )

    if (!allowed) {
      const errorMessage = userTier === 'free'
        ? `Free tier analysis limit reached (${limit} documents per month)`
        : `Pro tier analysis limit reached (${limit} documents per month)`

      await supabaseAdmin
        .from('documents')
        .update({ 
          status: 'error',
          error_message: errorMessage,
        })
        .eq('id', documentId)

      await updateJobStatus(documentId, 'failed', errorMessage)

      return NextResponse.json(
        { error: errorMessage },
        { status: 402 }
      )
    }

    console.log('🏁 Starting document processing')
    await updateJobStatus(documentId, 'processing')

    await processDocument(documentId)

    await updateJobStatus(documentId, 'completed')

    console.log('✅ Document processing completed')
    return NextResponse.json({ 
      success: true,
      jobId,
      message: 'Document processed successfully'
    })
  } catch (error) {
    console.error('❌ Processing error:', error)
    await updateJobStatus(
      documentId, 
      'failed', 
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(
      { error: 'Processing failed', jobId },
      { status: 500 }
    )
  }
} 