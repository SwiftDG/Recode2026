import { type Project, type SourceFile } from './project'

export type Citation = { path: string; line: number }
export type Lesson = { title: string; explanation: string; trace: { point: string; citation: Citation }[]; sayIt: string; check: string; limitation: string }
export type Question = { prompt: string; choices: string[]; correct: number; reason: string; citation: Citation }

const find = (file: SourceFile | undefined, pattern: RegExp): Citation | null => {
  if (!file) return null
  const line = file.content.split('\n').findIndex(text => pattern.test(text)) + 1
  return line > 0 ? { path: file.path, line } : null
}
const first = (project: Project, pattern: RegExp) => project.files.find(file => pattern.test(file.path))
function usedStyle(project: Project) {
  const styles = project.files.filter(file => /\.css$/.test(file.path))
  const scripts = project.files.filter(file => /\.[jt]sx?$/.test(file.path))
  return styles.find(style => scripts.some(script => {
    const basename = style.path.split('/').pop()
    return script.content.split('\n').some(line => /\bimport\b/.test(line) && line.includes(basename ?? ''))
  })) ?? styles[0]
}
function interaction(project: Project) {
  const candidates = project.files.filter(file => /\.[jt]sx$/.test(file.path) && /useState|onChange|onClick/.test(file.content))
  for (const file of candidates) {
    const pairs = [...file.content.matchAll(/const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*useState/g)]
    for (const match of file.content.matchAll(/(onChange|onClick)=\{[^\n]{0,180}?\b(set[A-Za-z_$][\w$]*)\s*\(/g)) {
      const pair = pairs.find(item => item[2] === match[2])
      if (pair) return { file, pair, eventName: match[1] }
    }
  }
  const file = candidates[0]
  const pair = file?.content.match(/const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*useState/)
  return { file, pair, eventName: '' }
}

export function tour(project: Project): Lesson[] {
  const pkg = first(project, /(^|\/)package\.json$/)
  const entry = first(project, /(^|\/)(main|index)\.[jt]sx?$/)
  const component = first(project, /(^|\/)(App|page)\.[jt]sx?$/i) ?? project.files.find(file => /\.[jt]sx$/.test(file.path))
  const { file: state, pair: statePair, eventName } = interaction(project)
  const style = usedStyle(project)
  const host = project.files.find(file => /(^|\/)(vercel\.json|netlify\.toml|Dockerfile)$|\.github\/workflows\//.test(file.path))
  let dependencies: string[] = []
  try { const data = JSON.parse(pkg?.content ?? '{}'); dependencies = Object.keys({ ...data.dependencies, ...data.devDependencies }) } catch { /* unknown */ }
  const stack = dependencies.filter(item => ['react', 'react-dom', 'vite', 'next', 'typescript', 'tailwindcss'].includes(item))
  const stackName = stack.length ? stack.join(', ') : 'the dependencies listed in its manifest'
  const reference = (file: SourceFile | undefined, pattern = /./) => find(file, pattern) ?? find(project.files[0], /./)!
  return [
    { title: 'What is this made with?', explanation: pkg ? `The project manifest lists ${stackName}. These are tools used to build or run the project, not proof of who wrote it.` : 'A package manifest was not found. We cannot name the complete stack from these files.', trace: pkg && stack.length ? stack.slice(0, 4).map(name => ({ point: `${name} appears in the dependency list.`, citation: reference(pkg, new RegExp('"' + name + '"\\s*:')) })) : [{ point: 'A dependency list was not found in this import.', citation: reference(pkg) }], sayIt: pkg ? `This project lists ${stackName} in package.json. I can show where each appears.` : 'I need the package manifest before I can name the full stack.', check: 'Can you point to a file that supports each tool you name?', limitation: 'Dependencies do not prove who wrote the code or where it runs.' },
    { title: 'How does the screen appear?', explanation: entry ? `The browser entry is ${entry.path}. Start here and follow the imported app or component to the visible screen.` : 'No conventional browser entry file was found in this import. Inspect the project structure before describing startup.', trace: entry ? [{ point: 'Find the app import.', citation: reference(entry, /import\s+App|from\s+['"].*App/) }, { point: 'Find the call that mounts the app.', citation: reference(entry, /createRoot\(.*\.render|\.render\(/) }] : [{ point: 'Look for an entry file in the source tree.', citation: reference(component) }], sayIt: entry ? `The app starts in ${entry.path}; I would follow its imports to the screen component.` : 'I cannot verify the entry point from the files available.', check: 'Which file mounts the app, and which component does it render?', limitation: 'A source file alone does not prove how the deployed page behaves.' },
    { title: 'What changes when I interact?', explanation: statePair && eventName ? `In ${state!.path}, ${eventName} calls code that can update ${statePair[1]} through ${statePair[2]}. Follow where ${statePair[1]} is rendered to explain the visible result.` : state ? `An interaction or state reference appears in ${state.path}. Inspect its event and value before making a specific claim.` : 'No familiar React state or event handler was detected. This may be a static page or use another pattern.', trace: state ? [{ point: statePair ? `The ${statePair[1]} value and ${statePair[2]} updater are declared here.` : 'Inspect the state or event reference.', citation: reference(state, /const\s*\[.*\]\s*=\s*useState|useReducer|onClick|onChange/) }, ...(eventName && statePair ? [{ point: `Follow the ${eventName} handler that calls ${statePair[2]}.`, citation: reference(state, new RegExp(eventName + '.*' + statePair[2] + '\\(')) }] : [])] : [{ point: 'Check the component for another interaction pattern.', citation: reference(component) }], sayIt: statePair && eventName ? `When the ${eventName} handler runs, it can update ${statePair[1]} through ${statePair[2]}. I can show both lines.` : 'I would inspect the event handler before claiming how this screen changes.', check: 'What event starts the change, and where is the updated value displayed?', limitation: 'A handler shows intended code, not successful behavior in a live browser.' },
    { title: 'What makes it look and ship this way?', explanation: `${style ? `Styling is declared in ${style.path}. ` : 'No CSS file was detected. '} ${host ? `A deployment-related file is present at ${host.path}.` : 'No hosting configuration was found. A build script or Vite dependency does not identify the deployed host.'}`, trace: [{ point: style ? 'Inspect a real font or layout rule.' : 'Inspect the manifest for a build script.', citation: reference(style ?? pkg, /font-family|display:|margin:|"build"/) }, ...(pkg ? [{ point: 'Check the actual build command.', citation: reference(pkg, /"build"/) }] : []), ...(host ? [{ point: 'Check what the deployment file actually configures.', citation: reference(host) }] : [])], sayIt: `${style ? `I can show the style rules in ${style.path}.` : 'I cannot verify the styling from a CSS file.'} ${host ? `I would check ${host.path} for deployment details.` : 'The host is not established by this source.'}`, check: 'Which exact file supports the font, layout, build command and hosting claim?', limitation: 'A build command is not evidence that a deployment succeeded.' },
  ]
}

export function quickQuestions(project: Project): Question[] {
  const lessons = tour(project)
  const pkg = first(project, /(^|\/)package\.json$/)
  const entry = first(project, /(^|\/)(main|index)\.[jt]sx?$/)
  const { file: state, pair: statePair, eventName } = interaction(project)
  const style = usedStyle(project)
  const host = project.files.find(file => /(^|\/)(vercel\.json|netlify\.toml|Dockerfile)$|\.github\/workflows\//.test(file.path))
  const citation = (file: SourceFile | undefined, pattern = /./) => find(file, pattern) ?? lessons[0].trace[0].citation
  let build = ''
  try { build = JSON.parse(pkg?.content ?? '{}').scripts?.build ?? '' } catch { /* unknown */ }
  const font = style?.content.match(/font-family:\s*([^;}]+)/i)?.[1]?.trim() ?? ''
  const fontDistractors = ['Inter, sans-serif', 'Arial, sans-serif', 'system-ui', 'Georgia, serif', 'monospace'].filter(value => value !== font).slice(0, 3)
  const buildDistractors = ['tsc only', 'npm start', 'webpack --mode production', 'React automatically builds it'].filter(value => value !== build).slice(0, 2)
  const questions: Question[] = [
    { prompt: build ? 'What does this project run for its build script?' : 'What is missing before you can name this project’s build command?', choices: build ? [...buildDistractors, build, 'A browser screenshot'] : ['A screenshot', 'A package manifest or build configuration', 'A logo', 'The repository name'], correct: build ? 2 : 1, reason: build ? `package.json declares "build": "${build}".` : 'No build script was found in the imported manifest.', citation: citation(pkg, /"build"/) },
    { prompt: entry ? 'Where does this project mount its browser app?' : 'What should you inspect before claiming how this app starts?', choices: entry ? ['src/index.css', entry.path, 'package-lock.json', 'README.md'] : ['A screenshot alone', 'A conventional entry file or documented alternative', 'Only the CSS', 'The project title'], correct: 1, reason: entry ? `${entry.path} contains the mount or render call. Follow its imports next.` : 'No conventional entry file was detected in this import.', citation: citation(entry, /createRoot\(.*\.render|\.render\(/) },
    { prompt: statePair && eventName ? `When ${eventName} runs in ${state?.path}, which updater does it call?` : statePair ? `In ${state?.path}, what value is paired with ${statePair[2]}?` : 'How should you describe an interaction when this scan finds no familiar handler?', choices: statePair && eventName ? [...['setRoute', 'setTheme', 'setLoading', 'setValue'].filter(value => value !== statePair[2]).slice(0, 2), statePair[2], 'npm run build'] : statePair ? ['The build command', 'The current URL', statePair[1], 'The CSS font'] : ['React handles it automatically', 'There are definitely no interactions', 'Inspect the source for another event pattern', 'Guess from a screenshot'], correct: 2, reason: statePair && eventName ? `The ${eventName} handler calls ${statePair[2]}, which updates ${statePair[1]}.` : statePair ? `The state declaration pairs ${statePair[1]} with ${statePair[2]}. Trace the event handler next.` : 'The scan is limited; do not infer absence of interaction.', citation: citation(state, statePair && eventName ? new RegExp(eventName + '.*' + statePair[2] + '\\(') : /const\s*\[.*\]\s*=\s*useState|onClick|onChange/) },
    { prompt: font ? 'Which font-family does this stylesheet declare?' : 'Can you name the font confidently from these imported files?', choices: font ? [...fontDistractors, font] : ['Yes, every React app uses Inter', 'Yes, the repo name reveals it', 'Yes, the URL reveals it', 'No CSS font-family was detected'], correct: 3, reason: font ? `The stylesheet declares ${font}.` : 'No font-family was detected in a CSS file.', citation: citation(style, /font-family/) },
    { prompt: 'What can you honestly say about where this project is hosted?', choices: [host ? `A deployment file exists at ${host.path}; inspect it.` : 'The host is not proven by these source files.', 'It must be on Vercel because Vite is installed.', 'React automatically hosts the app.', 'The CSS file reveals the host.'], correct: 0, reason: host ? 'The deployment file is evidence worth inspecting; verify the live deployment separately.' : 'A build script does not identify a live hosting provider.', citation: citation(host ?? pkg, host ? /./ : /"build"/) },
  ]
  return questions
}
