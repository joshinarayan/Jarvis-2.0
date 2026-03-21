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

      const data = await res.json()
      const result = data.content || 'No response from vision model.'
      setStreamResult(result)
      return result

    } catch (err) {
      const msg = `Error analyzing file: ${String(err)}`
      setError(msg)
      return msg
    } finally {
      setIsAnalyzing(false)
      setStreamResult('')
    }
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
