import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize2, Send } from 'lucide-react'
import { analysisFiles, type Project } from './project'
import { tour, type Citation } from './learning'

type Prompt = { text: string; citation: Citation }
type Note = { reaction: string; nextStep: string; citation: Citation }
type Turn = { answer: string; note: Note }

function prompts(project: Project, role: string, focus: string): Prompt[] {
  const lessons = tour(project)
  const context = focus.trim() ? ` The role emphasizes ${focus.trim()}.` : ''
  return [
    { text: `You're interviewing for a ${role}. Walk me through the frontend stack in this project. Which part can you personally explain?${context}`, citation: lessons[0].trace[0].citation },
    { text: `Choose one interaction in this project. What does the user do, which handler runs, and what changes on screen?`, citation: lessons[2].trace[lessons[2].trace.length - 1].citation },
    { text: `How would you build this project for release? What can you verify about its styling and hosting from the repository?`, citation: lessons[3].trace[lessons[3].trace.length - 1].citation },
  ]
}

function Source({ citation, project }: { citation: Citation; project: Project }) {
  const lines = project.files.find(file => file.path === citation.path)?.content.split('\n') ?? []
  const start = Math.max(0, citation.line - 2)
  return <details className="interview-source"><summary>Check {citation.path}:{citation.line}</summary><pre>{lines.slice(start, citation.line + 2).map((line, index) => `${start + index + 1}  ${line}`).join('\n')}</pre></details>
}

export default function Interview({ project, onExit }: { project: Project; onExit: () => void }) {
  const [role, setRole] = useState('Frontend developer')
  const [focus, setFocus] = useState('')
  const [consent, setConsent] = useState(false)
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [interruptions, setInterruptions] = useState(0)
  const [focusMessage, setFocusMessage] = useState('')
  const room = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const questions = prompts(project, role.trim() || 'frontend developer', focus)
  const complete = turns.length === questions.length

  useEffect(() => {
    if (!started) return
    const track = () => { if (document.hidden) setInterruptions(count => count + 1) }
    document.addEventListener('visibilitychange', track)
    return () => document.removeEventListener('visibilitychange', track)
  }, [started])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [turns, index, busy])

  async function focusRoom() {
    try { await room.current?.requestFullscreen(); setFocusMessage('Focused view is on. Press Escape to leave it.') }
    catch { setFocusMessage('Full-screen view is unavailable here. You can continue the practice.') }
  }
  async function submit() {
    const submitted = answer.trim()
    if (!submitted || busy) return
    setAnswer('')
    setBusy(true)
    const question = questions[index]
    let note: Note = { reaction: 'Thanks. In a real interview, connect that answer to an exact file and describe only the part you can verify.', nextStep: 'Open the source below and try saying the answer again in your own words.', citation: question.citation }
    if (consent) {
      try {
        const response = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: role.trim(), focus: focus.trim(), question: question.text, answer: submitted, index, files: analysisFiles(project, [0, 4, 7][index], 'lesson') }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Interview feedback unavailable.')
        note = data as Note
      } catch { note = { ...note, reaction: 'The extra feedback is unavailable right now. Your answer is saved in this practice session.' } }
    }
    setTurns(previous => [...previous, { answer: submitted, note }])
    setBusy(false)
  }
  function next() { if (index + 1 < questions.length) setIndex(index + 1) }

  if (!started) return <div className="interview-setup narrow"><button className="back" onClick={onExit}><ArrowLeft size={16}/> Back to project</button><span className="eyebrow">INTERVIEW PRACTICE</span><h1>Explain the project under pressure.</h1><p className="lead">Three questions about the code you imported. Answer as yourself. Recode can help you find evidence, but it cannot verify that you wrote the code.</p><div className="setup-card"><label htmlFor="target-role">Frontend role you are preparing for</label><input id="target-role" value={role} maxLength={80} onChange={event => setRole(event.target.value)}/><label htmlFor="role-focus">What the role emphasizes <span>(optional)</span></label><textarea id="role-focus" value={focus} maxLength={280} rows={3} placeholder="For example: React state, component design, accessibility" onChange={event => setFocus(event.target.value)}/><p>This build can interview you about frontend code in {project.name}. It will ask about the imported source, not a general coding puzzle.</p><label className="ai-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>Use Gemini for coaching notes. My typed answers and selected source excerpts will be sent to Google. I have permission to share this code.</span></label></div><button className="primary" onClick={() => setStarted(true)}>Begin interview <ArrowRight size={16}/></button></div>

  return <div ref={room} className="interview-room"><div className="interview-bar"><div><span className="eyebrow">INTERVIEW PRACTICE</span><strong>{role.trim() || 'Frontend developer'}</strong><small>{project.name} · {complete ? 'Complete' : `Question ${index + 1} of ${questions.length}`}</small></div><div className="interview-tools"><button onClick={() => void focusRoom()} aria-label="Enter full-screen view"><Maximize2 size={17}/></button><button onClick={onExit}>Leave practice</button></div></div>{focusMessage && <p className="focus-message" role="status">{focusMessage}</p>}{interruptions > 0 && <p className="focus-message" role="status">You switched away {interruptions} {interruptions === 1 ? 'time' : 'times'}. Take a moment to refocus. This is practice, not a monitored exam.</p>}<div className="conversation" aria-live="polite">{questions.slice(0, Math.min(index + 1, questions.length)).map((question, number) => <div className="exchange" key={number}><div className="chat-bubble interviewer"><small>INTERVIEWER · {String(number + 1).padStart(2, '0')}</small><p>{question.text}</p></div>{turns[number] && <><div className="chat-bubble candidate"><small>YOU</small><p>{turns[number].answer}</p></div><div className="chat-bubble coach"><small>{consent ? 'GEMINI COACHING NOTE' : 'SOURCE REMINDER'}</small><p>{turns[number].note.reaction}</p><p>{turns[number].note.nextStep}</p><Source citation={turns[number].note.citation} project={project}/></div></>}{number === index && busy && <div className="chat-bubble coach loading-note" role="status">Reading your answer and the source…</div>}</div>)}<div ref={bottom}/></div>{complete ? <div className="interview-compose complete"><strong>Practice complete.</strong><p>Review your three answers and the cited files above. Try again after you can explain each step without reading the note.</p><button className="secondary" onClick={onExit}>Back to project</button></div> : turns.length > index ? <div className="interview-compose"><button className="primary" onClick={next}>Next question <ArrowRight size={16}/></button></div> : <form className="interview-compose" onSubmit={event => { event.preventDefault(); void submit() }}><label htmlFor="interview-answer">Your answer</label><textarea id="interview-answer" value={answer} maxLength={1200} rows={3} placeholder="Explain it the way you would to a person." onChange={event => setAnswer(event.target.value)} disabled={busy}/><div><small>It is fine to say what you do not know. Point to a file if you can.</small><button className="primary" type="submit" disabled={!answer.trim() || busy}>Send answer <Send size={16}/></button></div></form>}</div>
}
