/**
 * Migration script to move existing document jobs to the new Redis client format
 * 
 * Run this script with:
 * npx tsx src/scripts/migrate-queue-to-redis.ts
 */

import { redis, REDIS_KEYS, DocumentJob } from '../lib/redis/client'

async function migrateQueueToRedis() {
  console.log('🚀 Starting document queue migration')
  
  try {
    // Get all keys that start with 'doc:'
    const keys = await redis.keys('doc:*')
    
    console.log(`Found ${keys.length} document jobs to migrate`)
    
    // Process each job
    for (const key of keys) {
      try {
        // Get the old job data
        const oldJob = await redis.get(key)
        
        if (!oldJob) {
          console.log(`⚠️ No data found for key ${key}, skipping`)
          continue
        }
        
        // Parse the job data
        const jobData = typeof oldJob === 'string' ? JSON.parse(oldJob) : oldJob
        
        // Extract the document ID from the key
        const documentId = key.replace('doc:', '')
        
        // Create the new job data
        const newJob: DocumentJob = {
          documentId,
          status: jobData.status === 'error' ? 'failed' : 
                 jobData.status === 'completed' ? 'completed' : 
                 jobData.status === 'processing' ? 'processing' : 'pending',
          createdAt: jobData.createdAt || new Date().toISOString(),
          updatedAt: jobData.updatedAt || new Date().toISOString(),
          ...(jobData.error && { error: jobData.error })
        }
        
        // Store the job data in the new format
        const newKey = REDIS_KEYS.DOCUMENT_JOB(documentId)
        
        // Skip if the key is the same (already migrated)
        if (key === newKey) {
          console.log(`⏭️ Key ${key} already in new format, skipping`)
          continue
        }
        
        // Store the new job data
        await redis.set(newKey, JSON.stringify(newJob))
        
        // Delete the old key if it's different
        if (key !== newKey) {
          await redis.del(key)
        }
        
        console.log(`✅ Successfully migrated job for document ${documentId}`)
      } catch (jobError) {
        console.error(`❌ Error migrating job ${key}:`, jobError)
      }
    }
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
migrateQueueToRedis().catch(console.error) 