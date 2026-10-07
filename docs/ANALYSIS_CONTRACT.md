# Analysis contract

The browser imports the project and selects supported source files. The user explicitly approves sending selected snippets to Gemini. `POST /api/analyze` receives `{ action: 'lesson' | 'quiz', role: 'frontend', index, files: [{ path, content }] }`.

The server enforces role, file types, file sizes, section range and request size; selects numbered excerpts; calls Gemini's JSON output; checks required fields and citation paths/line ranges. It returns a `Lesson` or `{ questions: Question[] }`. A line reference means that source line was present in the model input. It is not a proof that the model's claim is true.

Chapters (0–7): stack, entry, components, navigation, state, data, styles, build/hosting. Quiz sections (0–4): stack/entry, UI/navigation, state/data, styles/accessibility, build/hosting. Each quiz response contains up to ten four-choice questions. The frontend grades the zero-based `correct` index and stores results in memory only. The learner can inspect the cited source after each answer.

Files are untrusted prompt content. The system prompt instructs the model to treat them as evidence, not instructions. This cannot guarantee immunity to prompt injection. Do not process confidential source. No user/project data is intentionally persisted by this app; the model provider processes submitted excerpts under its own terms.
