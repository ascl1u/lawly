import { getJobStatus } from '@/lib/queue'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  const { jobId } = await params

  try {
    const status = await getJobStatus(jobId)
    return NextResponse.json(status)
  } catch {
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
