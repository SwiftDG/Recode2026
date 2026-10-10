import test from 'node:test'
import assert from 'node:assert/strict'
import { interview } from './interview.mjs'

const input = { index: 1, stage: 'main', role: 'Frontend developer', job: 'React', contribution: 'I built the component', question: 'Why React here?', answer: 'React renders the interface.', previousAnswer: '', files: [{ path: 'package.json', content: '{\n  "dependencies": { "react": "19" }\n}' }] }
const note = { verdict: 'partial', reaction: 'You named React but have not explained the tradeoff.', followUp: 'Where does the first React component mount?', nextStep: 'Trace the entry component and its import.', citation: { path: 'package.json', line: 2 } }
const respond = value => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] }), { status: 200 })

test('interviewer asks a follow-up tied to an answer and validates cited source', async () => {
  const fakeFetch = async (_url, options) => {
    const request = JSON.parse(options.body)
    assert.match(request.contents[0].parts[0].text, /React renders the interface/)
    assert.match(request.systemInstruction.parts[0].text, /ONE specific follow-up/)
    return respond(note)
  }
  const result = await interview(input, { key: 'test-key', fetchImpl: fakeFetch })
  assert.equal(result.verdict, 'partial')
  assert.equal(result.followUp, note.followUp)
  assert.equal(result.citation.line, 2)
})

test('rejects ungrounded model citation', async () => {
  await assert.rejects(() => interview(input, { key: 'test-key', fetchImpl: async () => respond({ ...note, citation: { path: '.env', line: 1 } }) }), /incomplete source note/)
})

test('replaces brace-only citation with a meaningful source line', async () => {
  const result = await interview(input, { key: 'test-key', fetchImpl: async () => respond({ ...note, citation: { path: 'package.json', line: 1 } }) })
  assert.deepEqual(result.citation, { path: 'package.json', line: 2 })
})

test('rejects invalid assessment labels', async () => {
  await assert.rejects(() => interview(input, { key: 'test-key', fetchImpl: async () => respond({ ...note, verdict: 'hired' }) }), /incomplete source note/)
})
