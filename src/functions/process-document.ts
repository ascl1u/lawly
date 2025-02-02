import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'
import { analyzeDocument } from '@/lib/ai-service'

export async function processDocument(documentId: string) {
  const updateStatus = async (status: string, error?: string) => {
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
    console.log('Processing document:', documentId)

    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    console.log('Fetch response:', { document, fetchError })

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`)
    }

    if (!document) {
      throw new Error('Document not found')
    }

    if (!document.file_url) {
      throw new Error('Document missing file URL')
    }

    console.log('Attempting to download file:', `${document.user_id}/${documentId}/${document.file_name}`)
    
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    if (!fileData) {
      throw new Error('No file data received')
    }

    console.log('File downloaded successfully, processing with DocumentLoader')
    console.log('File type:', fileData.type)
    console.log('File size:', fileData.size)
    
    const { text, sections } = await DocumentLoader.load(fileData)
    console.log('Document processed successfully:', { textLength: text.length, sectionsCount: sections.length })

    // Add analysis step
    console.log('Process Document - Starting analysis with text length:', text.length)
    console.log('Process Document - Calling analyzeDocument')
    const analysis = await analyzeDocument(text)
    
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

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : JSON.stringify(error) || 'Unknown error occurred'
    
    console.error('Document processing error:', {
      error,
      type: typeof error,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })
    
    await updateStatus('error', errorMessage)
    throw error
  }
} 