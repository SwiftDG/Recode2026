import { type Project, type SourceFile } from './project'

export type Citation = { path: string; line: number }
export type Lesson = { title: string; explanation: string; trace: { point: string; citation: Citation }[]; sayIt: string; check: string; limitation: string }
export type Question = { prompt: string; choices: string[]; correct: number; reason: string; citation: Citation }

const find = (file: SourceFile | undefined, pattern: RegExp): Citation | null => {
  if (!file) return null
  const line = file.content.split('\n').findIndex(text => pattern.test(text)) + 1
  return { path: file.path, line: Math.max(1, line) }
}
const first = (project: Project, pattern: RegExp) => project.files.find(file => pattern.test(file.path))

export function tour(project: Project): Lesson[] {
  const pkg = first(project, /(^|\/)package\.json$/)
  const entry = first(project, /(^|\/)(main|index)\.[jt]sx?$/)
  const component = first(project, /(^|\/)(App|page)\.[jt]sx?$/i) ?? project.files.find(file => /\.[jt]sx$/.test(file.path))
  const state = project.files.find(file => /useState|useReducer|onClick|onChange/.test(file.content))
  const style = project.files.find(file => /\.css$/.test(file.path))
  const host = project.files.find(file => /(^|\/)(vercel\.json|netlify\.toml|Dockerfile)$|\.github\/workflows\//.test(file.path))
  let dependencies: string[] = []
  try { const data = JSON.parse(pkg?.content ?? '{}'); dependencies = Object.keys({ ...data.dependencies, ...data.devDependencies }) } catch { /* unknown */ }
  const stack = dependencies.filter(item => ['react', 'react-dom', 'vite', 'next', 'typescript', 'tailwindcss'].includes(item))
  const stackName = stack.length ? stack.join(', ') : 'the dependencies listed in its manifest'
  const reference = (file: SourceFile | undefined, pattern = /./) => find(file, pattern) ?? find(project.files[0], /./)!
  return [
    { title: 'What is this made with?', explanation: pkg ? `The project manifest lists ${stackName}. These are tools used to build or run the project, not proof of who wrote it.` : 'A package manifest was not found. We cannot name the complete stack from these files.', trace: [{ point: pkg ? 'Start with the dependency list and scripts.' : 'Inspect the first available file; the dependency list is missing.', citation: reference(pkg) }], sayIt: pkg ? `I can point to package.json for the tools this project uses: ${stackName}.` : 'I need the package manifest before I can name the full stack.', check: 'Can you point to a file that supports each tool you name?', limitation: 'Dependencies do not prove who wrote the code or where it runs.' },
    { title: 'How does the screen appear?', explanation: entry ? `The browser entry is ${entry.path}. Start here and follow the imported app or component to the visible screen.` : 'No conventional browser entry file was found in this import. Inspect the project structure before describing startup.', trace: [{ point: entry ? 'Find the app import and render call.' : 'Look for an entry file in the source tree.', citation: reference(entry ?? component, /createRoot|render|import|./) }], sayIt: entry ? `The app starts in ${entry.path}; I would follow its imports to the screen component.` : 'I cannot verify the entry point from the files available.', check: 'Which file mounts the app, and which component does it render?', limitation: 'A source file alone does not prove how the deployed page behaves.' },
    { title: 'What changes when I interact?', explanation: state ? `There is an interaction or state reference in ${state.path}. Find the input or button and follow the update to see what changes on screen.` : 'No familiar React state or event handler was detected. This may be a static page or use another pattern.', trace: [{ point: state ? 'Read the handler and the value it changes.' : 'Check the component for another interaction pattern.', citation: reference(state ?? component, /useState|useReducer|onClick|onChange|./) }], sayIt: state ? `I can trace a user action in ${state.path} to a state or event handler.` : 'I have not found an interaction I can honestly explain yet.', check: 'What event starts the change, and what visible value updates?', limitation: 'A handler shows intended code, not successful behavior in a live browser.' },
    { title: 'What makes it look and ship this way?', explanation: `${style ? `Styling is declared in ${style.path}. ` : 'No CSS file was detected. '} ${host ? `A deployment-related file is present at ${host.path}.` : 'No hosting configuration was found. A build script or Vite dependency does not identify the deployed host.'}`, trace: [{ point: style ? 'Look for a font, color or layout rule.' : 'Inspect the manifest for build scripts.', citation: reference(style ?? pkg, /font|color|display|build|./) }, ...(host ? [{ point: 'Check what the deployment file actually configures.', citation: reference(host) }] : [])], sayIt: `${style ? `I can show the style rules in ${style.path}.` : 'I cannot verify the styling from a CSS file.'} ${host ? `I would check ${host.path} for deployment details.` : 'The host is not established by this source.'}`, check: 'Which exact file supports the font, layout, build command and hosting claim?', limitation: 'A build command is not evidence that a deployment succeeded.' },
  ]
}

export function quickQuestions(project: Project): Question[] {
  const lessons = tour(project)
  const pkg = first(project, /(^|\/)package\.json$/)
  const entry = first(project, /(^|\/)(main|index)\.[jt]sx?$/)
  const state = project.files.find(file => /useState|useReducer|onClick|onChange/.test(file.content))
  const style = project.files.find(file => /\.css$/.test(file.path))
  const host = project.files.find(file => /(^|\/)(vercel\.json|netlify\.toml|Dockerfile)$|\.github\/workflows\//.test(file.path))
  const citation = (file: SourceFile | undefined, pattern = /./) => find(file, pattern) ?? lessons[0].trace[0].citation
  const questions: Question[] = [
    { prompt: 'Which file is the best starting point for checking this project’s dependencies?', choices: ['A screenshot of the homepage', pkg ? pkg.path : 'A package manifest, if available', 'A teammate’s guess', 'The browser address bar'], correct: 1, reason: pkg ? `The dependencies and scripts are listed in ${pkg.path}.` : 'A manifest would establish dependencies, but none was found in this import.', citation: citation(pkg) },
    { prompt: 'What can you honestly say about where this project is hosted?', choices: [host ? `A deployment file exists at ${host.path}; inspect it.` : 'The host is not proven by these source files.', 'It must be on Vercel because Vite is installed.', 'React automatically hosts the app.', 'The CSS file reveals the host.'], correct: 0, reason: host ? 'The deployment file is evidence worth inspecting; verify the live deployment separately.' : 'Do not infer a host from a tool or build script.', citation: citation(host ?? pkg) },
    { prompt: 'How would you begin tracing what appears on the screen?', choices: ['Only read the README title.', 'Guess from the repository name.', entry ? `Open ${entry.path} and follow its app import or render call.` : 'Look for a browser entry file, which was not detected here.', 'Inspect the font first.'], correct: 2, reason: entry ? 'The entry file leads toward the rendered component.' : 'Without a detected entry, check the tree before making a startup claim.', citation: citation(entry) },
    { prompt: 'What is the most defensible way to explain an interaction?', choices: ['Say React handles everything automatically.', 'Describe what the UI should do without checking code.', state ? `Follow an event or state reference in ${state.path} to the changed value.` : 'Inspect the files for another interaction pattern before making a claim.', 'Treat a screenshot as proof of the event handler.'], correct: 2, reason: state ? 'A handler or state update gives a concrete trace to explain.' : 'The scan did not detect a familiar handler; inspect the files before claiming behavior.', citation: citation(state) },
    { prompt: 'Where would you verify a claimed font or layout rule?', choices: ['The repo name', 'The deployment URL', style ? `${style.path}, then the exact rule` : 'A stylesheet or style declaration, if present', 'The number of commits'], correct: 2, reason: style ? `The style file contains the rules you can inspect.` : 'No CSS file was detected, so avoid a specific font claim.', citation: citation(style ?? pkg) },
  ]
  return questions
}
