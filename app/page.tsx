'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { useVoice } from '@/hooks/useVoice'

const pad = (n: number) => String(n).padStart(2, '0')

function ArcReactor() {
  return (
    <div className="relative w-[100px] h-[100px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="8"/>
        <circle cx="50" cy="50" r="44" fill="none" stroke="#00d4ff" strokeWidth="1.5"
          strokeDasharray="220 56" transform="rotate(-90 50 50)"/>
        <g className="ring-slow">
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="5"/>
          <circle cx="50" cy="16" r="3" fill="#00d4ff" opacity={0.9}/>
          <circle cx="84" cy="50" r="3" fill="#00d4ff" opacity={0.5}/>
          <circle cx="50" cy="84" r="3" fill="#00d4ff" opacity={0.3}/>
        </g>
        <g className="ring-fast">
          <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="3"/>
          <circle cx="50" cy="28" r="2" fill="#00d4ff" opacity={0.9}/>
          <circle cx="72" cy="50" r="2" fill="#00d4ff" opacity={0.6}/>
        </g>
        <circle cx="50" cy="50" r="10" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1"/>
        <circle cx="50" cy="50" r="5"  fill="#00d4ff" opacity={0.9}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-orbitron text-[18px] font-bold glow">98%</span>
        <span className="text-[7px] tracking-[2px]" style={{color:'var(--text-muted)'}}>POWER</span>
      </div>
    </div>
  )
}

