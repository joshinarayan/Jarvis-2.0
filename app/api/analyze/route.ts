import { NextRequest } from 'next/server'
import { SYSTEM_PROMPT } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType, userMessage } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ error: 'API key missing' }, { status: 500 })
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vyxorix-jarvis.vercel.app',
        'X-Title': 'JARVIS 2.0',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
              {
                type: 'text',
                text: userMessage || 'Analyze this image and describe what you see in detail.',
              },
            ],
          },
        ],
        max_tokens: 1024,
        stream: false,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Vision API ${res.status}: ${err}`)
    }

    const data = await res.json()

    // Handle errors in response
    if (data.error) {
      throw new Error(data.error.message || 'Vision API error')
    }

    const content = data.choices?.[0]?.message?.content || 'Sir, I could not analyze that image.'

    return Response.json({ content })

  } catch (err) {
    console.error('Analyze error:', err)
    return Response.json(
      { content: `JARVIS VISION ERROR: ${String(err)}` },
      { status: 200 }
    )
  }
}