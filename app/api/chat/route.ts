import { streamChat, Message } from '@/lib/openrouter'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ error: 'API key missing' }, { status: 500 })
    }

    const upstream = await streamChat(messages)

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('FULL ERROR:', err)
    // Return as readable error in chat
    const errorMsg = `data: ${JSON.stringify({
      choices: [{ delta: { content: `JARVIS ERROR: ${String(err)}` } }]
    })}\n\n`

    return new Response(errorMsg, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }
}