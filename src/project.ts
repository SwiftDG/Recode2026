import JSZip from 'jszip'

export type SourceFile = { path: string; content: string }
export type Project = { name: string; source: 'GitHub' | 'ZIP' | 'guided example'; files: SourceFile[] }
export type Topic = { title: string; goal: string; files: SourceFile[]; finding: string }

const permitted = /\.(tsx?|jsx?|css|scss|html|json|md|ya?ml|toml)$/i
const excluded = /(^|\/)(node_modules|dist|build|coverage|\.git|\.next|vendor)(\/|$)|(^|\/)(\.env(?:\.[^/]*)?|\.npmrc|credentials\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i
const eligible = (path: string) => permitted.test(path) && !excluded.test(path) && !path.includes('..') && !path.startsWith('/')
function checked(files: SourceFile[]) {
  const result = files.filter(f => eligible(f.path) && f.content.length <= 35000)
  if (!result.length) throw new Error('No supported source files found. Try a small React/Vite JavaScript or TypeScript project.')
  if (result.length > 160 || result.reduce((n, f) => n + f.content.length, 0) > 2_000_000) throw new Error('Project exceeds the preview limit of 160 files or 2 MB of source.')
  return result
}

export async function importZip(file: File): Promise<Project> {
  if (!/\.zip$/i.test(file.name)) throw new Error('Choose a .zip file.')
  if (file.size > 10_000_000) throw new Error('ZIP must be under 10 MB. Leave out dependencies and build output.')
  const archive = await JSZip.loadAsync(file)
  const entries = Object.values(archive.files).filter(f => !f.dir && eligible(f.name))
  if (entries.length > 160) throw new Error('This project has more than 160 supported files. Use a smaller source ZIP.')
  const files: SourceFile[] = []
  let total = 0
  const roots = new Set(entries.map(entry => entry.name.split('/')[0]))
  const stripRoot = roots.size === 1 && entries.every(entry => entry.name.includes('/'))
  for (const entry of entries) {
    const content = await entry.async('string')
    total += content.length
    if (total > 2_000_000) throw new Error('Uncompressed source exceeds the 2 MB preview limit.')
    if (content.length <= 35000) files.push({ path: stripRoot ? entry.name.split('/').slice(1).join('/') : entry.name, content })
  }
  return { name: file.name.replace(/\.zip$/i, ''), source: 'ZIP', files: checked(files) }
}

export async function importGitHub(value: string): Promise<Project> {
  let url: URL
  try { url = new URL(value.trim()) } catch { throw new Error('Paste a full URL such as https://github.com/owner/repo.') }
  const parts = url.pathname.split('/').filter(Boolean)
  if (url.hostname !== 'github.com' || parts.length !== 2 || parts.some(p => !/^[\w.-]+$/.test(p))) throw new Error('Use a public GitHub repository URL: https://github.com/owner/repo.')
  const [owner, repo] = parts
  const meta = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
  if (!meta.ok) throw new Error(meta.status === 404 ? 'Repository not found or not public.' : `GitHub error ${meta.status}; try a ZIP.`)
  const info = await meta.json() as { default_branch: string; size: number }
  if (info.size > 10000) throw new Error('Repository is too large for this preview. Try a smaller ZIP.')
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(info.default_branch)}?recursive=1`)
  if (!response.ok) throw new Error('Could not read GitHub file list; try a ZIP.')
  const tree = await response.json() as { truncated?: boolean; tree: { path: string; type: string; size?: number }[] }
  if (tree.truncated) throw new Error('GitHub returned a truncated file list.')
  const entries = tree.tree.filter(f => f.type === 'blob' && eligible(f.path) && (f.size ?? 35001) <= 35000)
  if (entries.length > 160) throw new Error('More than 160 supported files; try a smaller ZIP.')
  const result = await Promise.all(entries.map(async f => {
    const raw = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(info.default_branch)}/${f.path.split('/').map(encodeURIComponent).join('/')}`)
    return raw.ok ? { path: f.path, content: await raw.text() } : null
  }))
  return { name: `${owner}/${repo}`, source: 'GitHub', files: checked(result.filter((f): f is SourceFile => f !== null)) }
}

