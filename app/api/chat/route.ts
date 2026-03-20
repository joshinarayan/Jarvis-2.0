import { streamChat, Message } from '@/lib/openrouter'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json()
    const upstream = await streamChat(messages)

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'JARVIS offline' }, { status: 500 })
  }
}