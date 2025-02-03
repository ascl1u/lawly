import { DocumentDetails } from '@/types'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/useAuth'

interface ChatSidebarProps {
  document: DocumentDetails
}

export function ChatSidebar({ document }: ChatSidebarProps) {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !message.trim()) return

    setLoading(true)
    try {
      if (!document.content) throw new Error('Document content not available')
      
      // Insert user message
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          document_id: document.id,
          user_id: user.id,
          content: message.trim(),
          role: 'user'
        })

      if (userMessageError) throw userMessageError

      // Generate AI response
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: message.trim(),
          documentContent: document.content
        })
      }).then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error)
          return data.answer
        })

      // Insert AI response
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          document_id: document.id,
          user_id: user.id,
          content: aiResponse,
          role: 'assistant'
        })

      if (aiMessageError) throw aiMessageError

      // Refresh messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, role, created_at')
        .eq('document_id', document.id)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      document.messages = messages
    } catch (e) {
      console.error('Error sending message:', e)
    } finally {
      setMessage('')
      setLoading(false)
    }
  }

  return (
    <div className="h-full bg-gray-900">
      <Card className="h-full rounded-none border-l border-gray-700 bg-gray-900">
        <CardHeader 
          title="Document Chat" 
          subtitle="Ask questions about this document"
          className="text-gray-100 border-b border-gray-700"
        />
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="sticky top-0 bg-gray-900 pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {document.messages?.map((msg) => (
              <div 
                key={msg.id} 
                className={`rounded-md p-4 ${
                  msg.role === 'user' 
                    ? 'bg-blue-900/20 border border-blue-700' 
                    : 'bg-purple-900/20 border border-purple-700'
                }`}
              >
                <p className="text-sm text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 