import { redis } from '@/lib/queue'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params  // Await the params promise here
    const jobId = `doc:${id}`
    await redis.del(jobId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete document from queue' },
      { status: 500 }
    )
  }
}