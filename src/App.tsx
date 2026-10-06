import { useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronRight, FileCode2, GitBranch, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react'
import { challenge, initialPlan, modelPlan, repoFiles, review } from './data'

type Stage = 1 | 2 | 3 | 4

const stages: { id: Stage; label: string }[] = [
  { id: 1, label: 'Map' },
  { id: 2, label: 'Plan' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Change' },
]

export default function App() {
  const [stage, setStage] = useState<Stage>(1)
  const [plan, setPlan] = useState(initialPlan)
  const [selectedFile, setSelectedFile] = useState(repoFiles[0])
  const [reviewed, setReviewed] = useState(false)
  const [showExample, setShowExample] = useState(false)

  const stageCopy = useMemo(() => ({
    1: 'See the codebase as connected responsibilities, not a folder of files.',
    2: 'Write the change plan before you touch code.',
    3: 'Compare your plan against the dependencies you may have missed.',
    4: 'Submit a small patch and explain what you changed.',
  })[stage], [stage])

  const nextStage = () => setStage((current) => Math.min(4, current + 1) as Stage)

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Recode home"><span>R</span> recode</a>
        <div className="repo-pill"><GitBranch size={15} /> starter/profile-settings</div>
        <button className="text-button">Exit session</button>
      </header>

      <section className="session-header" id="top">
        <div>
          <p className="eyebrow">Ownership session 01</p>
          <h1>Change the code.<br /><em>Know why it works.</em></h1>
          <p className="intro">Recode helps you trace a real change through an unfamiliar codebase before you ship it.</p>
        </div>
        <aside className="safety-note"><ShieldCheck size={20} /><span><strong>Read-only analysis</strong><br />Recode maps code. It never runs an imported repository.</span></aside>
      </section>

      <nav className="progress" aria-label="Session progress">
        {stages.map((item, index) => (
          <button key={item.id} className={stage === item.id ? 'active' : stage > item.id ? 'done' : ''} onClick={() => setStage(item.id)}>
            <span>{stage > item.id ? <Check size={14} /> : `0${item.id}`}</span>{item.label}
            {index < stages.length - 1 && <i />}
          </button>
        ))}
      </nav>

      <section className="stage-intro">
        <p className="eyebrow">{stages[stage - 1].label}</p>
        <h2>{stageCopy}</h2>
      </section>

      {stage === 1 && <MapStage selectedFile={selectedFile} onSelect={setSelectedFile} onNext={nextStage} />}
      {stage === 2 && <PlanStage plan={plan} setPlan={setPlan} showExample={showExample} setShowExample={setShowExample} onNext={nextStage} />}
      {stage === 3 && <ReviewStage reviewed={reviewed} setReviewed={setReviewed} onNext={nextStage} />}
      {stage === 4 && <ChangeStage />}
    </main>
  )
}

function MapStage({ selectedFile, onSelect, onNext }: { selectedFile: typeof repoFiles[number]; onSelect: (file: typeof repoFiles[number]) => void; onNext: () => void }) {
  return <section className="workspace map-layout">
    <article className="panel map-panel">
      <div className="panel-heading"><div><p className="eyebrow">Repository map</p><h3>Profile update path</h3></div><span className="count">5 connected files</span></div>
      <div className="map-canvas">
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M20 50 C31 50, 29 25, 42 25 M20 50 C31 50, 29 73, 42 73 M52 25 C62 25, 61 50, 72 50 M82 50 L89 50" /></svg>
        {repoFiles.map((file) => <button key={file.path} onClick={() => onSelect(file)} className={`file-node ${selectedFile.path === file.path ? 'selected' : ''}`} style={file.position}><FileCode2 size={16} /><span>{file.label}</span><small>{file.role}</small></button>)}
      </div>
      <div className="legend"><span><i className="dot component" /> UI</span><span><i className="dot contract" /> Contract</span><span><i className="dot server" /> Server</span><span><i className="dot data" /> Data</span></div>
    </article>
    <aside className="panel evidence-panel">
      <p className="eyebrow">Selected evidence</p><h3>{selectedFile.label}</h3><p className="path">{selectedFile.path}</p><p>{selectedFile.detail}</p>
      <div className="code-block"><span>imports</span><code>{selectedFile.path.includes('ProfileForm') ? "updateProfile from '../../api/profile'" : selectedFile.path.includes('profileSchema') ? "z from 'zod'" : 'profileUpdate contract'}</code></div>
      <button className="primary" onClick={onNext}>Use this map to plan <ArrowRight size={16} /></button>
    </aside>
  </section>
}

function PlanStage({ plan, setPlan, showExample, setShowExample, onNext }: { plan: string; setPlan: (value: string) => void; showExample: boolean; setShowExample: (value: boolean) => void; onNext: () => void }) {
  return <section className="workspace plan-layout">
    <article className="challenge-card"><div className="challenge-kicker"><Sparkles size={16} /> Grounded change request</div><h3>{challenge.title}</h3><p>{challenge.context}</p><div className="success-list"><strong>Done means:</strong>{challenge.success.map((item) => <span key={item}><Check size={15} />{item}</span>)}</div></article>
    <article className="panel plan-panel"><div className="panel-heading"><div><p className="eyebrow">Your approach</p><h3>What would you change first?</h3></div><button className="text-button" onClick={() => setShowExample(!showExample)}>{showExample ? 'Hide' : 'See'} a strong example</button></div>
      <textarea aria-label="Change plan" value={showExample ? modelPlan : plan} onChange={(event) => setPlan(event.target.value)} readOnly={showExample} />
      <div className="plan-footer"><span>{(showExample ? modelPlan : plan).trim().split(/\s+/).length} words</span><button className="primary" onClick={onNext}>Review my plan <ChevronRight size={16} /></button></div>
    </article>
  </section>
}

function ReviewStage({ reviewed, setReviewed, onNext }: { reviewed: boolean; setReviewed: (value: boolean) => void; onNext: () => void }) {
  return <section className="workspace review-layout">
    <article className="panel review-summary"><p className="eyebrow">Plan review</p><h3>{reviewed ? 'Your plan has a solid start.' : 'Ready to compare your plan?'}</h3><p>{reviewed ? 'You found the visible form and client request. The repository map shows three linked responsibilities still uncovered.' : 'Recode compares your proposed change against the repository map and task requirements.'}</p>
      {!reviewed && <button className="primary" onClick={() => setReviewed(true)}>Compare with codebase <GitBranch size={16} /></button>}
      {reviewed && <><div className="coverage"><span><Check size={16} /> Covered: {review.covered.join(' · ')}</span></div><button className="primary" onClick={onNext}>Prepare a patch <ArrowRight size={16} /></button></>}
    </article>
    {reviewed && <article className="panel misses"><div className="panel-heading"><div><p className="eyebrow">What the plan misses</p><h3>Three dependencies need attention</h3></div><span className="count warning">Needs review</span></div>{review.missed.map((item, index) => <div className="miss" key={item.title}><span>0{index + 1}</span><div><h4>{item.title}</h4><p>{item.text}</p><code>{item.file}</code></div></div>)}</article>}
  </section>
}

function ChangeStage() {
  return <section className="workspace change-layout"><article className="panel diff-panel"><div className="panel-heading"><div><p className="eyebrow">Small change</p><h3>Submit a patch for review</h3></div><span className="count">No code is executed</span></div><div className="diff"><span className="muted">// Paste a unified diff here</span><span className="add">+ emergencyContact: &#123; name, phone &#125;</span><span className="add">+ profileSchema.extend(...)</span><span className="add">+ updateProfile(payload)</span></div><button className="primary" onClick={() => alert('The live API will review this patch once the analysis service is connected.')}>Review patch <ArrowRight size={16} /></button></article><aside className="debrief"><Lightbulb size={20} /><h3>The point is not a perfect score.</h3><p>It is being able to explain what a change touches, what it risks, and why you chose it.</p></aside></section>
}
