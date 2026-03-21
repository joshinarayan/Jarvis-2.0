import { useState, useCallback } from 'react'
import { processFile, SupportedFile } from '@/lib/fileUtils'

export function useFileUpload() {
  const [file,         setFile]         = useState<SupportedFile | null>(null)
  const [isAnalyzing,  setIsAnalyzing]  = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [streamResult, setStreamResult] = useState('')

  const attachFile = useCallback(async (raw: File) => {
    try {
      setError(null)
      const processed = await processFile(raw)
      setFile(processed)
    } catch (err) {
      setError(String(err))
    }
  }, [])

  const analyzeFile = useCallback(async (userMessage?: string): Promise<string> => {
    if (!file) return ''

    setIsAnalyzing(true)
    setStreamResult('')
    let full = ''

    try {
      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64:      file.base64,
          mimeType:    file.mimeType,
          userMessage: userMessage || '',
        }),
      })

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6).trim()
          if (data === '[DONE]' || data === '') continue
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content
            if (delta) {
              full += delta
              setStreamResult(full)
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsAnalyzing(false)
      setStreamResult('')
    }

    return full
  }, [file])

  const clearFile = useCallback(() => {
    setFile(null)
    setError(null)
    setStreamResult('')
  }, [])

  return {
    file,
    attachFile,
    analyzeFile,
    clearFile,
    isAnalyzing,
    streamResult,
    error,
  }
}
