---
title: 'Story 1.1: Create the repository from the starter and reshape it'
type: 'chore'
created: '2026-11-27'
status: 'in-review'
baseline_commit: 'e5fa923c4d3018497e366781f7a3fcb04fcb6a51'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no code yet. Every later story needs one agreed repository: the Medusa DTC starter, reshaped to the spine's layout, with pinned versions, neutral names and continuous integration.

**Approach:** Import the starter at a recorded commit into this repository, rename `apps/backend` to `apps/commerce` and `apps/storefront` to `apps/web`, rename packages to `@shop/*`, remove the product name from code, and add a CI workflow that runs install, lint, type-check, test, build and a name check.

## Boundaries & Constraints

**Always:** pnpm workspaces and Turborepo as the starter pins them; `@medusajs/*` at 2.23.1; TypeScript 6.0.x; Node.js 24 LTS (`engines` and `.nvmrc`); kebab-case files and directories; the forbidden name is read from CI configuration (a repository variable with a default in the workflow), never from source; the starter's data layer and checkout keep working (Stories 1.2 and 1.10 replace them).

**Never:** create any other `apps/*` or `packages/*` directory; put the product name in any package name, app id, bucket, database name or domain under `apps/` or `packages/`; commit `.env` files or secrets; keep the starter's Medusa-update workflow (it needs third-party secrets).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clean tree | `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` at root | All pass for `@shop/commerce` and `@shop/web` | CI fails on the first failing task |
| Name added | A file under `apps/` or `packages/` contains the forbidden name (case-insensitive) | Name check exits non-zero and prints each offending path | Content and settings data paths listed in the check's allow-list are skipped |
| Name absent | No offending file | Name check exits 0 | N/A |

</frozen-after-approval>

## Code Map

- Starter: `https://github.com/medusajs/dtc-starter` at commit `2e5004fbb3e053869566f093532aac65a6797fbc` (cloned to the session scratchpad as `dtc/`). Copy everything except `.git`, `.github/workflows/update.yaml`, `apps/storefront/tsconfig.tsbuildinfo`.
- `package.json` (root) -- name `@shop/root`; scripts `backend:*`/`storefront:*` become `commerce:*`/`web:*` with `--filter=@shop/commerce|web`; add `typecheck` (turbo); `engines.node` `>=24 <25`.
- `turbo.json` -- add `typecheck` task.
- `pnpm-workspace.yaml` -- `!apps/backend/.medusa/**` becomes `!apps/commerce/.medusa/**`; add `packages/*` glob (empty until 1.2).
- `apps/backend/package.json` -> `apps/commerce/package.json` -- name `@shop/commerce`; add `typecheck` (`tsc --noEmit`) and `test` (runs `test:unit`, passes with no tests).
- `apps/storefront/package.json` -> `apps/web/package.json` -- name `@shop/web`; add `typecheck`, `test`.
- `apps/web/src/modules/home/components/hero/index.tsx`, `apps/web/src/modules/layout/templates/footer/index.tsx` -- mention "dtc"; neutralise starter branding only where it names a product.
- `AGENTS.md`, `CLAUDE.md` (starter) -- update paths and names to `apps/commerce`, `apps/web`, `@shop/*`; keep the guidance.
- `.gitignore` -- merge with the existing root one; ignore `.env*` except `.env.template`.
- New `.nvmrc` (`24`), `infra/README.md`, `scripts/check-forbidden-name.mjs`, `.github/workflows/ci.yml`, `docs/starter.md`.
- Existing `docs/`, `_bmad*`, `.claude/` -- do not change.

## Tasks & Acceptance

**Execution:**
- [x] repository root -- copy the starter files listed in the Code Map and rename the two apps -- agreed layout
- [x] `package.json`, `turbo.json`, `pnpm-workspace.yaml`, both app `package.json` files -- rename to `@shop/*`, add `typecheck` and `test`, pin Node 24 -- one command set for CI
- [x] `scripts/check-forbidden-name.mjs` -- read `FORBIDDEN_NAME` from the environment (exit 2 if unset), scan tracked files under `apps/` and `packages/` case-insensitively, skip paths in an in-file allow-list for content and settings data, print offenders and exit 1 -- NFR-12 name check
- [x] `scripts/check-forbidden-name.test.mjs` -- node:test cases for the three matrix rows using a temporary directory -- prove the check
- [x] `.github/workflows/ci.yml` -- on every push: Node 24, pnpm via corepack, PostgreSQL service for commerce build, install, lint, typecheck, test, build, name check with `FORBIDDEN_NAME: ${{ vars.FORBIDDEN_NAME || 'alar' }}` -- CI gate
- [x] `apps/commerce`, `apps/web` -- fix any lint or type errors exposed under TypeScript 6 and Node 24 without changing behaviour -- green build
- [x] `docs/starter.md` -- record starter URL, commit, date and the reshaping done -- traceability
- [x] `infra/README.md` -- one paragraph: compose file arrives in Story 1.3 -- the directory exists

