import { useState, useCallback } from 'react'
import { Message } from '@/lib/openrouter'

export function useChat() {
  const [messages,         setMessages]         = useState<Message[]>([])
  const [isLoading,        setIsLoading]        = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content }
    const history = [...messages, userMsg]
    setMessages(history)
    setIsLoading(true)
    setStreamingContent('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.replace('data: ', '').trim()
          if (data === '[DONE]') continue
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || ''
            full += delta
            setStreamingContent(full)
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }])
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [messages])

  const clearChat = () => setMessages([])

  return { messages, sendMessage, isLoading, streamingContent, clearChat }
}