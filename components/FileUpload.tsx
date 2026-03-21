'use client'

import { useRef, DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SupportedFile } from '@/lib/fileUtils'

interface FileUploadProps {
  onFile:    (file: File) => void
  attached:  SupportedFile | null
  onClear:   () => void
  analyzing: boolean
}

export default function FileUpload({
  onFile, attached, onClear, analyzing
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
  }

  return (
    <AnimatePresence mode="wait">
      {!attached ? (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border border-dashed cursor-pointer transition-all duration-200 px-3 py-2 flex items-center gap-2 flex-shrink-0"
          style={{ borderColor: 'var(--cyan-dim)', background: 'transparent' }}
        >
          <span style={{ color: 'var(--cyan)', fontSize: 14 }}>📎</span>
          <span className="text-[9px] tracking-[1px] whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}>
            FILE
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleChange}
          />
        </motion.div>

      ) : (
        <motion.div
          key="attached"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-3 py-2 border flex-shrink-0"
          style={{
            borderColor: analyzing ? 'var(--amber)' : 'var(--cyan)',
            background:  'rgba(0,212,255,0.06)',
            maxWidth:    '160px',
          }}
        >
          <span style={{ color: 'var(--cyan)', fontSize: 14, flexShrink: 0 }}>
            {attached.isImage ? '🖼' : '📄'}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-[9px]"
                 style={{ color: 'var(--cyan)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
              {attached.name}
            </div>
            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {attached.size}
            </div>
          </div>

          {analyzing ? (
            <span className="text-[8px]" style={{ color: 'var(--amber)', flexShrink: 0,
              animation: 'pulse-dot 1s ease-in-out infinite' }}>
              ...
            </span>
          ) : (
            <button
              onClick={onClear}
              className="hud-btn flex-shrink-0"
              style={{ width: 18, height: 18, minWidth: 18,
                       fontSize: 10, color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}