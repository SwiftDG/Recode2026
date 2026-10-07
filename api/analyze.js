import { analyze } from '../server/analysis.mjs'

export async function POST(request) {
  if (Number(request.headers.get('content-length') || 0) > 220000) return Response.json({ error: 'Request too large. Choose a smaller project.' }, { status: 413 })
  try {
    const raw = await request.text()
    if (raw.length > 220000) return Response.json({ error: 'Request too large. Choose a smaller project.' }, { status: 413 })
    const result = await analyze(JSON.parse(raw))
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed.'
    const status = /not configured/.test(message) ? 503 : /AI service|quota|model|response/.test(message) ? 502 : 400
    return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
  }
}
