# Devpost submission draft

## Title
Recode 2026

## Tagline
Understand the code you ship.

## Track
AI + Education

## Short description
Recode turns a developer's own repository into source-backed learning and a project interview that probes what they actually understand.

## Inspiration
AI coding assistants help people build quickly, and teams divide work across many files. When a developer is asked how their project works, they may struggle to trace a feature, explain a technical choice or say which part they personally built. The learning gap is real even when the shipped code works.

## What it does
Paste a public GitHub repo or upload a ZIP. Recode reads supported source files, shows an interactive map of actual filenames and code excerpts, guides a frontend learner through the stack, entry point, interaction and release evidence, and asks five source-based questions with explanations. In interview practice, the learner picks a target role, adds job requirements and describes their contribution. Eight project-specific rounds ask about ownership, startup, data, failure, design and release. Each answer gets a follow-up. With consent, Gemini reviews the answer against numbered source excerpts and presses for a concrete file, failure case, tradeoff or verification step. A final review points to areas to study.

## How we built it
React, TypeScript and Vite power the interface. JSZip reads uploaded source archives. The GitHub API reads public repository trees and raw files in the browser. Local source scanning makes an immediate walkthrough, quiz and interview anchor questions. Vercel Functions call Gemini for optional deeper lessons and interview review. The server validates response shape and source citation path and line before displaying feedback. Imported code is never installed or executed.

## Challenges
A valid citation can point to an irrelevant line, and an AI-generated multiple-choice answer can be wrong even when the file exists. We kept the scored questions deterministic and treated Gemini feedback as practice that the learner can inspect. The first version's interview was only three fixed questions; we expanded it to eight rounds with follow-ups tied to the candidate's answer. GitHub API limits and Gemini latency also shaped the small-project scope and the immediate local path.

## What we learned
A learner needs to move between a claim and the code behind it. It is especially useful to ask what they personally contributed and challenge vague answers with a specific follow-up. Recode cannot establish authorship or guarantee interview readiness, so the product makes those limits visible.

## What's next
Improve source selection for larger and less conventional repositories, expand backend and AI/ML learning paths, let learners revisit weak topics across sessions, and evaluate feedback quality with real developer testers. Add account protection and rate limits before broad public use.

## Testing and limitations
The production GitHub importer loaded `SwiftDG/nexstore-ui` with 23 readable files; the guided example and deterministic learning path work without an AI key. The updated interview build passes local build, lint and server tests. Before final submission, confirm one live Gemini follow-up after deployment. The optional AI can be slow or wrong. Citation checks prove a line exists, not that a conclusion is correct. The tool does not verify the code runs, authorship, actual hiring readiness, or cheating. The React frontend path is the deepest; other roles have interview prompts with more limited source coverage. No sponsor credits were used.

## Links
Live: https://recode-lac.vercel.app/
Source: https://github.com/SwiftDG/Recode2026
Video: ADD THE PUBLIC VIDEO URL BEFORE SUBMITTING
