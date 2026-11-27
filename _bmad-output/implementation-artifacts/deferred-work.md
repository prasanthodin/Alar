# Deferred work

- source_spec: none
  summary: Story 1.2, shared contracts (packages/contracts) and the api-client seam (packages/api-client), with sign-up and sign-in on the website.
  evidence: Split from the 2026-11-27 build request (Stories 1.1 and 1.2 plus an early Expo app). Each is shippable on its own; 1.2 depends on the repository from 1.1, so 1.1 goes first.
- source_spec: none
  summary: Early Expo app shell (apps/mobile, per the repository shape) showing the approved Home, Listing and Product designs from mocked data through packages/api-client, with screenshots taken in the cloud.
  evidence: Founder asked on 2026-11-27 to see the mobile app running before a real phone is available. Not an Epic 1 story (the app is Epic 6, the Android proof is Story 1.28); it needs the contracts and api-client from 1.2, so it follows 1.2.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-repository-from-starter.md`
  summary: Root `dev` and `build` use `pnpm -r` instead of Turbo, and Turbo's `start` depends only on `^build`, while AGENTS.md says start builds first.
  evidence: Inherited from the starter's package.json and turbo.json; AGENTS.md (agent-context file) states the opposite. Fix when Story 1.3 or 1.24 settles the run and deploy commands, together with `globalEnv` for `NEXT_PUBLIC_*` keys if build moves to Turbo.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-repository-from-starter.md`
  summary: Turbo's `seed` task and the AGENTS.md task list still mention a seed command that no app defines.
  evidence: The starter's seed runs during `medusa db:migrate`; `commerce:seed` was dropped. Editing AGENTS.md is agent-context work; tidy with the next AGENTS.md update (bmad-project-context).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-repository-from-starter.md`
  summary: `pnpm-workspace.yaml` matches `apps/**`, so a nested package.json under an app (for example a Next standalone build) would become a workspace package.
  evidence: Inherited from the starter; harmless until standalone builds are produced (Story 1.24). Narrow to `apps/*` then.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-repository-from-starter.md`
  summary: CI checks the web build against `medusa develop` rather than a built kernel, has no dependency cache and no pull_request trigger.
  evidence: Works for a solo, push-to-main flow today. Revisit in Story 1.24 (deploy) where the production start command is defined.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-contracts-and-api-client.md`
  summary: The AD-2 import rule lives only in apps/web; apps/mobile and any other client must get the same rule (preferably in the root ESLint config), covering other `@medusajs/*` UI packages too.
  evidence: Rule is in apps/web/eslint.config.mjs only; the mobile app (next build run) would not inherit it.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-contracts-and-api-client.md`
  summary: AGENTS.md still calls apps/web the "Next.js storefront" and has a run-on sentence in its overview.
  evidence: Agent-context file; tidy with the next bmad-project-context update.
