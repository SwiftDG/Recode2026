# Recode 2026

**Understand the code you ship.**

[Try Recode](https://recode-lac.vercel.app/) · [Source](https://github.com/SwiftDG/Recode2026)

Recode helps a developer who built with an AI coding assistant or a team learn to explain the project they shipped. Paste a public GitHub repository or upload a source ZIP. Recode reads selected files, shows an interactive map of actual filenames, teaches a short frontend path with file and line references, asks five source-based multiple-choice questions, and conducts a longer project interview. The learner selects a target role, pastes job requirements and states their own contribution. The interview contains eight rounds with a follow-up after every answer. Optional Gemini reviews the answer against selected source lines and asks a more specific follow-up.

Built during ForgeHacks 2026 for **AI + Education**. The prompt asks for AI that helps learners move beyond memorization to understand concepts, make connections and apply what they learn. Recode applies that to code a learner has already shipped. It is practice, not proof of authorship, hiring readiness or code correctness.

## Try it in two minutes

1. Open the live app and import `https://github.com/SwiftDG/nexstore-ui` or tap **Try the guided project**.
2. On the project screen, move or drag the source map and select a file. The preview comes from the imported source.
3. Follow the frontend walkthrough and expand a citation. Take the five-question check and inspect a missed answer.
4. Return to the project and open **Practice an interview**. Choose Frontend developer, state your contribution, optionally paste job requirements, then answer a question. Gemini review requires its own opt-in. A concrete answer gets a deeper follow-up; a vague answer should be challenged for specifics. If the AI is unavailable, the app clearly says the answer was not assessed and asks a source-backed fallback follow-up.

## How it works

- `src/project.ts` imports supported text files from a public GitHub repo or ZIP without executing the code. Common dependencies, build output, lockfiles and secret filenames are excluded. It limits input to a 10 MB ZIP or GitHub repo, 160 supported files, 35 KB per file, and 2 MB extracted text.
- `src/learning.ts` and `src/interviewPlan.ts` create an immediate, deterministic frontend reading path, five-question check, and eight interview anchors from the imported source. A source scan provides clues, not a full semantic understanding of the repository.
- `src/SourceOrbit.tsx` displays selectable imported files and a source excerpt. Its movement responds to pointer input and respects reduced motion.
- `api/analyze.js` and `api/interview.js` call server modules through Vercel Functions. With consent, the server sends selected numbered excerpts and interview answers to Google Gemini. It checks response shape and that cited paths and lines exist. A valid citation does not prove that the model's interpretation is correct. The interview labels answers supported, partial or unsupported as a *practice aid*, not a hiring score.
- The target role selector includes frontend, full-stack, backend and AI/ML. Frontend React/TypeScript projects have the most complete deterministic reading path. Other roles use interview prompts and supported files, including Python and SQL, but coverage is less mature and missing evidence must be acknowledged.
- No account or database is used. Progress is kept in the browser session. Full-screen is optional; tab switching only triggers a refocus reminder. There is no camera or cheating detection.

## Local setup

Node 20+ is required.

```bash
npm ci
cp .env.example .env.local
# Add GEMINI_API_KEY only if you will test the optional AI path.
npm run dev:api
```

In another terminal:

```bash
npm run dev -- --host 0.0.0.0
```

Set `GEMINI_API_KEY` in Vercel's server environment and redeploy for Gemini. `GEMINI_MODEL` is optional. Never put the key in a `VITE_` variable or commit `.env.local`. Use `npm run build`, `npm test`, and `npm run lint` to verify locally.

## Privacy and limits

Do not import private or confidential code unless you have permission to send the excerpts and answers to Gemini. The source scan and deterministic questions work without opting in. GitHub's unauthenticated API may rate limit imports; a ZIP is the alternative. Files are not installed or run. Secret scanning catches some patterns but cannot guarantee that ordinary files contain no secrets. The public AI endpoints need authentication or rate limits before wide release, and provider spend limits should be set. Interviews can be slow when Gemini is busy. The learning path does not guarantee full project understanding. It offers repeatable questions, evidence and gaps for the learner to investigate.

## Team and event

- David Gilbert: product direction, frontend, integration, testing, deployment and written submission.
- Goodness: demo video and presentation. Credit only work actually delivered in the final submission.

No sponsor credits were needed for this build. See [`docs/DEMO_AND_SUBMISSION.md`](docs/DEMO_AND_SUBMISSION.md) for the final video route and Devpost fields. The public repository was created and developed during the ForgeHacks window.
