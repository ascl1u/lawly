import { processDocument } from '@/functions/process-document'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json()
    const result = await processDocument(documentId)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('API Processing error:', {
      error,
      type: typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process document',
        details: error
      },
      { status: 500 }
    )
  }
} 