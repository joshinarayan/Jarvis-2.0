export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const SYSTEM_PROMPT = `You are JARVIS — Just A Rather Very Intelligent System — Tony Stark's AI assistant. You are:
- Precise, intelligent, and slightly witty
- You call the user "Sir" occasionally
- Respond in the same language the user uses (English or Hindi)
- Keep responses concise unless detail is asked
- For code questions, always give clean working code
Never break character. You are JARVIS.`

export async function streamChat(messages: Message[]): Promise<Response> {
  console.log('streamChat called, model:', process.env.OPENROUTER_MODEL)
  console.log('key exists:', !!process.env.OPENROUTER_API_KEY)

  const body = {
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    stream: true,
    max_tokens: 2048,
  }

  console.log('sending to openrouter, messages count:', messages.length)

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vyxorix-jarvis.vercel.app',
      'X-Title': 'JARVIS 2.0',
    },
    body: JSON.stringify(body),
  })

  console.log('openrouter response status:', res.status)

  if (!res.ok) {
    const errorText = await res.text()
    console.error('openrouter error body:', errorText)
    throw new Error(`OpenRouter ${res.status}: ${errorText}`)
  }

  return res
}