import { getJobStatus } from '@/lib/redis/client'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  const { jobId } = params

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
