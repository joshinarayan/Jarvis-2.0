import { NextRequest } from 'next/server'
import { SYSTEM_PROMPT } from '@/lib/openrouter'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType, userMessage } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ error: 'API key missing' }, { status: 500 })
    }

    const isImage = mimeType.startsWith('image/')

    // Build content array — text + file
    const userContent = isImage
      ? [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: 'text',
            text: userMessage || 'Analyze this image and describe what you see in detail.',
          },
        ]
      : [
          {
            type: 'text',
            text: `[PDF CONTENT ATTACHED]\n\n${userMessage || 'Analyze this document and summarize the key points.'}`,
          },
        ]

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vyxorix-jarvis.vercel.app',
        'X-Title': 'JARVIS 2.0',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.0-flash-lite:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userContent },
        ],
        max_tokens: 2048,
        stream: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Vision API ${res.status}: ${err}`)
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Analyze error:', err)
    const errorMsg = `data: ${JSON.stringify({
      choices: [{ delta: { content: `JARVIS VISION ERROR: ${String(err)}` } }]
    })}\n\n`
    return new Response(errorMsg, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }
}
