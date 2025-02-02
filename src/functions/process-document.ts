import { supabaseAdmin } from '@/lib/config'
import { DocumentLoader } from '@/lib/document-loader'

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