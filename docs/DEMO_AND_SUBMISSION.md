# Recode 2026: demo and submission handoff

## The story

A developer shipped a working app with AI tools or teammates. Someone asks what starts it, what changes when a user interacts, and what stack it uses. Recode turns that developer's small project into a four-stop source-backed walkthrough and a quick five-question check. It gives them words they can verify, not a claim that they authored every file.

## Record this actual flow

| Time | Screen | What to show |
| --- | --- | --- |
| 0–12 s | Person asks how the app works | State the uncomfortable moment without mocking AI-assisted builders. |
| 12–25 s | Import the public Recode repo or use the guided project | Show real files, no fake statistics. |
| 25–55 s | Frontend path and two of four stops | Expand one source citation. Point to the exact line. |
| 55–80 s | Five-question check | Give one wrong answer, read the explanation, expand its file reference. |
| 80–95 s | Review | Show the score and next file to inspect. Say it is practice, not certification. |
| 95–120 s | Interview practice | Open the interview room, answer one question about the imported project, and show the source-linked note. Include Gemini feedback only if the production response works and supports its claim. |

Record the first rough cut early. Verify the mobile export, readable captions, balanced audio, live URL and actual source references. Goodness owns the final video and presentation; David supplies the working route and checks the spoken technical claims. No Vouch footage, fabricated testimonial or invented accuracy.

## Devpost copy, to verify against the final build

**Title:** Recode 2026

**Tagline:** Understand the code you ship.

**Problem:** People can ship with AI coding tools or a team but still struggle to explain their own project's stack, entry point and interaction in a review, interview or hackathon demo.

**What it does:** Recode accepts a small public GitHub repo or ZIP and guides frontend developers through four source-backed stops. A five-question check returns immediate feedback and a cited file. Interview practice asks three open questions about the imported frontend project. Optional Gemini requests add source-linked explanations and unscored interview coaching. The learner can continue through the core path even if Gemini is unavailable.

**How we built it:** React, TypeScript, Vite, JSZip, GitHub REST API, Vercel Functions and Gemini for optional explanations and interview coaching. Local source scanning provides the fast first path. Server validation checks AI citations against numbered excerpts.

**Limits:** Frontend React/Vite scope. A citation validates location, not semantic correctness. The app does not prove authorship, deployment success or learning outcomes. It does not run imported code. Full-screen is a focus option, and tab-switch reminders do not detect cheating. No camera is used. AI endpoints need rate limits before broad release.

Before submitting: add the actual live URL, repository URL, video URL, screenshots, required track and sponsor credit according to the participant packet. Confirm Goodness is registered and attached to the Devpost team. The track choice is final when submitted.

## Final check

- The public repository contains event-window commits and an accurate README.
- The deployed guided path reaches review without Gemini. A real public repo import also works.
- Optional Gemini depth is tested or honestly excluded from the video.
- No API key or `.env.local` is committed. Quota and spending controls are set.
- Goodness's video link opens without login and plays with legible text on a phone.
- Submit before Saturday, October 10, 12:00 PM ET / 5:00 PM WAT, subject to the packet's source-of-truth requirements.
