Here’s the flow you’ll build:
Client Uploads Document
API Creates a Background Job
Worker Processes the Job Async
Client Polls/Receives Notification When Done

Job Queue
Purpose: Manage and distribute background jobs.
Redis-based Queue (Upstash Redis)

Worker Service
Purpose: Process jobs from the queue (parsing, AI analysis, etc.)
Serverless Workers (Vercel Serverless/Edge Functions)

Job Status Storage
Purpose: Track job progress/results
Supabase jobs table

Notifications
Purpose: Alert clients when processing is done.
Client polling