function ChatMessage({ role, content, time }: { role: string; content: string; time: string }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className="w-7 h-7 flex-shrink-0 border flex items-center justify-center text-[9px]"
           style={{ borderColor: 'var(--cyan-dim)', color: 'var(--text-muted)' }}>
        {isUser ? 'S' : 'J'}
      </div>
      <div className={`max-w-[85%] px-3 py-2 panel text-[11px] leading-relaxed`}
           style={{ background: isUser ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.04)' }}>
        <div className="text-[8px] tracking-[2px] mb-1" style={{ color: 'var(--text-muted)' }}>
          {isUser ? 'SIR' : 'JARVIS'} · {time}
        </div>
        <span style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{content}</span>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 flex-shrink-0 border flex items-center justify-center text-[9px]"
           style={{ borderColor: 'var(--cyan-dim)', color: 'var(--text-muted)' }}>J</div>
      <div className="panel px-3 py-3">
        <div className="flex gap-1">
          {[0, 200, 400].map(d => (
            <span key={d} className="w-[5px] h-[5px] rounded-full"
                  style={{ background: 'var(--cyan)', animation: `typing-dot 1.2s ease-in-out ${d}ms infinite` }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { messages, sendMessage, isLoading, streamingContent, clearChat, searchStatus, lastQuery } = useChat()
  const [input,      setInput]      = useState('')
  const [clock,      setClock]      = useState('')
  const [uptime,     setUptime]     = useState('00:00:00')
  const [lang,       setLang]       = useState<'en-US' | 'hi-IN'>('en-US')
  const chatRef  = useRef<HTMLDivElement>(null)
  const startRef = useRef(Date.now())

  const latestReply = messages.filter(m => m.role === 'assistant').at(-1)?.content ?? ''

  const handleTranscript = useCallback((text: string) => {
    setInput(text)
    sendMessage(text)
  }, [sendMessage])

  const { isListening, isSpeaking, isSupported, startListening, stopListening,
          speak, stopSpeaking, transcript, error: voiceError } = useVoice({
    onTranscript: handleTranscript,
    language: lang,
  })

  // Auto-speak JARVIS replies
  useEffect(() => {
  if (latestReply && !isLoading) speak(latestReply)
}, [latestReply, isLoading, speak])

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
      const e = Math.floor((Date.now() - startRef.current) / 1000)
      setUptime(`${pad(Math.floor(e/3600))}:${pad(Math.floor((e%3600)/60))}:${pad(e%60)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, streamingContent, isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  const now = new Date()
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return (
    <div className="hud-grid scanlines relative h-screen overflow-hidden"
         style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,58,92,0.3), transparent), var(--bg-deep)' }}>
      <div className="relative z-10 h-full grid gap-2 p-2"
           style={{ gridTemplate: '"top top top" 52px "left main right" 1fr "bot bot bot" 44px / 220px 1fr 200px' }}>

        {/* ── TOP BAR ── */}
        <header className="flex items-center justify-between border-b px-1"
                style={{ gridArea:'top', borderColor:'var(--border)' }}>
          <div>
            <h1 className="font-orbitron font-black text-lg tracking-[4px] glow">JARVIS</h1>
            <p className="text-[8px] tracking-[2px]" style={{ color:'var(--text-muted)' }}>
              JUST A RATHER VERY INTELLIGENT SYSTEM · V2.0
            </p>
          </div>
          <div className="flex items-center gap-5 text-[10px]">
            <span className="flex items-center gap-2">
              <span className="w-[6px] h-[6px] rounded-full"
                    style={{ background:'var(--cyan)', boxShadow:'0 0 8px var(--cyan)', animation:'pulse-dot 2s ease-in-out infinite' }}/>
              <span style={{ color:'var(--text-muted)' }}>ONLINE</span>
            </span>
            <span style={{ color:'var(--text-muted)' }}>
              UPTIME <span className="font-orbitron text-[9px]" style={{ color:'var(--cyan)' }}>{uptime}</span>
            </span>
            <span style={{ color:'var(--text-muted)' }}>
              MODEL <span style={{ color:'var(--cyan)' }}>LLAMA-3.3-70B</span>
            </span>
          </div>
        </header>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="flex flex-col gap-2" style={{ gridArea:'left' }}>
          <div className="panel p-3 flex-shrink-0">
            <p className="text-[8px] tracking-[3px] mb-3" style={{ color:'var(--text-muted)' }}>Arc Reactor</p>
            <ArcReactor />
            <div className="mt-4 space-y-2">
              {([['NEURAL', 23], ['MEMORY', 61], ['LATENCY', 14]] as const).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span style={{ color:'var(--text-muted)' }}>{k}</span>
                    <span style={{ color:'var(--cyan)' }}>{k === 'LATENCY' ? '142ms' : `${v}%`}</span>
                  </div>
                  <div className="hud-bar-track"><div className="hud-bar-fill" style={{ width:`${v}%` }}/></div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-3 flex-1">
            <p className="text-[8px] tracking-[3px] mb-2" style={{ color:'var(--text-muted)' }}>Active Tools</p>
            <div className="flex flex-wrap gap-1">
              {([['VOICE', isSupported], ['SEARCH', true], ['FILES', false], ['FACE-ID', false]] as const).map(([label, on]) => (
                <span key={label} className="text-[8px] tracking-[1px] px-2 py-1 border"
                      style={{
                        borderColor: on ? 'var(--cyan)' : 'var(--cyan-dim)',
                        color: on ? 'var(--cyan)' : 'var(--text-muted)',
                        background: on ? 'rgba(0,212,255,0.08)' : 'transparent'
                      }}>
                  {on ? '◉' : '○'} {label}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CHAT ── */}
        <main className="panel p-3 flex flex-col gap-2" style={{ gridArea:'main' }}>
          <p className="text-[8px] tracking-[3px] flex-shrink-0" style={{ color:'var(--text-muted)' }}>
            Primary Interface
          </p>

          <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            <ChatMessage
              role="jarvis"
              content="Good morning, Sir. All systems are nominal. I am running on Llama 3.3 70B via OpenRouter. How may I assist you today?"
              time={clock}
            />
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} time={clock}/>
            ))}
            {isLoading && streamingContent && (
              <ChatMessage role="jarvis" content={streamingContent + '▋'} time={clock}/>
            )}
            {isLoading && !streamingContent && <TypingIndicator/>}
          </div>

          {/* Search status indicator */}
          <AnimatePresence>
            {searchStatus === 'searching' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] tracking-[1px] px-2 py-1 border-l-2 flex items-center gap-2"
                style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}
              >
                <span style={{ animation: 'pulse-dot 1s ease-in-out infinite' }}>◉</span>
                SEARCHING · {lastQuery}
              </motion.div>
            )}
            {searchStatus === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[9px] tracking-[1px] px-2 py-1 border-l-2"
                style={{ borderColor: 'var(--cyan)', color: 'var(--text-muted)' }}
              >
                ✓ WEB RESULTS INJECTED
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice transcript preview */}
          <AnimatePresence>
            {(transcript || voiceError) && (
              <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                          className="text-[9px] tracking-[1px] px-2 py-1 border-l-2"
                          style={{ borderColor: voiceError ? '#ff4444' : 'var(--cyan)',
                                   color: voiceError ? '#ff6644' : 'var(--cyan)' }}>
                {voiceError || `"${transcript}"`}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div className="flex gap-2 flex-shrink-0">
            <input
              className="hud-input flex-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="SPEAK YOUR COMMAND, SIR..."
            />
            {/* Lang toggle */}
            <button onClick={() => setLang(l => l === 'en-US' ? 'hi-IN' : 'en-US')}
                    className="hud-btn text-[8px] tracking-[1px] px-2"
                    title="Toggle Hindi/English">
              {lang === 'en-US' ? 'EN' : 'HI'}
            </button>
            {/* Mic */}
            {isSupported && (
              <button onClick={isListening ? stopListening : startListening}
                      className={`hud-btn w-9 h-9 text-sm relative ${isListening ? 'active' : ''}`}
                      style={isListening ? { animation:'mic-pulse 1s ease-in-out infinite' } : {}}
                      title={isListening ? 'Stop listening' : 'Start voice'}>
                {isListening ? '⏹' : '🎤'}
              </button>
            )}
            {/* Stop speaking */}
            {isSpeaking && (
              <button onClick={stopSpeaking} className="hud-btn w-9 h-9 text-sm"
                      title="Stop JARVIS speaking" style={{ color:'var(--amber)', borderColor:'var(--amber)' }}>
                🔇
              </button>
            )}
            {/* Send */}
            <button onClick={handleSend} disabled={isLoading} className="hud-btn w-9 h-9 text-sm">
              ↑
            </button>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="flex flex-col gap-2" style={{ gridArea:'right' }}>
          <div className="panel p-3 flex-shrink-0">
            <p className="text-[8px] tracking-[3px] mb-2" style={{ color:'var(--text-muted)' }}>
              Memory Fragments
            </p>
            {[
              { t:'2H AGO',    d:'JARVIS 2.0 architecture' },
              { t:'YESTERDAY', d:'Nimbus Weather deployed'  },
              { t:'3D AGO',    d:'Tailwind v4 fix'          },
            ].map(m => (
              <div key={m.t} className="mem-chip">
                <span className="text-[8px] block tracking-[1px]" style={{ color:'var(--text-muted)' }}>{m.t}</span>
                <span className="text-[9px]" style={{ color:'var(--text-primary)' }}>{m.d}</span>
              </div>
            ))}
          </div>

          <div className="panel p-3 flex-1 overflow-hidden">
            <p className="text-[8px] tracking-[3px] mb-2" style={{ color:'var(--text-muted)' }}>System Log</p>
            <div className="text-[8px] leading-loose tracking-wide space-y-0.5" style={{ color:'var(--text-muted)' }}>
              <div>[BOOT] systems nominal</div>
              <div>[AUTH] user verified</div>
              <div style={{ color:'var(--cyan-glow)' }}>[API] openrouter ready</div>
              <div>[VOICE] {isSupported ? 'online' : 'unavailable'}</div>
              <div>[LANG] {lang}</div>
            </div>
          </div>
        </aside>

        {/* ── BOTTOM BAR ── */}
        <footer className="flex items-center justify-between border-t px-1"
                style={{ gridArea:'bot', borderColor:'var(--border)' }}>
          <div className="flex gap-5">
            {(['CLEAR', 'STOP'] as const).map((label) => (
  <button
    key={label}
    onClick={label === 'CLEAR' ? clearChat : stopSpeaking}
    className="text-[8px] tracking-[1.5px] transition-colors hover:opacity-80"
    style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }}
  >
    [ {label} ]
  </button>
))}
          </div>
          <span className="font-orbitron text-[10px] tracking-[2px]" style={{ color:'var(--text-muted)' }}>
            {clock}
          </span>
        </footer>

      </div>
    </div>
  )
}