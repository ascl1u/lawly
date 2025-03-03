import { processDocument } from '@/functions/process-document'
import { redis } from '@/lib/queue'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config'
import { checkAnalysisUsage } from '@/lib/usage'

export const maxDuration = 60 // limit for hobby plan

export async function POST(request: Request) {
  const { documentId } = await request.json()
  console.log('📥 Process document request:', { documentId })
  const jobId = `doc:${documentId}`

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

      await redis.set(jobId, JSON.stringify({
        documentId,
        status: 'error',
        error: errorMessage,
        updatedAt: new Date().toISOString()
      }))

      return NextResponse.json(
        { error: errorMessage },
        { status: 402 }
      )
    }

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