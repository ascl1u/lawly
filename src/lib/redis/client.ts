import { Redis } from '@upstash/redis'

// Validate Redis configuration
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis configuration missing')
}

// Create a Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Key prefixes for better organization
export const REDIS_KEYS = {
  // Stripe related keys
  USER_TO_CUSTOMER: (userId: string) => `stripe:user:${userId}`,
  CUSTOMER_DATA: (customerId: string) => `stripe:customer:${customerId}`,
  CUSTOMER_TO_USER: (customerId: string) => `stripe:customer_to_user:${customerId}`,
  
  // Document processing related keys
  DOCUMENT_JOB: (documentId: string) => `doc:${documentId}`,
}

// Type definition for cached subscription data
export type StripeSubscriptionCache = 
  | {
      subscriptionId: string | null;
      status: string;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      tier: 'free' | 'pro';
      analysisLimit: number;
      paymentMethod: {
        brand: string | null;
        last4: string | null;
      } | null;
    }
  | {
      status: "none";
      tier: 'free';
      analysisLimit: number;
    };

// Type definition for document job data
export interface DocumentJob {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  error?: string;
}

/**
 * Enqueues a document for processing
 */
export async function enqueueDocument(documentId: string): Promise<string> {
  const jobId = REDIS_KEYS.DOCUMENT_JOB(documentId);
  console.log('🟦 Enqueueing document:', { documentId, jobId });
  
  const job: DocumentJob = {
    documentId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  await redis.set(jobId, JSON.stringify(job));
  console.log('✅ Document queued successfully');
  return jobId;
}

/**
 * Gets the status of a document processing job
 */
export async function getJobStatus(jobId: string): Promise<DocumentJob | null> {
  console.log('🔍 Checking job status:', { jobId });
  const job = await redis.get(jobId);
  console.log('📊 Job status result:', job);
  return job ? typeof job === 'string' ? JSON.parse(job) : job : null;
}

/**
 * Updates the status of a document processing job
 */
export async function updateJobStatus(
  documentId: string, 
  status: DocumentJob['status'], 
  error?: string
): Promise<void> {
  const jobId = REDIS_KEYS.DOCUMENT_JOB(documentId);
  const existingJob = await getJobStatus(jobId);
  
  if (!existingJob) {
    console.error('❌ Job not found:', { documentId, jobId });
    return;
  }
  
  const updatedJob: DocumentJob = {
    ...existingJob,
    status,
    updatedAt: new Date().toISOString(),
    ...(error && { error })
  };
  
  await redis.set(jobId, JSON.stringify(updatedJob));
  console.log('✅ Job status updated:', { documentId, status });
} 