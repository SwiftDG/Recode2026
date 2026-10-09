import test from 'node:test'
import assert from 'node:assert/strict'
import { interview } from './interview.mjs'

const input = { index: 0, role: 'Frontend developer', focus: 'React', question: 'What stack?', answer: 'React renders the interface.', files: [{ path: 'package.json', content: '{\n  "dependencies": { "react": "19" }\n}' }] }

test('interview note keeps a supplied source citation and does not send a score', async () => {
  const fakeFetch = async (_url, options) => {
    const request = JSON.parse(options.body)
    assert.equal(request.generationConfig.responseMimeType, 'application/json')
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reaction: 'You identified React in the dependency list.', nextStep: 'Explain what component it renders and cite the entry point.', citation: { path: 'package.json', line: 2 } }) }] } }] }), { status: 200 })
  }
  const result = await interview(input, { key: 'test-key', fetchImpl: fakeFetch })
  assert.equal(result.citation.line, 2)
  assert.equal('score' in result, false)
})

test('interview rejects a citation outside selected source', async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reaction: 'This answer needs more detail.', nextStep: 'Check the project manifest again.', citation: { path: '.env', line: 1 } }) }] } }] }), { status: 200 })
  await assert.rejects(() => interview(input, { key: 'test-key', fetchImpl: fakeFetch }), /incomplete source note/)
})
