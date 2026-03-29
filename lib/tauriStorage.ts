// Detects if running inside Tauri desktop app
export const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window

export async function saveChat(messages: object[]): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_chat', { content: JSON.stringify(messages) })
  } else {
    localStorage.setItem('jarvis-chat-history', JSON.stringify(messages))
  }
}

export async function loadChat(): Promise<object[]> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core')
    const raw = await invoke<string>('load_chat')
    return JSON.parse(raw)
  } else {
    try {
      const saved = localStorage.getItem('jarvis-chat-history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }
}

export async function saveCredentials(username: string, passwordHash: string): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_credentials', { username, passwordHash })
  } else {
    localStorage.setItem('jarvis-auth', JSON.stringify({ username, hash: passwordHash }))
  }
}

export async function loadCredentials(): Promise<{ username?: string; hash?: string }> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core')
    const raw = await invoke<string>('load_credentials')
    return JSON.parse(raw)
  } else {
    try {
      const saved = localStorage.getItem('jarvis-auth')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }
}