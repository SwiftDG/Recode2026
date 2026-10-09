import { interview } from '../server/interview.mjs'

export async function POST(request) {
  if (Number(request.headers.get('content-length') || 0) > 220000) return Response.json({ error: 'Request too large.' }, { status: 413 })
  try {
    const raw = await request.text()
    if (raw.length > 220000) return Response.json({ error: 'Request too large.' }, { status: 413 })
    const result = await interview(JSON.parse(raw))
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Feedback unavailable.'
    return Response.json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
}
