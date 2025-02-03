import { generateChatResponse } from '@/lib/ai-service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { question, documentContent } = await request.json()
    const response = await generateChatResponse(question, documentContent)
    return NextResponse.json({ answer: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
} 