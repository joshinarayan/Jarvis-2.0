'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/// <reference types="@types/dom-speech-recognition" />

interface UseVoiceOptions {
  onTranscript: (text: string) => void
  language?: string
}

export function useVoice({ onTranscript, language = 'en-US' }: UseVoiceOptions) {
  const [isListening,  setIsListening]  = useState(false)
  const [isSpeaking,   setIsSpeaking]   = useState(false)
  const [isSupported,  setIsSupported]  = useState(false)
  const [transcript,   setTranscript]   = useState('')
  const [error,        setError]        = useState<string | null>(null)

  const recogRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Use Chrome for voice!'); return }

    setIsSupported(true)
    synthRef.current = window.speechSynthesis
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()

    const r = new SR()
    r.continuous      = false
    r.interimResults  = true
    r.lang            = language
    r.maxAlternatives = 1

    r.onstart  = () => { setIsListening(true); setError(null) }
    r.onend    = () => setIsListening(false)
    r.onerror  = (e) => {
      setIsListening(false)
      if (e.error === 'not-allowed') setError('Allow mic in browser settings!')
      else if (e.error === 'no-speech') setError('No speech detected')
      else setError(`Error: ${e.error}`)
    }
    r.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      setTranscript(final || interim)
      if (final.trim()) { onTranscript(final.trim()); setTranscript('') }
    }

    recogRef.current = r
    return () => { r.abort(); synthRef.current?.cancel() }
  }, [language, onTranscript])

  const startListening = useCallback(() => {
    if (!recogRef.current || isListening) return
    setError(null)
    recogRef.current.start()
  }, [isListening])

  const stopListening = useCallback(() => {
    recogRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return
    synthRef.current.cancel()

    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'code block')
      .replace(/#{1,6}\s/g, '')
      .trim()

    const utt = new SpeechSynthesisUtterance(clean)
    const voices = synthRef.current.getVoices()
    const pick = ['Google UK English Male', 'Microsoft George', 'Daniel']
    for (const name of pick) {
      const v = voices.find(v => v.name.includes(name))
      if (v) { utt.voice = v; break }
    }
    utt.rate   = 0.95
    utt.pitch  = 0.85
    utt.volume = 1.0
    utt.onstart = () => setIsSpeaking(true)
    utt.onend   = () => setIsSpeaking(false)
    utt.onerror = () => setIsSpeaking(false)
    synthRef.current.speak(utt)
  }, [])

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  return { isListening, isSpeaking, isSupported, startListening, stopListening, speak, stopSpeaking, transcript, error }
}