**Acceptance Criteria:**
- Given the reshaped repository on Node 24, when `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` run from the root, then all pass for `@shop/commerce` and `@shop/web`.
- Given a local PostgreSQL and Redis, when the kernel and storefront start with their documented dev commands, then the kernel answers `/health` and the storefront serves its home page.
- Given the manifests, when inspected, then every workspace package uses the `@shop/` scope and `@medusajs/medusa` is 2.23.1.

## Implementation Notes

- `node --test scripts/` does not run on Node 24 (a directory argument is treated as a module path and fails with MODULE_NOT_FOUND). The equivalent `node --test "scripts/*.test.mjs"` is used in the root `test` script and passes (5 tests).
- The lockfile is the starter's with only the `apps/backend` and `apps/storefront` importer keys renamed; `pnpm install --frozen-lockfile` passes. A plain `pnpm install` after the rename re-resolved several dependencies to newer minors and those newer versions raised extra lint errors, so the starter's resolution was kept.
- The name check also flags file paths that contain the name, skips binary files and scans tracked plus untracked-but-not-ignored files. The allow-list holds two future data paths (`apps/commerce/src/settings-data/`, `apps/content/content-data/`); later stories should adjust them to where settings and content data actually land. It matches substrings, so a word that contains the name also fails.
- CI uses a PostgreSQL 17 service, migrates (runs the starter's seed migration script), starts the kernel with `pnpm dev`, reads the seeded publishable key from the database, then runs `pnpm build`. Without a running kernel, `next build` fails prerendering `/sitemap.xml`.
- The starter's `commerce:seed` (formerly `backend:seed`) stays a no-op, as in the starter.

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Evidence | Route |
|---|---|---|---|---|
| 1 | Matcher misses camelCase/plurals and deviates from the matrix's case-insensitive "contains" | medium | Orchestrator's word-boundary edit after implementation narrowed the rule; `useZebrashopTheme` passed | patch: restore substring |
| 2 | ALARM-style upper-case words flagged by the word rule | false | Moot once substring rule is restored; substring flags them by design of the frozen matrix | rejected |
| 3 | No test for untracked, not-ignored files | medium | Every fixture is staged by `makeRepo`; dropping `--others` passes all tests | patch |
| 4 | No test for the binary skip | low | Removing `isBinary` passes all tests | patch |
| 5 | `makeRepo` ignores git exit status | low | Without git the walk fallback runs and the .gitignore test fails confusingly | patch |
| 6 | docs/starter.md contradicts itself on the matching rule | low | Stray bullet appended by the orchestrator | patch |
| 7 | Comments say the name is "never in source" though ci.yml has a default | low | Frozen intent allows a workflow default; only the wording is wrong | patch |
| 8 | Name check runs last in CI | low | Hidden behind slow kernel/build failures; one-step move | patch |
| 9 | cancel-in-progress cancels runs on main | low | Two quick pushes leave a main commit with no verdict; one-expression fix | patch |
| 10 | README still says Node v22.22+ | low | Contradicts engines `>=24 <25` introduced by this change | patch |
| 11 | Root build/dev bypass Turbo; `start` depends only on `^build`; AGENTS.md says otherwise | medium | Inherited from starter; fix edits AGENTS.md | defer |
| 12 | Turbo `seed` task left over | low | Starter task; AGENTS.md lists it | defer |
| 13 | `apps/**` workspace glob too broad | low | Starter config; no nested package today | defer |
| 14 | CI uses `medusa develop`, no cache, no PR trigger | low | Works for push-to-main; deploy story defines production start | defer |
| 15 | cart.ts casts hide types | low | Same safety as the starter's `any`; no behaviour change | rejected |
| 16 | U+0130 index drift, UTF-16 files, submodules, symlinked invocation, GIT_DIR in env, nonexistent root, read race | low | Unlikely in everyday use; each fix adds guards | rejected |
| 17 | Fallback walk scans ignored files silently | low | Only when git fails; CI runs inside git | rejected |
| 18 | Docs say Redis is required; CI runs without it | low | Medusa falls back to in-memory; Story 1.3 brings Redis | rejected |
| 19 | Kernel crash waits 180s in CI | low | Slow failure, still fails | rejected |

## Design Notes

The storefront's `next build` reads regions from the kernel. Locally and in CI the kernel is started (migrated and seeded with the starter's seed script) before building the web app, or the build is configured so a missing kernel does not fail it; prefer the former and document it in `docs/starter.md`. Local services in this container are PostgreSQL 16 and Redis 7 (no Docker daemon); production pins stay 17 and 8 and are proven in Story 1.3. In this session: Node 24 is at `/opt/node24/bin` (put it first on `PATH`; corepack provides pnpm), PostgreSQL runs at `postgres://postgres:postgres@localhost:5432` and Redis at `redis://localhost:6379`. Do not commit; the orchestrator reviews and commits.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
- `node --test scripts/` -- expected: all tests pass
