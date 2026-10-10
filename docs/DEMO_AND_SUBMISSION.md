# Recode 2026: final handoff

## Submission deadline

Saturday October 10, 2026 at **5:00 PM WAT**. Aim to have the source, live deployment and public video link ready before 3:00 PM WAT. The Devpost page requires a public video of 2–4 minutes, a GitHub repository and README, a written description, the AI + Education track, and screenshots, diagram or deployment link. A missing video or code makes the entry ineligible. The track cannot be changed after submission. Confirm Goodness is registered and added to the Devpost team. The participant packet link was not accessible from this environment; check its sponsor attribution details before final submission. No sponsor credits are claimed as used.

## Demo route for Goodness or backup recorder

Use the real public `SwiftDG/nexstore-ui` import, which loaded 23 readable files on the live site during testing. If its API import is rate limited, use the guided example and say that it is an example. Record the updated deployment after pushing this change, not the old three-question build.

| Time | What to show and say |
| --- | --- |
| 0:00–0:20 | “AI tools can help you ship a project. Then someone asks you to explain a feature you built. Recode is practice for that moment.” Show the actual question on screen, no staged employer testimonial. |
| 0:20–0:45 | Paste the Nexstore GitHub URL, load 23 readable files, move the source map and select a real file. Say Recode reads source but does not run or certify it. |
| 0:45–1:15 | Open the frontend learning path. Follow an entry or state explanation, expand the code citation, then answer one MCQ and show its evidence. |
| 1:15–2:20 | Enter Frontend developer and a few job requirements. State an honest contribution, or leave it blank if demonstrating a public repo you did not work on. Answer one project question vaguely and show Gemini asking for a specific file or decision. Answer the follow-up with source evidence. Show another round title to establish depth. |
| 2:20–2:55 | Explain the stack: React/TypeScript/Vite, local source scanning, GitHub/ZIP import, optional Gemini through server functions, validation of line references. State that line validation does not guarantee model correctness. |
| 2:55–3:20 | Close on the learner's next action: revisit a cited file and improve their explanation. Show the public URL and GitHub. |

If Gemini is unavailable, show the local follow-up and say AI review is temporarily unavailable. Never narrate a model result that was not visibly produced. Keep text legible on a phone. Export MP4, upload it publicly (YouTube unlisted/public or another accessible host), and open the link without signing in to verify.

## Backup cutoff

At 3:00 PM WAT, if Goodness has not delivered a publicly playable 2–4 minute video, use the backup screen recording with the route above. A simple real screen recording with clear voice and captions is better than missing the required video. Allow time for upload and Devpost review before 5:00 PM WAT.

## Final submission checklist

- [ ] Push source files, README and docs to `SwiftDG/Recode2026`; verify commit appears on GitHub.
- [ ] Verify the Vercel production deployment points to the new commit.
- [ ] Import `SwiftDG/nexstore-ui` and the guided example on production.
- [ ] Test one consented Gemini answer and a follow-up on production; show error honestly if unavailable.
- [ ] Confirm Goodness is registered on Devpost and added as teammate if he is included.
- [ ] Upload public 2–4 minute video and test its link in a signed-out browser.
- [ ] Choose **AI + Education** and paste the final written description from `docs/DEVPOST_SUBMISSION.md`.
- [ ] Add live URL and GitHub URL, plus screenshots if possible.
- [ ] Verify any participant packet attribution instructions, then submit before 5:00 PM WAT.
