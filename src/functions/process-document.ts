import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'
import { analyzeDocument } from '@/lib/ai-service'

export async function processDocument(documentId: string) {
  console.log('=== PROCESS DOCUMENT START ===', { documentId })
  console.time('total-processing-time')
  
  const updateStatus = async (status: string, error?: string) => {
    console.log('Updating document status:', { status, error })
    const { error: statusError } = await supabaseAdmin
      .from('documents')
      .update({ 
        status,
        parsed_at: new Date().toISOString(),
        error_message: error
      })
      .eq('id', documentId)

    if (statusError) {
      console.error('Status update error:', statusError)
      throw new Error(`Failed to update status: ${statusError.message}`)
    }
  }

  try {
    await updateStatus('parsing')
    console.log('Starting document processing pipeline')
    console.time('document-fetch')

    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    console.timeEnd('document-fetch')
    console.log('Document fetch result:', { 
      hasDocument: !!document, 
      hasError: !!fetchError,
      fileUrl: document?.file_url 
    })

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`)
    }

    if (!document) {
      throw new Error('Document not found')
    }

    if (!document.file_url) {
      throw new Error('Document missing file URL')
    }

    console.time('file-download')
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)
    console.timeEnd('file-download')
    console.log('File download complete:', { 
      fileSize: fileData?.size,
      fileType: fileData?.type,
      hasError: !!downloadError 
    })

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    if (!fileData) {
      throw new Error('No file data received')
    }

    console.time('text-extraction')
    const { text, sections } = await DocumentLoader.load(fileData)
    console.timeEnd('text-extraction')
    console.log('Text extraction complete:', { 
      textLength: text.length,
      sectionsCount: sections.length 
    })

    console.time('ai-analysis')
    console.log('Starting AI analysis with text length:', text.length)
    const analysis = await analyzeDocument(text)
    console.timeEnd('ai-analysis')
    console.log('AI analysis complete:', {
      hasSummary: !!analysis?.summary,
      summaryLength: analysis?.summary?.length,
      risksCount: analysis?.risks?.length,
      simplifiedTextLength: analysis?.simplifiedText?.length
    })

    // Validate analysis result
    if (!analysis?.summary || !analysis?.simplifiedText || !Array.isArray(analysis?.risks)) {
      console.error('Invalid analysis structure:', analysis)
      throw new Error('Invalid analysis result structure')
    }

    // Validate each risk object
    analysis.risks.forEach((risk, index) => {
      if (!['low', 'medium', 'high'].includes(risk.severity) || 
          !risk.description || 
          !risk.recommendation) {
        console.error(`Invalid risk object at index ${index}:`, risk)
        throw new Error(`Invalid risk data at index ${index}`)
      }
    })

    console.log('Process Document - Analysis completed successfully:', {
      hasSummary: !!analysis.summary,
      risksCount: analysis.risks.length
    })

    const { error: summaryError } = await supabaseAdmin
      .from('summaries')
      .insert({
        id: crypto.randomUUID(),
        document_id: documentId,
        summary_text: analysis.summary,
        simplified_text: analysis.simplifiedText,
        created_at: new Date().toISOString()
      })

    if (summaryError) {
      console.error('Summary insert error:', summaryError)
      throw new Error(`Failed to insert summary: ${summaryError.message}`)
    }

    // Insert risks
    const { error: risksError } = await supabaseAdmin
      .from('risk_analyses')
      .insert(analysis.risks.map(risk => ({
        id: crypto.randomUUID(),
        document_id: documentId,
        risk_description: risk.description,
        risk_severity: risk.severity,
        suggested_action: risk.recommendation,
        created_at: new Date().toISOString()
      })))

    if (risksError) {
      console.error('Risks insert error:', risksError)
      throw new Error(`Failed to insert risks: ${risksError.message}`)
    }

    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        content: text,
        status: 'analyzed',
        parsed_at: new Date().toISOString()
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Document update error:', updateError)
      throw new Error(`Failed to update document: ${updateError.message}`)
    }

    const { error: sectionsError } = await supabaseAdmin
      .from('sections')
      .insert(sections.map((section, index) => ({
        id: crypto.randomUUID(),
        document_id: documentId,
        content: section.content,
        order_index: index,
        metadata: section.metadata,
        created_at: new Date().toISOString()
      })))

    if (sectionsError) {
      console.error('Sections insert error:', sectionsError)
      throw new Error(`Failed to insert sections: ${sectionsError.message}`)
    }

    console.timeEnd('total-processing-time')
    console.log('=== PROCESS DOCUMENT COMPLETE ===')
    return { success: true }
  } catch (error) {
    console.timeEnd('total-processing-time')
    console.error('=== PROCESS DOCUMENT FAILED ===', {
      error,
      type: typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    await updateStatus('error', error instanceof Error ? error.message : JSON.stringify(error) || 'Unknown error')
    throw error
  }
} 