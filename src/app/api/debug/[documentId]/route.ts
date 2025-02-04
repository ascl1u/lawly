import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: logs } = await supabase
    .from('process_logs')
    .select('*')
    .eq('document_id', params.documentId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ logs })
} 