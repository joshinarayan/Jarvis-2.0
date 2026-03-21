import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      }),
    })

    if (!res.ok) throw new Error(`Tavily error: ${res.status}`)

    const data = await res.json()

    // Return clean summary + sources
    return Response.json({
      answer: data.answer || null,
      results: data.results.map((r: any) => ({
        title:   r.title,
        url:     r.url,
        content: r.content.slice(0, 300), // trim long content
      })),
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}