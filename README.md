# Recode 2026

**Read the project you built. Explain the part you worked on.**

ForgeHacks 2026 · AI + Education · built during the event by David Gilbert and Goodness.

Recode is for a developer who can ship quickly with AI tools or a team, but struggles to explain the actual code when a teammate, manager, interviewer or hackathon judge asks. They import a small React/Vite project, choose their real role, read eight source-linked frontend chapters, then answer up to 50 project-specific multiple-choice questions in five sections. Wrong answers point back to a file and line. The final review shows what to revisit; it does not claim that the learner wrote each file or certify competence.

## Demo flow

1. Import a public GitHub repository or a ZIP. The guided project is a small fixture for a quick walkthrough.
2. Choose **Frontend developer** and confirm permission to send selected source excerpts to Google Gemini.
3. Read the stack and entry point chapter. Open the cited file line and follow the code trace. Open another chapter to show the path is role-specific.
4. Start the understanding check. Choose an answer, inspect the explanation and file citation. The five sections generate up to ten questions each as the learner advances.
5. End on the review, showing misses and the source to read again.

## Why this is different

A code assistant can explain a selected file. Recode organizes a *whole small project* into a role-specific reading path, demands source references for explanations and questions, and lets the learner practice defending its details. The current build covers frontend work in React/Vite projects; it does not claim to teach every stack or every role.

## Architecture

- Vite + React + TypeScript browser app. `src/project.ts` imports a public GitHub repository through the GitHub API or extracts a local ZIP with JSZip. It filters supported source files and assembles chapter evidence.
- `api/analyze.js` is a Vercel Function. It calls `server/analysis.mjs`, which selects relevant numbered source excerpts and calls Gemini's generateContent JSON mode.
- Every returned citation must match a supplied file and line. The model's *semantic interpretation* cannot be mechanically guaranteed; users can expand each citation and inspect the code.
- Questions are generated in five batches to avoid a long initial wait. Each batch may contain fewer than ten if evidence is thin. All results are local to the browser session; no project database or authentication is included.

## Local setup (Termux or laptop)

Use Node 20+ and the repository's Vite 5 dependencies on Termux. The source bundle does not replace your package lock.

```bash
npm install
npm install jszip lucide-react
npm pkg set 'scripts.dev:api=node --env-file=.env.local server/dev.mjs' 'scripts.test=node --test server/*.test.mjs'
cp .env.example .env.local
```

Replace the placeholder in `.env.local` with a Gemini API key. Never commit this file or put the key in a `VITE_` variable.

In **two Termux sessions**, from the project directory:

```bash
npm run dev:api
```

```bash
npm run dev -- --host 0.0.0.0
```

Open the URL Vite prints. The Vite proxy sends `/api/analyze` to the local Node server on port 8787. `npm run build` checks the production frontend; `npm test` checks the analysis contract. If the key is absent, import still works but lesson generation gives a configuration error.

## Deploy

1. Push the source to the fresh public GitHub repository created during ForgeHacks. Keep `.env.local` out of Git.
2. Import the repo into Vercel. Framework preset **Vite**; build command `npm run build`; output `dist`. The root `api/analyze.js` deploys as a Node Vercel Function.
3. In Vercel project settings, add `GEMINI_API_KEY` as a server environment variable for Production and Preview. Optionally set `GEMINI_MODEL` (default `gemini-3.8-flash`). Redeploy after adding it.
4. Test a real repository import, chapter generation, quiz answer and review on the deployed URL before recording.

An unauthenticated public AI endpoint can be abused and incur API charges. Apply quota limits or an access gate before sharing the deployed URL widely. Keep the model account's spending cap low. This hackathon build has no user account, persistent session or rate limiter.

## Input and privacy boundaries

- Public GitHub URL `https://github.com/owner/repo` or ZIP at most 10 MB. Import supports at most 160 readable source files and 2 MB extracted text; files above 35 KB are skipped.
- Only selected excerpts (about 155 KB maximum per request, with a smaller model context) are sent for analysis after explicit user confirmation. This is sampling, not complete static analysis of every line.
- Dependencies, generated directories, common secret files and lockfiles are skipped. A secret can still be embedded in an ordinary source file. **Do not import confidential code or secrets.**
- The importer never runs, installs or builds imported code. There is no private GitHub OAuth access. GitHub's unauthenticated API limit may require ZIP fallback.
- A citation validator checks file paths and line numbers, not the factual correctness of the explanation or answer. Read the cited code. Deployment providers are only stated when source evidence exists.

## Team and submission

- David Gilbert: product, frontend, AI integration, deployment, testing, README and submission.
- Goodness: demo video editing and presentation.

Submit under **AI + Education** with the public repository, live demo, concise description, screenshots and a short video showing the real import → learning → question → source evidence → review flow. Follow the ForgeHacks participant packet for exact submission fields and sponsor attribution.

## Current limits

Frontend role only; small React/Vite JS/TS projects. There is no claim of authorship, AI-use detection, correctness verification or verified learning outcomes. No code execution or in-browser editor. Fifty questions is a ceiling, not a fabricated minimum. An AI response with malformed or unsupported citations is rejected with a retry path.
