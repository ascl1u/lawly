import { getJobStatus } from '@/lib/queue'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const status = await getJobStatus(params.jobId)
    
    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Job status check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    )
  }
}
