import { getJobStatus } from '@/lib/queue'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const status = await getJobStatus(params.jobId)
    return NextResponse.json(status)
  } catch {
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
} 