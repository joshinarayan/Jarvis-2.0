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

      // Save only user + assistant messages (not the injected search context)
      setMessages(prev => [...prev, { role: 'assistant', content: full }])
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