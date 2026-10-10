import http from 'node:http'
import { POST as analyze } from '../api/analyze.js'
import { POST as interview } from '../api/interview.js'

const port = Number(process.env.API_PORT || 8787)
http.createServer(async (req, res) => {
  const handler = req.url === '/api/analyze' ? analyze : req.url === '/api/interview' ? interview : null
  if (!handler || req.method !== 'POST') { res.writeHead(404); res.end(); return }
  const chunks = []
  let size = 0
  for await (const chunk of req) { size += chunk.length; if (size > 220000) break; chunks.push(chunk) }
  const response = size > 220000 ? Response.json({ error: 'Request too large.' }, { status: 413 }) : await handler(new Request(`http://localhost:${port}${req.url}`, { method: 'POST', headers: { 'content-length': String(size) }, body: Buffer.concat(chunks) }))
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(await response.text())
}).listen(port, () => console.log(`Recode API at http://localhost:${port}`))
