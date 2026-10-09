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

test('interview replaces a brace-only citation with an actual dependency line', async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reaction: 'The answer names React as a dependency.', nextStep: 'Explain how the entry file mounts the application.', citation: { path: 'package.json', line: 1 } }) }] } }] }), { status: 200 })
  const result = await interview(input, { key: 'test-key', fetchImpl: fakeFetch })
  assert.deepEqual(result.citation, { path: 'package.json', line: 2 })
})
