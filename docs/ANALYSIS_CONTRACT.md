# Analysis contract

The browser imports the project and selects supported source files. The first four stops and five-question check are generated locally from file patterns and do not call Gemini. The user may separately opt in to optional AI explanations. The scored Gemini quiz is not exposed in the product because line-level citation validation does not verify its answer key. `POST /api/analyze` receives `{ action: 'lesson' | 'quiz', role: 'frontend', index, files: [{ path, content }] }` only after that opt-in.

The server enforces role, file types, file sizes, section range and request size; selects numbered excerpts; calls Gemini's JSON output; checks required fields and citation paths/line ranges. It returns a `Lesson` or `{ questions: Question[] }`. A line reference means that source line was present in the model input. It is not a proof that the model's claim is true.

Chapters (0–7): stack, entry, components, navigation, state, data, styles, build/hosting. The local check has five questions. The frontend grades the zero-based `correct` index and stores results in memory only. The learner can inspect the cited source after each answer. The server still has an experimental quiz branch, but it is not used by the interface or represented as a verified assessment.

The server selects at most 12 files and approximately 14 KB for a lesson or 24 KB for a quiz from the submitted files. It retries one transient 429 or 503 before returning a readable error. Client-side file-pattern lessons are fast but limited; they must not be presented as an exhaustive audit of the repository.

Files are untrusted prompt content. The system prompt instructs the model to treat them as evidence, not instructions. This cannot guarantee immunity to prompt injection. Do not process confidential source. No user/project data is intentionally persisted by this app; the model provider processes submitted excerpts under its own terms.

Interview practice has three local, source-backed prompts for the frontend role. It accepts typed answers and keeps them in memory for that session. If the learner separately opts in, `POST /api/interview` sends the current answer, role emphasis, question and selected numbered excerpts to Gemini. The response is an unscored coaching note with a checked file-and-line reference. If the request fails, the learner receives a local source reminder. Full-screen is optional and tab visibility only produces a refocus reminder; neither is a cheating detector.
