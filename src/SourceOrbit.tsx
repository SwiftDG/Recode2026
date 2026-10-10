import { useState, type CSSProperties, type PointerEvent } from 'react'
import type { Project } from './project'

export default function SourceOrbit({ project, label }: { project: Project; label: string }) {
  const files = project.files.filter(file => /(^|\/)(package\.json|main\.[jt]sx?|App\.[jt]sx?|index\.[jt]sx?|[^/]+\.css)$/.test(file.path))
  const shown = [...files, ...project.files.filter(file => !files.includes(file))].slice(0, 5)
  const [selected, setSelected] = useState(0)
  const [tilt, setTilt] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const update = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' && !dragging) return
    const bounds = event.currentTarget.getBoundingClientRect()
    setTilt([((event.clientX - bounds.left) / bounds.width - .5) * 16, ((event.clientY - bounds.top) / bounds.height - .5) * -12])
  }
  const picked = shown[selected]
  const lines = picked?.content.split('\n') ?? []
  const first = lines.findIndex(line => /createRoot|useState|onClick|onChange|"react"|"build"|font-family|fetch\(/.test(line))
  const line = Math.max(0, first)
  const excerpt = lines.slice(line, line + 3).join('\n').slice(0, 250)
  return <div className="source-orbit" aria-label={`${label}: interactive map of source files`} onPointerMove={update} onPointerLeave={() => { if (!dragging) setTilt([0, 0]) }} onPointerDown={event => { if ((event.target as HTMLElement).closest('button')) return; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={event => { setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}>
    <div className="orbit-top"><span>{label}</span><span>{project.name}</span></div>
    <div className="orbit-stage"><div className="orbit-art" style={{ transform: `rotateX(${tilt[1]}deg) rotateY(${tilt[0]}deg)` } as CSSProperties}>
      <svg className="orbit-lines" viewBox="0 0 440 250" aria-hidden="true"><path d="M220 118 L78 48 M220 118 L360 35 M220 118 L372 192 M220 118 L76 210"/></svg>
      {shown.map((file, index) => <button className={`orbit-node orbit-node-${index} ${selected === index ? 'active' : ''}`} key={file.path} onClick={() => setSelected(index)} aria-pressed={selected === index} title={file.path}><span>{index === 0 ? '01' : `0${index + 1}`}</span><b>{file.path.split('/').pop()}</b></button>)}
    </div></div>
    <div className="orbit-inspect"><div><span>SELECTED SOURCE</span><strong>{picked?.path}</strong></div><pre>{excerpt || 'No preview available.'}</pre></div>
    <p className="orbit-hint">Move or drag to explore. Select a file to inspect its actual code.</p>
  </div>
}
