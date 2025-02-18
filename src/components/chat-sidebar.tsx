import { DocumentDetails } from '@/types'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatSidebarProps {
  document: DocumentDetails
}

export function ChatSidebar({ document }: ChatSidebarProps) {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(document.messages || [])

  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !document.id) return

      const { data, error } = await supabase
        .from('messages')
        .select('id, content, role, created_at')
        .eq('document_id', document.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data)
      document.messages = data
    }

    loadMessages()
  }, [user, document, supabase])

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
      const { data: newMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, role, created_at')
        .eq('document_id', document.id)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(newMessages)
      document.messages = newMessages
    } catch (e) {
      console.error('Error sending message:', e)
    } finally {
      setMessage('')
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Document Chat</CardTitle>
          <CardDescription>Ask questions about this document</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${
                  msg.role === 'user' 
                    ? 'justify-end' 
                    : 'w-full'
                }`}
              >
                <div className={`${
                  msg.role === 'user'
                    ? 'bg-primary/10 rounded-lg p-3 max-w-[80%]'
                    : 'text-sm text-gray-200 pr-4'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t mt-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  size="default"
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 