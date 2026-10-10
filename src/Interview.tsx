import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize2, Send } from 'lucide-react'
import { analysisFiles, type Project } from './project'
import { interviewPlan, type Role } from './interviewPlan'
import type { Citation } from './learning'

type Note = { verdict: 'supported' | 'partial' | 'unsupported'; reaction: string; followUp: string; nextStep: string; citation: Citation }
type Turn = { index: number; stage: 'main' | 'followup'; question: string; answer: string; note: Note | null; error?: string }
const roles: Role[] = ['Frontend developer', 'Full-stack developer', 'Backend developer', 'AI/ML developer']

function Source({ citation, project }: { citation: Citation; project: Project }) {
  const lines = project.files.find(file => file.path === citation.path)?.content.split('\n') ?? []
  const start = Math.max(0, citation.line - 2)
  return <details className="interview-source"><summary>Open evidence: {citation.path}:{citation.line}</summary><pre>{lines.slice(start, citation.line + 2).map((line, index) => `${start + index + 1}  ${line}`).join('\n')}</pre></details>
}

export default function Interview({ project, onExit }: { project: Project; onExit: () => void }) {
  const [role, setRole] = useState<Role>('Frontend developer')
  const [job, setJob] = useState('')
  const [contribution, setContribution] = useState('')
  const [consent, setConsent] = useState(false)
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<'main' | 'followup' | 'review'>('main')
  const [answer, setAnswer] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [interruptions, setInterruptions] = useState(0)
  const [focusMessage, setFocusMessage] = useState('')
  const room = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const plan = interviewPlan(project, role, contribution, job)
  const complete = index >= plan.length
  const current = plan[index]
  const previous = turns.find(turn => turn.index === index && turn.stage === 'main')
  const followUp = previous?.note?.followUp ?? current?.fallback

  useEffect(() => {
    if (!started) return
    const track = () => { if (document.hidden) setInterruptions(count => count + 1) }
    document.addEventListener('visibilitychange', track)
    return () => document.removeEventListener('visibilitychange', track)
  }, [started])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [turns, index, busy, stage])

  async function focusRoom() {
    try { await room.current?.requestFullscreen(); setFocusMessage('Focused view is on. Press Escape to leave it.') }
    catch { setFocusMessage('Full-screen view is unavailable here. Continue in this view.') }
  }
  async function submit() {
    const submitted = answer.trim()
    if (!submitted || busy || !current || stage === 'review') return
    setBusy(true)
    let note: Note | null = null
    let error = ''
    const question = stage === 'main' ? current.question : followUp
    if (consent) {
      try {
        const response = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, job: job.trim(), contribution: contribution.trim(), question, answer: submitted, previousAnswer: previous?.answer ?? '', stage, index, files: analysisFiles(project, current.topic, 'lesson') }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Interview feedback unavailable.')
        note = data as Note
      } catch (reason) { error = reason instanceof Error ? reason.message : 'AI review unavailable.' }
    }
    setTurns(old => [...old, { index, stage, question, answer: submitted, note, error }])
    setAnswer('')
    setStage(stage === 'main' ? 'followup' : 'review')
    setBusy(false)
  }
  function advance() { setIndex(value => value + 1); setStage('main') }

  if (!started) return <div className="interview-setup narrow"><button className="back" onClick={onExit}><ArrowLeft size={16}/> Back to project</button><span className="eyebrow">PROJECT INTERVIEW</span><h1>Can you defend what you built?</h1><p className="lead">Eight project questions, each with a follow-up. A real answer names the code, explains the decision, and admits what you cannot verify.</p><div className="setup-card"><label htmlFor="target-role">Role you are applying for</label><select id="target-role" value={role} onChange={event => setRole(event.target.value as Role)}>{roles.map(value => <option key={value}>{value}</option>)}</select><label htmlFor="job-description">Job requirements <span>(optional)</span></label><textarea id="job-description" value={job} maxLength={700} rows={3} placeholder="Paste a few requirements from the role, for example React, API integration, accessibility." onChange={event => setJob(event.target.value)}/><label htmlFor="contribution">What did you personally work on? <span>(optional, be honest)</span></label><textarea id="contribution" value={contribution} maxLength={400} rows={2} placeholder="For example: I built the frontend forms and deployed the site. My teammate wrote the API." onChange={event => setContribution(event.target.value)}/><p>{role === 'Frontend developer' ? 'Frontend is the most thoroughly supported path in this build.' : 'This role is selectable, but source detection is strongest for React frontend projects. The interviewer must say when evidence is missing.'}</p><label className="ai-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>Allow Gemini to review my answers and selected code excerpts. I have permission to share this source. Without this, the source-based questions and follow-ups still work, but answers are not assessed.</span></label></div><button className="primary" onClick={() => setStarted(true)}>Start the interview <ArrowRight size={16}/></button></div>

  return <div ref={room} className="interview-room"><div className="interview-bar"><div><span className="eyebrow">RECODE INTERVIEW</span><strong>{role}</strong><small>{project.name} · {complete ? 'Complete' : `Round ${index + 1} of ${plan.length} · ${stage === 'followup' ? 'Follow-up' : 'Main question'}`}</small></div><div className="interview-tools"><button onClick={() => void focusRoom()} aria-label="Enter full-screen view"><Maximize2 size={17}/></button><button onClick={onExit}>Leave practice</button></div></div><div className="interview-progress" aria-label={`${Math.min(index, plan.length)} of ${plan.length} rounds completed`}><i style={{ width: `${(Math.min(index, plan.length) / plan.length) * 100}%` }}/></div>{focusMessage && <p className="focus-message" role="status">{focusMessage}</p>}{interruptions > 0 && <p className="focus-message">You switched away {interruptions} {interruptions === 1 ? 'time' : 'times'}. This is a practice reminder, not cheating detection.</p>}<div className="conversation" aria-live="polite"><p className="interview-intro">Interviewer · Project deep dive</p>{turns.map((turn, number) => <div className="exchange" key={number}><div className="chat-bubble interviewer"><small>{turn.stage === 'main' ? `ROUND ${turn.index + 1} · ${plan[turn.index].title.toUpperCase()}` : 'FOLLOW-UP'}</small><p>{turn.question}</p></div><div className="chat-bubble candidate"><small>YOUR ANSWER</small><p>{turn.answer}</p></div>{turn.note && <div className="chat-bubble coach"><small>REVIEW · {turn.note.verdict.toUpperCase()}</small><p>{turn.note.reaction}</p>{turn.stage === 'followup' && <p>Next to study: {turn.note.nextStep}</p>}<Source citation={turn.note.citation} project={project}/></div>}{turn.error && <div className="chat-bubble coach"><small>REVIEW UNAVAILABLE</small><p>{turn.error} Your answer has not been assessed. The next question still uses your imported source.</p><Source citation={plan[turn.index].citation} project={project}/></div>}</div>)}{!complete && stage === 'main' && <div className="chat-bubble interviewer active-question"><small>ROUND {index + 1} · {current.title.toUpperCase()}</small><p>{current.question}</p><Source citation={current.citation} project={project}/></div>}{!complete && stage === 'followup' && <div className="chat-bubble interviewer active-question"><small>INTERVIEWER · FOLLOW-UP</small><p>{followUp}</p></div>}{busy && <div className="chat-bubble coach loading-note" role="status">Checking your answer against the source…</div>}{complete && <div className="interview-end"><span className="eyebrow">INTERVIEW COMPLETE</span><h2>Look at the answers you could defend.</h2><p>{turns.filter(turn => turn.note?.verdict === 'supported').length} of {turns.filter(turn => turn.note).length} reviewed answers were marked source-supported. Unreviewed answers are excluded. This is practice, not a hiring score or authorship proof.</p><ul>{plan.map((item, number) => { const latest = turns.find(turn => turn.index === number && turn.stage === 'followup'); return <li key={number}><b>{item.title}</b><span>{latest?.note?.verdict ?? 'Not assessed'}</span>{latest?.note?.nextStep && <small>{latest.note.nextStep}</small>}</li> })}</ul><button className="secondary" onClick={onExit}>Return to my project</button></div>}<div ref={bottom}/></div>{!complete && stage === 'review' ? <div className="interview-compose"><p>That round is complete. Review the evidence above, then continue.</p><button className="primary" onClick={advance}>{index === plan.length - 1 ? 'See my review' : 'Next round'} <ArrowRight size={16}/></button></div> : !complete ? <form className="interview-compose" onSubmit={event => { event.preventDefault(); void submit() }}><label htmlFor="interview-answer">Your answer</label><textarea id="interview-answer" value={answer} maxLength={2600} rows={3} placeholder="Be specific. Name the file, explain the behavior, and admit uncertainty." onChange={event => setAnswer(event.target.value)} disabled={busy}/><div><small>{consent ? 'Gemini checks this answer against selected source lines.' : 'AI review is off. You will still get a follow-up question.'}</small><button className="primary" type="submit" disabled={!answer.trim() || busy}>Send answer <Send size={16}/></button></div></form> : null}</div>
}
