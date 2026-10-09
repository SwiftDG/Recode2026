import test from 'node:test'
import assert from 'node:assert/strict'
import { analyze, checkOutput, selectEvidence, validateInput } from './analysis.mjs'

const files = [
  { path: 'package.json', content: '{"scripts":{"build":"vite build"}}' },
  { path: 'src/main.tsx', content: "import App from './App'\nrender(<App />)" },
]

test('lesson carries a checked source reference through the model response', async () => {
  const input = { action: 'lesson', role: 'frontend', index: 1, files }
  assert.equal(validateInput(input).files.length, 2)
  assert.ok(selectEvidence(files, 'lesson', 1).some(e => e.path === 'src/main.tsx'))
  const lesson = { title: 'Entry point', explanation: 'The app starts in main.', trace: [{ point: 'App is imported.', citation: { path: 'src/main.tsx', line: 1 } }], sayIt: 'I can trace the entry point.', check: 'Where does App render?', limitation: 'This does not establish hosting.' }
  const fakeFetch = async (_url, options) => {
    assert.equal(options.headers['x-goog-api-key'], 'test-key')
    const payload = JSON.parse(options.body)
    assert.equal(payload.generationConfig.responseMimeType, 'application/json')
    assert.equal(payload.generationConfig.responseSchema.type, 'OBJECT')
    assert.equal(payload.generationConfig.responseSchema.properties.trace.items.type, 'OBJECT')
    assert.equal(payload.generationConfig.responseFormat, undefined)
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(lesson) }] } }] }), { status: 200 })
  }
  assert.equal((await analyze(input, { key: 'test-key', fetchImpl: fakeFetch })).trace[0].citation.line, 1)
  assert.throws(() => checkOutput({ ...lesson, trace: [{ point: 'Unsupported file.', citation: { path: '.env', line: 1 } }] }, 'lesson', selectEvidence(files, 'lesson', 1)), /verifiable/)
})

test('questions need four distinct options and a real source line', () => {
  const evidence = selectEvidence(files, 'quiz', 0)
  const question = { prompt: 'What runs the build?', choices: ['Vite', 'React', 'Node', 'None'], correct: 0, reason: 'The script invokes vite build.', citation: { path: 'package.json', line: 1 } }
  assert.equal(checkOutput({ questions: [question] }, 'quiz', evidence).questions.length, 1)
  assert.throws(() => checkOutput({ questions: [{ ...question, citation: { path: 'README.md', line: 1 } }] }, 'quiz', evidence), /verifiable/)
  assert.throws(() => validateInput({ action: 'quiz', role: 'frontend', index: 0, files: [{ path: '.env', content: 'KEY=123' }] }), /Unsupported/)
})

test('provider 400 reveals a short, redacted diagnostic', async () => {
  const input = { action: 'lesson', role: 'frontend', index: 0, files }
  const fakeFetch = async () => new Response(JSON.stringify({ error: { status: 'INVALID_ARGUMENT', message: 'Unknown name "responseFormat"; test-key is invalid here' } }), { status: 400 })
  await assert.rejects(() => analyze(input, { key: 'test-key', fetchImpl: fakeFetch }), error => {
    assert.match(error.message, /Unknown name "responseFormat"/)
    assert.doesNotMatch(error.message, /test-key/)
    return true
  })
})

test('transient 503 is retried once before returning a valid lesson', async () => {
  let calls = 0
  const lesson = { title: 'Entry point', explanation: 'This is the browser entry file.', trace: [{ point: 'App is imported here.', citation: { path: 'src/main.tsx', line: 1 } }], sayIt: 'I can trace the startup path.', check: 'Where does App render?', limitation: 'This does not prove deployment.' }
  const fakeFetch = async () => {
    calls += 1
    return calls === 1
      ? new Response(JSON.stringify({ error: { status: 'UNAVAILABLE' } }), { status: 503 })
      : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(lesson) }] } }] }), { status: 200 })
  }
  const result = await analyze({ action: 'lesson', role: 'frontend', index: 1, files }, { key: 'test-key', fetchImpl: fakeFetch })
  assert.equal(calls, 2)
  assert.equal(result.trace[0].citation.path, 'src/main.tsx')
})
