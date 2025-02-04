import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: logs, error } = await supabase
      .from('process_logs')
      .select('*')
      .eq('document_id', params.documentId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch logs' }, 
      { status: 500 }
    )
  }
} 