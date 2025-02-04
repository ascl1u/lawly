import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'
import { analyzeDocument } from '@/lib/ai-service'
import { generateUUID } from '@/lib/utils'

export async function processDocument(documentId: string) {
  const logStep = async (step: string, details?: Record<string, unknown>) => {
    console.log(`[${new Date().toISOString()}] ${step}`, details)
    await supabaseAdmin
      .from('process_logs')
      .insert({
        document_id: documentId,
        step,
        details: JSON.stringify(details),
        created_at: new Date().toISOString()
      })
  }

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
    await logStep('process_started')
    await updateStatus('parsing')
    
    await logStep('fetching_document')
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!document?.file_url) {
      await logStep('document_not_found', { document })
      throw new Error('Document not found or missing file URL')
    }

    await logStep('downloading_file')
    const { data: fileData } = await supabaseAdmin.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)

    if (!fileData) {
      await logStep('file_download_failed')
      throw new Error('No file data received')
    }
    
    await logStep('extracting_text', { 
      fileSize: fileData.size,
      fileType: fileData.type 
    })
    const { text, sections } = await DocumentLoader.load(fileData)
    await logStep('text_extracted', { 
      textLength: text.length,
      sectionsCount: sections.length 
    })

    await logStep('starting_analysis')
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
    await logStep('analysis_complete', {
      hasSummary: !!analysis.summary,
      risksCount: analysis.risks.length
    })

    await logStep('saving_results')
    // Batch insert all analysis results
    await Promise.all([
      supabaseAdmin.from('summaries').insert({
        id: generateUUID(),
        document_id: documentId,
        summary_text: analysis.summary,
        simplified_text: analysis.simplifiedText,
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

    console.timeEnd('total-processing-time')
    await logStep('process_complete')
    return { success: true }
  } catch (error) {
    await logStep('process_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
} 