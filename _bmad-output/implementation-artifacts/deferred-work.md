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
- source_spec: `_bmad-output/implementation-artifacts/spec-mobile-app-shell.md`
  summary: The Bag has no remove-line or change-quantity operation in the api-client contract or the screen.
  evidence: Only addToBag exists; the real Bag (FR-16) is built in Epic 3, which must add remove and set-quantity to the same api-client surface.
- source_spec: `_bmad-output/implementation-artifacts/spec-mobile-app-shell.md`
  summary: No automated test runs the mobile screens (hooks, providers, loading/error/empty states); the screenshot script is manual and CI has no mobile step.
  evidence: vitest covers pure modules only. Add a CI job that exports the web target and runs Playwright over the main flows, or React Native Testing Library, when Epic 6 starts.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-local-environment-compose.md`
  summary: Container images reinstall dependencies on every source change, copy the whole build tree (about 1.5 GB each) and need a `certs` build context; a plain `docker build` fails without it.
  evidence: `COPY . .` before install, no pnpm store cache, `COPY --from=certs` with no fallback stage. Fix with the image trimming and multi-arch build in Story 1.24.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-local-environment-compose.md`
  summary: Migrations and the publishable-key export run inside the commerce container on every start; staging with more than one replica would migrate concurrently.
  evidence: docker-entrypoint.sh runs db:migrate before start. Move to a one-shot migrate service in Story 1.24.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-local-environment-compose.md`
  summary: The compose smoke (container paths, Caddy routing, key handoff, S3 provider options) does not run in CI.
  evidence: Story 1.24 sets up staging deployment; run the smoke there or in a CI job with Docker.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-local-environment-compose.md`
  summary: The Redis spike subscriber and workflows ship in the production kernel.
  evidence: Inert, runs kept one hour. Remove or gate behind a flag once Story 1.24 proves the staging part of spike item 3.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-local-environment-compose.md`
  summary: Floci does not enforce bucket policies; every bucket is readable without credentials locally.
  evidence: Found during implementation. Story 1.9's private documents bucket must not rely on Floci for access control in tests; verify signed links against real S3 or a policy-enforcing emulator.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-kernel-route-allow-list.md`
  summary: No browser test of the kept admin screens; a Medusa upgrade that adds a dashboard read would 403 silently.
  evidence: The admin reads come from a one-off Playwright recording. Turn that recording into an admin e2e smoke when the admin stories (1.6, 1.7, 1.15) need the dashboard.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-kernel-route-allow-list.md`
  summary: CI never builds the commerce image, so an image missing the CommonJS build of @shop/contracts would ship with CI green.
  evidence: Every CI path builds contracts itself; only the manual compose smoke would catch it. Add an image build and start check in Story 1.24.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-dated-settings-and-tax.md`
  summary: A cart's tax lines computed before a dated rate change keep the old rate until something refreshes them; nothing re-checks the rate before the Order is created.
  evidence: The provider reads bands at the time it runs. Story 1.9 (begin checkout: snapshot and Hold) must recompute tax lines when the Checkout snapshot is taken, and confirm-payment must compare against that snapshot.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-dated-settings-and-tax.md`
  summary: The seed does not repair an India region or tax region that already existed with other settings (tax-exclusive prices, a non-saree default rate, another provider).
  evidence: Only databases built outside the repository have such rows; every in-repo path creates India fresh. Revisit if an existing database is ever imported.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-create-and-publish-design.md`
  summary: Uploaded photos that are removed in the editor, or left by a cancelled form, stay in the public catalog bucket; nothing records references or deletes orphans.
  evidence: Uploads are public on arrival. Add a reference check and an orphan cleanup job (kernel scheduled job starting a workflow) when the catalogue grows (Epic 2).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-create-and-publish-design.md`
  summary: A future-dated tax band can take effect and leave a published Design's price outside every band; nothing re-checks published Designs when a setting takes effect.
  evidence: publish-design and set-design-price check bands in effect now. Epic 2's tax-rate admin (FR-37) must refuse a band change that strands a published price, or re-check at the effective time.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-create-and-publish-design.md`
  summary: The admin Designs list has no pagination and its order (newest first) is untested.
  evidence: Fine for about 100 Designs at launch; add paging and an order test with the catalogue admin in Epic 2.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-design-page-and-bag.md`
  summary: Catalogue scoping to the publishable key's sales channels is untested; every test uses one channel.
  evidence: The shop runs one sales channel in Epic 1. Add a second-channel case when a second channel or key becomes possible.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-design-page-and-bag.md`
  summary: The store catalogue reads every Design, product and inventory level on each request, with no paging or shared cache.
  evidence: Fine for about 100 Designs; Epic 2's catalogue read (filters, search, counts) must add paging and caching.
