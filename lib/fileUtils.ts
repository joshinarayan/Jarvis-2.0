export type SupportedFile = {
  base64:   string
  mimeType: string
  name:     string
  size:     string
  isImage:  boolean
}

const MAX_SIZE_MB = 10

export async function processFile(file: File): Promise<SupportedFile> {
  // Size check
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Max ${MAX_SIZE_MB}MB.`)
  }

  // Type check
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  if (!allowed.includes(file.type)) {
    throw new Error(`Unsupported type: ${file.type}. Use JPG, PNG, WEBP or PDF.`)
  }

  const base64 = await toBase64(file)
  const sizeKB  = (file.size / 1024).toFixed(1)
  const sizeMB  = (file.size / 1024 / 1024).toFixed(2)

  return {
    base64,
    mimeType: file.type,
    name:     file.name,
    size:     file.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`,
    isImage:  file.type.startsWith('image/'),
  }
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => {
      const result = reader.result as string
      // Strip the data:mime;base64, prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
