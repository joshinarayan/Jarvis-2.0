export const runtime = 'edge'

export async function GET() {
  return Response.json({
    hasKey: !!process.env.OPENROUTER_API_KEY,
    keyStart: process.env.OPENROUTER_API_KEY?.slice(0, 12) || 'MISSING',
    model: process.env.OPENROUTER_MODEL || 'MISSING',
  })
}