export const example: Project = { name: 'example/profile-studio', source: 'guided example', files: [
  { path: 'package.json', content: JSON.stringify({ scripts: { dev: 'vite', build: 'vite build' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' }, devDependencies: { vite: '^5.0.0', typescript: '^5.0.0' } }, null, 2) },
  { path: 'index.html', content: '<html>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>' },
  { path: 'src/main.tsx', content: "import { createRoot } from 'react-dom/client'\nimport App from './App'\nimport './index.css'\n\ncreateRoot(document.getElementById('root')!).render(<App />)" },
  { path: 'src/App.tsx', content: "import { useState } from 'react'\n\nexport default function App() {\n  const [name, setName] = useState('')\n  return (\n    <main>\n      <label htmlFor=\"name\">Your name</label>\n      <input id=\"name\" value={name} onChange={event => setName(event.target.value)} />\n      <p>Welcome, {name || 'friend'}.</p>\n    </main>\n  )\n}" },
  { path: 'src/index.css', content: "body { font-family: Arial, sans-serif; margin: 0; }\nmain { max-width: 32rem; margin: 4rem auto; }\ninput { display: block; padding: 0.75rem; }" },
  { path: 'vite.config.ts', content: "import { defineConfig } from 'vite'\nexport default defineConfig({})" },
] }

export function makeTopics(project: Project): Topic[] {
  const pick = (test: (f: SourceFile) => boolean) => project.files.filter(test).slice(0, 8)
  const pkg = pick(f => f.path.endsWith('package.json'))
  let deps: string[] = []
  try { const data = JSON.parse(pkg[0]?.content ?? '{}'); deps = Object.keys({ ...data.dependencies, ...data.devDependencies }) } catch { /* leave unknown */ }
  const entry = pick(f => /(^|\/)(main|index)\.[jt]sx?$/.test(f.path))
  const ui = pick(f => /\.[jt]sx$/.test(f.path) && /return\s*\(|=>|function/.test(f.content))
  const routes = pick(f => /createBrowserRouter|<Route|RouterProvider|routes\s*=/.test(f.content))
  const state = pick(f => /useState|useReducer|useContext|zustand|redux/.test(f.content))
  const api = pick(f => /\bfetch\(|\baxios\.|supabase\.from/.test(f.content))
  const css = pick(f => /\.(css|scss)$/.test(f.path)).sort((a, b) => {
    const used = (file: SourceFile) => project.files.some(source => /\.[jt]sx?$/.test(source.path) && source.content.split('\n').some(line => /\bimport\b/.test(line) && line.includes(file.path.split('/').pop() ?? '')))
    return Number(used(b)) - Number(used(a))
  })
  const deploy = pick(f => /vercel\.json|netlify\.toml|wrangler\.toml|Dockerfile|\.github\/workflows/.test(f.path))
  const font = css.map(f => f.content.match(/font-family:\s*['"]?([^,'";\n]+)/i)?.[1]?.trim()).find(Boolean)
  return [
    { title: 'Stack and tools', goal: 'Name each tool and why it is in this project.', files: pkg, finding: deps.length ? deps.slice(0, 10).join(', ') : 'No readable package manifest found.' },
    { title: 'Entry point', goal: 'Trace how the browser starts this app.', files: entry, finding: entry[0] ? `App entry: ${entry[0].path}.` : 'Entry point not detected.' },
    { title: 'Components', goal: 'Explain what renders the interface.', files: ui, finding: ui.length ? `${ui.length} likely component files found.` : 'No supported component pattern detected.' },
    { title: 'Navigation', goal: 'Explain movement between screens.', files: routes, finding: routes.length ? `${routes.length} routing references found.` : 'No router identified; this may be a single-screen app.' },
    { title: 'State and interaction', goal: 'Explain what changes when users click or type.', files: state, finding: state.length ? `${state.length} state references found.` : 'No supported state pattern detected.' },
    { title: 'Data and requests', goal: 'Trace frontend requests and responses.', files: api, finding: api.length ? `${api.length} possible data boundaries found.` : 'No supported API calls found.' },
    { title: 'Styles and fonts', goal: 'Explain the visual choices actually in the code.', files: css, finding: font ? `CSS declares ${font}.` : css.length ? 'Stylesheets found; no font identified confidently.' : 'No CSS/SCSS found.' },
    { title: 'Build and hosting', goal: 'Explain how it builds, and do not guess its host.', files: [...pkg, ...deploy], finding: deploy.length ? `Deployment evidence: ${deploy.map(f => f.path).join(', ')}.` : 'No hosting configuration found. The host is not proven by this source.' },
  ]
}

export function analysisFiles(project: Project, topic: number, kind: 'lesson' | 'quiz'): SourceFile[] {
  const topics = makeTopics(project)
  const wanted = kind === 'lesson' ? [topic] : [[0, 1], [2, 3], [4, 5], [6], [7]][topic]
  const relevant = wanted.flatMap(i => topics[i].files)
  const core = project.files.filter(f => /(^|\/)(package\.json|index\.html|main\.[jt]sx?|App\.[jt]sx?)$/i.test(f.path))
  const ordered = [...new Map([...core, ...relevant, ...project.files].map(f => [f.path, f])).values()]
  let remaining = 155000
  const result: SourceFile[] = []
  for (const file of ordered) {
    if (remaining < 500) break
    const content = file.content.slice(0, Math.min(9000, remaining))
    if (content.length < 20) continue
    result.push({ path: file.path, content })
    remaining -= content.length
  }
  return result
}
