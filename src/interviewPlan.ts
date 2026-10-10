import { makeTopics, type Project, type SourceFile } from './project'
import type { Citation } from './learning'

export type Role = 'Frontend developer' | 'Full-stack developer' | 'Backend developer' | 'AI/ML developer'
export type InterviewPrompt = { title: string; question: string; citation: Citation; topic: number; fallback: string }

function anchor(file: SourceFile, pattern: RegExp): Citation {
  const lines = file.content.split('\n')
  const index = lines.findIndex(line => pattern.test(line))
  return { path: file.path, line: index >= 0 ? index + 1 : Math.min(lines.length, 1) }
}

export function interviewPlan(project: Project, role: Role, contribution: string, job: string): InterviewPrompt[] {
  const topics = makeTopics(project)
  const any = project.files[0]
  const select = (index: number, pattern: RegExp) => {
    const file = topics[index].files.find(item => pattern.test(item.content)) ?? topics[index].files[0] ?? any
    return { file, citation: anchor(file, pattern) }
  }
  const manifest = select(0, /"(?:react|next|vue|vite|express|fastapi|typescript)"|"build"/i)
  const entry = select(1, /createRoot|\.render\(|import\s+App|FastAPI\(|express\(/)
  const component = select(2, /export\s+(?:default\s+)?(?:function|const)|function\s+\w+|return\s*\(/)
  const state = select(4, /useState|useReducer|onClick|onChange|addEventListener/)
  const request = select(5, /fetch\(|axios\.|supabase\.from|\.get\(|\.post\(/)
  const style = select(6, /font-family|display:|@media|--[\w-]+:/)
  const build = select(7, /"build"|deploy|vercel|netlify|Dockerfile/)
  if (role !== 'Frontend developer') {
    const source = (pattern: RegExp, preferred: RegExp) => {
      const file = project.files.find(item => preferred.test(item.path) && pattern.test(item.content)) ?? project.files.find(item => pattern.test(item.content)) ?? any
      return { file, citation: anchor(file, pattern) }
    }
    const server = source(/express\(|FastAPI\(|app\.(?:get|post)|@app\.(?:get|post)|router\./i, /\.(?:[jt]s|py)$/)
    const data = source(/SELECT |CREATE TABLE|prisma\.|supabase\.|\.query\(|fetch\(/i, /\.(?:[jt]s|py|sql|prisma)$/)
    const auth = source(/auth|token|session|permission|requireUser/i, /\.(?:[jt]s|py)$/)
    const model = source(/gemini|openai|huggingface|transformers|predict\(|generateContent|inference/i, /\.(?:[jt]s|py)$/)
    const tests = source(/test\(|describe\(|def test_|pytest|assert |vitest|jest/i, /\.(?:[jt]s|py)$/)
    const jobText = job.trim() ? `The job expects ${job.trim().slice(0, 160)}. ` : ''
    const own = contribution.trim() ? `You said you worked on ${contribution.trim().slice(0, 160)}. ` : ''
    const prompt = (title: string, ref: {file: SourceFile; citation: Citation}, question: string, fallback: string, topic: number): InterviewPrompt => ({ title, citation: ref.citation, question, fallback, topic })
    return [
      prompt('Ownership', component, `${own}Which part of ${project.name} did you personally contribute, and what code supports that claim?`, 'Separate your own work from code a teammate or assistant wrote.', 2),
      prompt('Architecture', manifest, `${jobText}What are the major pieces of this system, and why is this stack appropriate? Use ${manifest.file.path} if relevant.`, 'Name a real dependency or import and explain its job.', 0),
      prompt('Entry and flow', server, `Trace one request or user action through ${server.file.path}. If this is not a server file, find the actual entry.`, 'Name the handler and show what it returns or changes.', 1),
      prompt('Data boundary', data, `Inspect ${data.file.path}. How does data enter and leave the system, and what is validated?`, 'What happens when the input is malformed or the data source fails?', 5),
      prompt('Security and privacy', auth, `What protection or access rule can you actually verify in ${auth.file.path}? What remains unproven?`, 'What would happen if an unauthenticated caller tried the action?', 4),
      prompt('AI behavior', model, `If ${model.file.path} contains AI integration, what does the model receive and return? How is bad output handled? If it does not, say so.`, 'Show an actual API/model call or explain why there is no evidence.', 5),
      prompt('Verification', tests, `What did you test in ${tests.file.path}, and how would you reproduce a failure? If this is not a test, identify the gap.`, 'Describe one concrete test case with input and expected result.', 7),
      prompt('Release judgment', build, `How do you build and release this project? What would you improve before production? Distinguish source evidence from deployment claims.`, 'Which exact command or configuration can you prove from the repo?', 7),
    ]
  }
  const target = job.trim() ? `The target job mentions ${job.trim().slice(0, 180)}. ` : ''
  const ownership = contribution.trim() ? `You said your contribution was: ${contribution.trim().slice(0, 180)}. ` : 'You have not specified your contribution. '

  return [
    { title: 'Ownership', topic: 2, citation: component.citation, question: `${ownership}Pick one feature you personally worked on in ${project.name}. What was your contribution, and which file would you open to show it?`, fallback: 'Show the exact code you changed, then distinguish your work from a teammate or coding assistant.' },
    { title: 'Stack', topic: 0, citation: manifest.citation, question: `${target}This repository has ${manifest.file.path}. What does the stack do for this product, and why did you choose one of those tools?`, fallback: 'Name a dependency from the manifest, then explain one tradeoff or alternative.' },
    { title: 'Startup', topic: 1, citation: entry.citation, question: `Start at ${entry.file.path}. Trace what happens from loading the app to a user seeing the first screen. What evidence in the file supports your answer?`, fallback: 'Which import or mount line takes you to the next file? What part cannot be proven by source alone?' },
    { title: 'Feature trace', topic: 2, citation: component.citation, question: `Open ${component.file.path}. Walk me through a user-visible feature this file supports, from user action to result. Point out the exact function or component.`, fallback: 'What triggers the feature, which function runs, and what does the user see next?' },
    { title: 'State or navigation', topic: 4, citation: state.citation, question: `In ${state.file.path}, what changes after a user action? How is that change represented and rendered? If this file is not relevant, find the real state or navigation boundary.`, fallback: 'What happens on a repeat click or refresh? Separate verified behavior from a guess.' },
    { title: 'Data and failure', topic: 5, citation: request.citation, question: `Inspect ${request.file.path}. Where does this feature get data, and what happens when that data is missing or a request fails? If the repo does not show it, say so.`, fallback: 'Name the request or data source and the exact failure state the interface handles.' },
    { title: 'Design and access', topic: 6, citation: style.citation, question: `A reviewer asks about the UI in ${style.file.path}. How do layout, typography, mobile behavior, and keyboard access work here? Give evidence and one limitation.`, fallback: 'Point to one CSS rule or component attribute. Which accessibility behavior did you test rather than infer?' },
    { title: 'Release and judgment', topic: 7, citation: build.citation, question: `How would you build and verify this project before release? Use ${build.file.path} as evidence. What would you change first if you had another day?`, fallback: 'What exact command or config is present, what test would you run, and what remains unknown about the live deployment?' },
  ]
}
