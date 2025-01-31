import { createClient } from '@supabase/supabase-js'
import { DocumentLoader } from '@/lib/document-loader'

export async function processDocument(documentId: string) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'parsing' })
      .eq('id', documentId)

    // Get document details
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!document || !document.file_url) {
      throw new Error('Document not found or missing file URL')
    }

    // Download file from storage
    const { data: fileData } = await supabase.storage
      .from('documents')
      .download(`${document.user_id}/${documentId}/${document.file_name}`)

    if (!fileData) {
      throw new Error('Failed to download file')
    }

    // Process document using our new loader
    const { text, sections } = await DocumentLoader.load(fileData)

    // Update document with parsed text
    await supabase
      .from('documents')
      .update({
        parsed_text: text,
        status: 'analyzed',
        parsed_at: new Date().toISOString()
      })
      .eq('id', documentId)

    // Store sections
    const sectionRecords = sections.map((section, index) => ({
      id: crypto.randomUUID(),
      document_id: documentId,
      content: section.content,
      order_index: index,
      metadata: section.metadata,
      created_at: new Date().toISOString()
    }))

    await supabase
      .from('document_sections')
      .insert(sectionRecords)

    return { success: true }
  } catch (error) {
    // Update status to error
    await supabase
      .from('documents')
      .update({ 
        status: 'error',
        parsed_at: new Date().toISOString()
      })
      .eq('id', documentId)

    throw error
  }
} 