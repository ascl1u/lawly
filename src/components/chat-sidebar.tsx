import { DocumentDetails } from '@/types'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

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
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setMessage('')
      setLoading(false)
    }
  }

  return (
    <Card className="h-full bg-primary border-primary/20">
      <CardHeader className="border-b border-primary/20">
        <CardTitle className="text-primary-foreground">Document Chat</CardTitle>
        <p className="text-sm text-primary-foreground/60">Ask questions about this document</p>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(100vh-16rem)]">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  msg.role === 'user' 
                    ? "bg-secondary text-primary"
                    : "bg-white text-primary"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-primary/20">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              className="bg-white text-primary"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !message.trim()}
              variant="secondary"
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
} 