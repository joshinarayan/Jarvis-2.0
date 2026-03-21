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
          className="border border-dashed cursor-pointer transition-all duration-200 px-3 py-2 flex items-center gap-2"
          style={{
            borderColor: 'var(--cyan-dim)',
            background:  'transparent',
          }}
          whileHover={{ borderColor: 'var(--cyan)', background: 'rgba(0,212,255,0.04)' }}
        >
          <span style={{ color: 'var(--cyan)', fontSize: 14 }}>📎</span>
          <span className="text-[9px] tracking-[1px]" style={{ color: 'var(--text-muted)' }}>
            DROP FILE · JPG PNG PDF
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
          className="flex items-center gap-2 px-3 py-2 border"
          style={{
            borderColor: analyzing ? 'var(--amber)' : 'var(--cyan)',
            background:  'rgba(0,212,255,0.06)',
          }}
        >
          {/* Preview thumbnail for images */}
          {attached.isImage && (
            <img
              src={`data:${attached.mimeType};base64,${attached.base64}`}
              alt="preview"
              className="w-7 h-7 object-cover"
              style={{ border: '1px solid var(--cyan-dim)' }}
            />
          )}
          {!attached.isImage && (
            <span style={{ color: 'var(--cyan)', fontSize: 14 }}>📄</span>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-[9px] truncate" style={{ color: 'var(--cyan)' }}>
              {attached.name}
            </div>
            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {attached.size} · {attached.isImage ? 'IMAGE' : 'PDF'}
            </div>
          </div>

          {analyzing && (
            <span className="text-[8px] tracking-[1px]" style={{ color: 'var(--amber)',
              animation: 'pulse-dot 1s ease-in-out infinite' }}>
              SCANNING...
            </span>
          )}

          {!analyzing && (
            <button
              onClick={onClear}
              className="text-[10px] hud-btn w-5 h-5"
              style={{ color: 'var(--text-muted)', minWidth: 20 }}
            >✕</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
