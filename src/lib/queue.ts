import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis configuration missing')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function enqueueDocument(documentId: string) {
  const jobId = `doc:${documentId}`
  console.log('🟦 Enqueueing document:', { documentId, jobId })
  
  await redis.set(jobId, JSON.stringify({
    documentId,
    status: 'pending',
    createdAt: new Date().toISOString()
  }))
  console.log('✅ Document queued successfully')
  return jobId
}

export async function getJobStatus(jobId: string) {
  console.log('🔍 Checking job status:', { jobId })
  const job = await redis.get(jobId)
  console.log('📊 Job status result:', job)
  return job ? typeof job === 'string' ? JSON.parse(job) : job : null
} 