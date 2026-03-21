import { useState, useCallback } from 'react'
import { Message } from '@/lib/openrouter'
import { webSearch, formatSearchContext } from '@/lib/searchTool'

// Keywords that trigger a web search
const SEARCH_TRIGGERS = [
  'search', 'google', 'look up', 'find', 'what is',
  'who is', 'latest', 'news', 'today', 'current',
  'price', 'weather', 'when did', 'how much',
  'trending', 'recent', 'right now', '2024', '2025',
]

function shouldSearch(text: string): boolean {
  const lower = text.toLowerCase()
  return SEARCH_TRIGGERS.some(t => lower.includes(t))
}

function extractQuery(text: string): string {
  // Strip filler words to make a cleaner search query
  return text
    .replace(/^(hey jarvis|jarvis|sir|please|can you|could you)/gi, '')
    .replace(/(search for|search|google|look up|find me|tell me about)/gi, '')
    .trim()
}

export type SearchStatus = 'idle' | 'searching' | 'done'

export function useChat() {
  const [messages,         setMessages]         = useState<Message[]>([])
  const [isLoading,        setIsLoading]        = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [searchStatus,     setSearchStatus]     = useState<SearchStatus>('idle')
  const [lastQuery,        setLastQuery]        = useState('')

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content }
    let history = [...messages, userMsg]
    setMessages(history)
    setIsLoading(true)
    setStreamingContent('')
    setSearchStatus('idle')

    try {
      // ── Auto web search if needed ──────────────────────
      if (shouldSearch(content)) {
        setSearchStatus('searching')
        const query = extractQuery(content)
        setLastQuery(query)

        try {
          const searchData = await webSearch(query)
          const context    = formatSearchContext(searchData)

          // Inject search results as a system message before user's message
          history = [
            ...messages,
            { role: 'system', content: context } as Message,
            userMsg,
          ]
        } catch {
          // Search failed silently — JARVIS still answers from training data
          console.warn('Search failed, continuing without results')
        }

        setSearchStatus('done')
      }

      // ── Stream JARVIS response ─────────────────────────
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('API error:', err)
        setStreamingContent(`JARVIS OFFLINE: ${err.error || res.status}`)
        setIsLoading(false)
        return
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep last incomplete line in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          
          const data = trimmed.slice(6).trim()
          if (data === '[DONE]') continue
          if (data === '') continue

          try {
            const parsed = JSON.parse(data)
            
            // Handle error from OpenRouter
            if (parsed.error) {
              console.error('OpenRouter error:', parsed.error)
              full += `\nError: ${parsed.error.message || 'Unknown error'}`
              setStreamingContent(full)
              continue
            }

            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              full += delta
              setStreamingContent(full)
            }
          } catch (e) {
            // skip malformed chunks
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
        try {
          const data = buffer.trim().startsWith('data: ')
            ? buffer.trim().slice(6)
            : buffer.trim()
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            full += delta
            setStreamingContent(full)
          }
        } catch {}
      }

      // Save only user + assistant messages (not the injected search context)
      // Only save if we actually got a response
      if (full.trim()) {
        setMessages(prev => [...prev, { role: 'assistant', content: full }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sir, I encountered an issue processing that request. Please try again.' 
        }])
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
      setStreamingContent('')
      setSearchStatus('idle')
    }
  }, [messages])

  const clearChat = () => {
    setMessages([])
    setSearchStatus('idle')
    setLastQuery('')
  }

  return {
    messages,
    sendMessage,
    isLoading,
    streamingContent,
    clearChat,
    searchStatus,
    lastQuery,
  }
}