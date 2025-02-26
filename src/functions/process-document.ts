import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'
import { analyzeDocument } from '@/lib/ai-service'
import { generateUUID } from '@/lib/utils'
import { redis } from '@/lib/queue'
import { incrementAnalysisUsage, checkAnalysisUsage } from '@/lib/usage'

export async function processDocument(documentId: string) {
  console.log('=== PROCESS DOCUMENT START ===', { documentId })
  console.time('total-processing-time')
  const jobId = `doc:${documentId}`

  const updateStatus = async (status: string, error?: string) => {
    console.log('Updating status:', { status, error })
    
    // Update both Redis and Supabase
    await Promise.all([
      redis.set(jobId, JSON.stringify({
        documentId,
        status,
        error,
        updatedAt: new Date().toISOString()
      })),
      supabaseAdmin
        .from('documents')
        .update({ 
          status,
          parsed_at: new Date().toISOString(),
          error_message: error
        })
        .eq('id', documentId)
    ])
  }

  try {
    // Add usage check before processing
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!document?.user_id || document.status !== 'pending') {
      console.error('Invalid processing request:', { document })
      await updateStatus('error', 'Invalid document or user')
      return { success: false }
    }

    // Check usage limits before processing
    const { allowed, remaining } = await checkAnalysisUsage(
      document.user_id,
      supabaseAdmin
    )

    if (!allowed) {
      await updateStatus('error', 'Analysis limit exceeded')
      return { success: false, remaining }
    }

    await updateStatus('parsing')
    const { data: fileData } = await supabaseAdmin.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)

    if (!fileData) {
      throw new Error('No file data received')
    }
    
    const { text, sections } = await DocumentLoader.load(fileData)

    const [analysis] = await Promise.all([
      analyzeDocument(text),
      supabaseAdmin.from('sections').insert(sections.map((section, index) => ({
        id: generateUUID(),
        document_id: documentId,
        content: section.content,
        order_index: index,
        metadata: section.metadata,
        created_at: new Date().toISOString()
      })))
    ])
    // Batch insert all analysis results
    await Promise.all([
      supabaseAdmin.from('summaries').insert({
        id: generateUUID(),
        document_id: documentId,
        summary_text: analysis.summary,
        created_at: new Date().toISOString()
      }),
      supabaseAdmin.from('risk_analyses').insert(
        analysis.risks.map(risk => ({
          id: generateUUID(),
          document_id: documentId,
          risk_description: risk.description,
          risk_severity: risk.severity,
          suggested_action: risk.recommendation,
          created_at: new Date().toISOString()
        }))
      ),
      supabaseAdmin.from('documents').update({
        content: text,
        status: 'analyzed',
        parsed_at: new Date().toISOString()
      }).eq('id', documentId)
    ])

    // Track successful analysis
    if (document.user_id) {
      const { success, remaining: updatedRemaining } = await incrementAnalysisUsage(
        document.user_id,
        supabaseAdmin
      )
      
      if (!success) {
        console.error('Usage tracking failed for user:', document.user_id)
      } else {
        console.log('Analysis usage updated. Remaining:', updatedRemaining)
      }
    }

    console.timeEnd('total-processing-time')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await updateStatus('error', errorMessage)
    throw error
  }
} 