# Recode 2026

**Understand the code you ship.**

[Live app](https://recode-lac.vercel.app/) · [Source repository](https://github.com/SwiftDG/Recode2026)

Recode is for a developer who used AI tools or teammates to ship a project and wants to explain the part they worked on. Import a small public GitHub repository or ZIP, select the frontend path, follow four short source-backed stops, and answer five multiple-choice questions. Every answer points back to a file. An interview practice mode asks three open questions about the imported frontend project and lets the developer answer in their own words. Longer Gemini explanations and interview coaching notes are optional and must be checked against the cited source.

Built during ForgeHacks 2026 by David Gilbert and Goodness for AI + Education. It is practice, not a certificate, authorship detector, security scanner or proof that code runs as described.

## Try it

1. Open the live site and choose **Try the guided project**. No account or API call is needed for the first walkthrough.
2. Choose the frontend path and tap **Show me my project**. Follow the stack, entry, interaction, and style/build stops. Expand a source citation.
3. Take the five-question check and review a miss. Continue into eight frontend reading areas. Use a public GitHub URL or ZIP to repeat with your own small React project.
4. To try Gemini, opt in to sending selected excerpts. On a stop or full reading area, ask for more detail. If the provider is unavailable, the local path continues.
5. From the frontend role screen or practice result, open **Practice an interview**. Enter the frontend role you are preparing for and optional role emphasis. Answer three project questions in a chat-like view. You can request full-screen focus. Tab switches are counted as interruptions, not treated as proof of cheating. Gemini coaching requires a separate opt-in because it sends both the typed answer and selected source excerpts to Google.

## What runs where

- React, TypeScript and Vite render the browser interface. JSZip extracts ZIPs; the GitHub REST API and raw file URLs read public repositories. Imported code is not run or installed.
- `src/project.ts` filters readable files and finds topic evidence. `src/learning.ts` builds the immediate walkthrough and five-question practice set from file patterns. These rules are deliberately limited and can miss code structures. They do not infer authorship or hosting from a dependency.
- `api/analyze.js` calls `server/analysis.mjs` in a Vercel Function for optional Gemini output. The server sends selected numbered excerpts, checks response shape and citation paths/lines, and retries a transient 429 or 503 once. A valid citation does not prove the interpretation is right.
- `api/interview.js` calls `server/interview.mjs` for optional, unscored feedback on a typed answer. The initial three questions and fallback source reminders work without Gemini. Source references validate file and line presence, not whether a model's interpretation is correct.
- Progress stays in the browser session. There is no user account or project database.

## Run locally

Use Node 20+.

```bash
npm ci
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local only if testing the optional AI path.
npm run dev:api
```

In another terminal:

```bash
npm run dev -- --host 0.0.0.0
```

The four-stop walkthrough and five-question check work without a key or API server. For production, add `GEMINI_API_KEY` to Vercel server environment variables; `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`, with a fallback to `gemini-3.1-flash-lite` on temporary overload when no model is pinned. Do not use a `VITE_` prefix for the key. Redeploy after changing environment variables. `npm run build`, `npm run lint` and `npm test` are the local checks.

## Input and privacy limits

Public GitHub URL or ZIP up to 10 MB, at most 160 supported source files and 2 MB extracted text. Files above 35 KB, lockfiles, dependencies, common secret files and build output are skipped. A secret can still appear inside ordinary code. **Do not import confidential code or secrets.** AI requests send excerpts only after an explicit opt-in. GitHub's unauthenticated API may rate limit imports; ZIP is the alternative.

The public AI endpoints have no account or rate limiter and may incur API charges. Set provider quota/spend limits and protect them before broader release. Sparse or unusual repositories can lead to generic or incomplete local observations. Gemini may be slow or unavailable; its content can be wrong even with a valid file reference. The interview is practice, not hiring assessment or cheating detection. It does not use a camera. Full-screen can be declined by the browser and switching tabs is only a reminder to refocus.

## Scope and team

Frontend path for small React/Vite JS/TS projects. No backend or AI/ML learning paths yet. The five scored questions test the learner's ability to locate evidence and explain cautious claims. Eight optional reading areas cover stack, entry, components, navigation, state, requests, styles and build evidence. Generated questions are excluded from the user flow because a valid source line alone cannot verify an answer key.

- David Gilbert: product, frontend, AI integration, deployment, testing, README and submission.
- Goodness: demo video and presentation.

See `docs/DEMO_AND_SUBMISSION.md` for the video flow and final submission checks. Use the participant packet as the source of truth for the exact ForgeHacks fields and sponsor attribution.
