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
