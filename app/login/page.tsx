'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { saveCredentials, loadCredentials } from '@/lib/tauriStorage'

// Simple SHA256 using browser's built-in crypto
async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function Login() {
  const router  = useRouter()
  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [isSetup,     setIsSetup]     = useState(false)
  const [confirm,     setConfirm]     = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [checking,    setChecking]    = useState(false)

  useEffect(() => {
    const init = async () => {
      // Check if already logged in this session
      const session = sessionStorage.getItem('jarvis-session')
      if (session === 'active') { router.push('/'); return }

      // Check if credentials exist
      const creds = await loadCredentials()
      if (!creds.username) setIsSetup(true) // first time setup
      setLoading(false)
    }
    init()
  }, [router])

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('All fields required, Sir.')
      return
    }
    setChecking(true)
    setError('')

    const hash = await sha256(password)

    if (isSetup) {
      // First time — create credentials
      if (password !== confirm) {
        setError('Passwords do not match.')
        setChecking(false)
        return
      }
      await saveCredentials(username, hash)
      sessionStorage.setItem('jarvis-session', 'active')
      router.push('/')
    } else {
      // Login — verify credentials
      const creds = await loadCredentials()
      if (username === creds.username && hash === creds.hash) {
        sessionStorage.setItem('jarvis-session', 'active')
        router.push('/')
      } else {
        setError('Access denied. Invalid credentials.')
        setChecking(false)
      }
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center"
         style={{ background: 'var(--bg-deep)' }}>
      <span className="font-orbitron text-[var(--cyan)] tracking-[4px]">
        INITIALIZING...
      </span>
    </div>
  )

  return (
    <div className="hud-grid scanlines h-screen flex items-center justify-center"
         style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,58,92,0.3), transparent), var(--bg-deep)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel p-8 w-[360px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-orbitron font-black text-2xl tracking-[6px] glow mb-1">
            JARVIS
          </h1>
          <p className="text-[8px] tracking-[3px]" style={{ color: 'var(--text-muted)' }}>
            {isSetup ? 'INITIAL SETUP — CREATE ACCESS CREDENTIALS' : 'IDENTITY VERIFICATION REQUIRED'}
          </p>
        </div>

        {/* Arc reactor small */}
        <div className="flex justify-center mb-8">
          <div className="relative w-[60px] h-[60px]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="#00d4ff" strokeWidth="1.5"
                strokeDasharray="220 56" transform="rotate(-90 50 50)"/>
              <g className="ring-slow">
                <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="5"/>
                <circle cx="50" cy="16" r="3" fill="#00d4ff" opacity={0.9}/>
              </g>
              <circle cx="50" cy="50" r="10" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1"/>
              <circle cx="50" cy="50" r="5" fill="#00d4ff" opacity={0.9}/>
            </svg>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <p className="text-[8px] tracking-[2px] mb-1" style={{ color: 'var(--text-muted)' }}>
              IDENTITY
            </p>
            <input
              className="hud-input w-full"
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="off"
            />
          </div>

          <div>
            <p className="text-[8px] tracking-[2px] mb-1" style={{ color: 'var(--text-muted)' }}>
              AUTHORIZATION CODE
            </p>
            <input
              className="hud-input w-full"
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {isSetup && (
            <div>
              <p className="text-[8px] tracking-[2px] mb-1" style={{ color: 'var(--text-muted)' }}>
                CONFIRM CODE
              </p>
              <input
                className="hud-input w-full"
                type="password"
                placeholder="CONFIRM PASSWORD"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] tracking-[1px]"
              style={{ color: '#ff4444' }}
            >
              ⚠ {error}
            </motion.p>
          )}

          <button
            onClick={handleSubmit}
            disabled={checking}
            className="hud-btn w-full py-3 text-[10px] tracking-[3px] mt-4"
            style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}
          >
            {checking ? 'VERIFYING...' : isSetup ? 'INITIALIZE JARVIS' : 'GRANT ACCESS'}
          </button>
        </div>

        <p className="text-center text-[7px] tracking-[1px] mt-6"
           style={{ color: 'var(--text-muted)' }}>
          STARK INDUSTRIES · PRIVATE SYSTEM · UNAUTHORIZED ACCESS PROHIBITED
        </p>
      </motion.div>
    </div>
  )
}