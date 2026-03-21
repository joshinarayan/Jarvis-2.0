import { streamChat, Message } from '@/lib/openrouter'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    // Guard — no API key
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: 'OPENROUTER_API_KEY not set in environment' },
        { status: 500 }
      )
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
    console.error('Chat route error:', err)
    return Response.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}