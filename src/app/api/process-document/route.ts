import { processDocument } from '@/functions/process-document'
import { NextResponse } from 'next/server'

export const maxDuration = 300 // Set max duration to 5 minutes

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json()
    
    // Start processing but don't wait for completion
    processDocument(documentId).catch(error => {
      console.error('Background processing error:', error)
    })

    // Return immediately
    return NextResponse.json({ 
      success: true, 
      message: 'Document processing started' 
    })
  } catch (error) {
    console.error('API Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    )
  }
} 