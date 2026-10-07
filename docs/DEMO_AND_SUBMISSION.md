# Recode demo and submission handoff

## One sentence

Recode turns a developer's own small project into a role-specific code reading path and a source-linked understanding check, so they can explain the frontend they shipped with AI tools or teammates.

## Demo project

Use this freshly built Recode repository once the full update is pushed. It is a real project made within ForgeHacks. Do not use Vouch or imply the project proves who authored each file. Keep the guided example as a fallback for import speed, but the hero demo should analyze the actual public repository.

Before recording: open the production URL; import the public GitHub URL; accept source sharing; preload the first two lessons; run a quiz question; verify each cited line really supports the spoken claim. If a response is weak, choose another real question rather than edit the generated words into a false claim.

## Goodness: video deliverables

Goodness owns the presentation cut, not the AI service. Aim for a clear 90–120 second MP4, a legible thumbnail still, and an upload URL suitable for the Devpost submission. Record the actual working browser flow at readable zoom, add captions, balance audio, and verify the final exported video plays on a phone and laptop. No fake dashboard, generated people, invented user quote, or fabricated score.

| Time | Screen | Narration point |
| --- | --- | --- |
| 0–10 s | Real code and an interview-style question | AI can help ship quickly; explaining the app remains the developer's job. |
| 10–25 s | Import this public ForgeHacks repo | Recode reads the source without running it. |
| 25–40 s | Choose Frontend and approve sharing | The role is self-declared; Recode does not claim authorship. |
| 40–70 s | Entry point chapter, open a citation at the line | Explanation is tied to a source file. Follow main → App or another verified flow. |
| 70–95 s | Answer one MCQ, include a wrong answer and open its citation | The answer gives a reason and evidence, not a bare score. |
| 95–115 s | Review screen and next action | Return to missed code; frontend React/Vite scope and AI limitations. |

David supplies a deployed URL, final repository URL, and a tested route through the demo. Goodness should record after David verifies the live model response. If recording early, make a rough cut from the current local flow, then replace clips after deployment. The final MP4 and thumbnail are Goodness's handoff to David; David submits on Devpost.

## Devpost copy draft

**Title:** Recode 2026

**Tagline:** Understand the frontend of the project you shipped.

**Problem:** Developers can use AI coding tools and collaborate to ship a working app yet struggle to explain its architecture, stack or code path in an interview, team review or hackathon demo. Generic framework lessons and a one-off code explanation do not teach the specific project in front of them.

**What it does:** Recode imports a small public GitHub repository or ZIP, asks for the learner's real role, and creates a frontend reading path through the stack, entry point, components, navigation, state, requests, styling and build evidence. It gives source-linked explanations and up to 50 role-specific MCQs in five sections. After each answer, the learner can inspect the cited code. The final review points to missed areas.

**How we built it:** React, TypeScript, Vite, JSZip, GitHub REST API, a Vercel Node Function and Gemini JSON output. The server selects numbered excerpts, treats repository text as untrusted input, and validates returned citation paths and line numbers. The browser imports source without executing it.

**Challenges and limits:** Generating meaningful questions from a sparse or unusual repo is hard. Recode returns fewer than 50 rather than padding with trivia. A valid source citation does not guarantee the model's interpretation; users must inspect the evidence. This version focuses on frontend React/Vite projects and does not verify who wrote code or certify mastery.

**Next:** Better repository coverage, other roles, question quality review, progress persistence and protection against public endpoint abuse.

Before submission, insert the actual live URL, repository URL, video URL, real screenshots, exact event sponsor attribution (if a sponsor service is used), and the required Devpost fields from the participant packet. Confirm both teammates are registered and on the same Devpost team. Choose AI + Education at submission because track choice is final.

## Final check

- Public repo contains commits made within the ForgeHacks window; README and deployment instructions are accurate.
- Both teammates registered and attached to the Devpost team.
- Production import, first lesson, citation, quiz and review actually work.
- No key or `.env.local` committed. API quota/spend cap set before wide sharing.
- Video is uploaded, linked, audible and legible. Demo and source links open without login.
- Submit before Saturday, October 10, 12:00 PM ET / 5:00 PM WAT. Verify exact packet requirements and sponsor attribution in the submission form.
