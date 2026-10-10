# Analysis contract

Recode accepts a public GitHub repo or ZIP with supported text files. Imports do not run code. Filename, extension, size and common secret path filters are applied before reading. These filters are best effort and are not a security guarantee.

The deterministic frontend reading path identifies stack, entry, state, style and build evidence from patterns. The five scored questions have locally determined answers tied to source. They do not measure overall competency. Other selected roles have interview anchors based on source matches and may lack relevant evidence.

The optional lesson endpoint sends up to 14 KB of numbered selected source snippets to Gemini. The optional interview endpoint sends selected snippets, role, user-supplied job requirements, contribution statement, current answer and previous answer when following up. The provider returns a verdict, reaction, follow-up, next study step and citation. The server validates field types and that the citation path and line exist in the supplied snippets. It does not establish the semantic truth of the assessment. Source and answers are untrusted prompt content. System instructions ask the model to treat them as evidence, not commands, but prompt injection resistance is not guaranteed.

The interview contains eight anchored rounds, each with a follow-up. AI review is explicitly optional. When disabled or unavailable, the app gives a local source-backed follow-up and labels the answer unassessed. The final count includes only reviewed answers. The practice does not detect cheating, verify authorship or certify hiring readiness.
