import { redis, REDIS_KEYS } from '@/lib/redis/client'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const jobId = REDIS_KEYS.DOCUMENT_JOB(id)
    await redis.del(jobId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete document from queue' },
      { status: 500 }
    )
  }
}