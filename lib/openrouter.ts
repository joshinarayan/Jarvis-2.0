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
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'JARVIS 2.0',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  return res
}