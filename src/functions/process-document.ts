import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'
import { analyzeDocument } from '@/lib/ai-service'

export async function processDocument(documentId: string) {
  console.log('=== PROCESS DOCUMENT START ===', { documentId })
  console.time('total-processing-time')
  
  const updateStatus = async (status: string, error?: string) => {
    console.log('Updating document status:', { status, error })
    await supabaseAdmin
      .from('documents')
      .update({ 
        status,
        parsed_at: new Date().toISOString(),
        error_message: error
      })
      .eq('id', documentId)
  }

  try {
    await updateStatus('parsing')
    
    // Fetch document in parallel with status update
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!document?.file_url) {
      throw new Error('Document not found or missing file URL')
    }

    // Download file first
    const { data: fileData } = await supabaseAdmin.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)

    if (!fileData) throw new Error('No file data received')

    // Extract text first
    const { text, sections } = await DocumentLoader.load(fileData)

    // Then run analysis and section saving in parallel
    const [analysis] = await Promise.all([
      analyzeDocument(text),
      supabaseAdmin.from('sections').insert(sections.map((section, index) => ({
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        document_id: documentId,
        summary_text: analysis.summary,
        simplified_text: analysis.simplifiedText,
        created_at: new Date().toISOString()
      }),
      supabaseAdmin.from('risk_analyses').insert(
        analysis.risks.map(risk => ({
          id: crypto.randomUUID(),
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

    console.timeEnd('total-processing-time')
    return { success: true }
  } catch (error) {
    console.error('=== PROCESS DOCUMENT FAILED ===', error)
    await updateStatus('error', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
} 