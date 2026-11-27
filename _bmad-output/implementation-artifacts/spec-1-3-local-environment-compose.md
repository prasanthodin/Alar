---
title: 'Story 1.3: Local environment from one compose file'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
baseline_commit: '0a35554bf56dbd2155fda1b7192d7a3f72bde66c'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The system runs only as hand-started processes against whatever PostgreSQL and Redis a machine has, so local and staging can differ and the spike's Redis 8 question is unproven.

**Approach:** Add `infra/compose.yaml` that starts PostgreSQL 17 (`commerce` database), Redis 8 (no eviction, persisted), Floci 2.5.0 with a public versioned `catalog` bucket, Caddy 2, `commerce` (kernel in shared mode, Redis modules, S3 file storage on Floci) and `web`, all healthy; add zod env checks, structured JSON request logs and health routes; prove event, workflow and lock on Redis 8 with a script.

## Boundaries & Constraints

**Always:** one compose file for local now and staging later (AD-16); images for commerce and web build from Dockerfiles in their app folders on `node:24-bookworm-slim`, multi-architecture-friendly (no arch-specific binaries); image references are compose variables with canonical defaults (`postgres:17`, `redis:8`, `floci/floci:2.5.0`, `caddy:2`) so a mirror can be set in `infra/.env`; Redis runs with `maxmemory-policy noeviction` and append-only persistence and is used by the kernel's event bus, workflow engine and locking modules only — never as a cache; commerce runs the kernel in shared worker mode; the file module uses the kernel's S3 provider against Floci (only an S3 client, no other vendor SDK); a missing or malformed required env var makes commerce or web exit non-zero naming the variable, never its value; log lines are JSON with a request id and contain no personal data, tokens or passwords; neutral names only (`commerce`, `catalog`, service names); secrets only in git-ignored env files, with `.env.template` files committed.

**Never:** a `documents`, `tiles` or `shopper-media` bucket or a `content` database (later stories); a cache module on Redis; silently substituting another Redis version — if a kernel component fails on Redis 8, stop and report which and with what error.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stack up | `docker compose -f infra/compose.yaml up -d --build` | all six services healthy; site through Caddy; sign-up and sign-in work as in Story 1.2 | failing service named by `docker compose ps` |
| Redis config | `redis-cli CONFIG GET maxmemory-policy` / `appendonly` | `noeviction` / `yes` | N/A |
| Spike | spike script in the commerce container | event emitted and received, workflow run, lock taken and released, each printed OK | stops and reports the failing component and error |
| Missing env | commerce or web started without a required var | exits non-zero, message names the var only | N/A |
| Malformed env | e.g. `DATABASE_URL=not-a-url` | exits non-zero naming the var | N/A |
| File storage | file uploaded through the kernel's file module | stored in `catalog`, fetchable at its public URL (200, same bytes) | N/A |
| Logs | any request to commerce | one JSON line with `requestId`, no email, token or password | N/A |
| Health | `GET /health` on commerce, `GET /api/health` on web | 200 | N/A |

</frozen-after-approval>

## Code Map

- `apps/commerce/medusa-config.ts` -- today only database, CORS and secrets. Add: `workerMode: "shared"`, `redisUrl`, modules `@medusajs/medusa/event-bus-redis`, `@medusajs/medusa/workflow-engine-redis`, `@medusajs/medusa/locking` with the Redis provider, `@medusajs/medusa/file` with `@medusajs/medusa/file-s3` (`endpoint`, `bucket`, `file_url`, `region`, `access_key_id`, `secret_access_key`, `additional_client_config: { forcePathStyle: true }`). Read each module's installed `AGENTS.md`/docs in node_modules for 2.23.1 option names.
- `apps/commerce/src/env.ts` (new) -- zod schema for every variable medusa-config reads; parse once at config load; on failure print `Missing or invalid environment variable: NAME` per bad key and `process.exit(1)`.
- `apps/commerce/src/api/middlewares.ts` (new) -- request-id middleware (reuse incoming `X-Request-Id` if it is a UUID, else generate; echo it in the response) and one JSON access-log line per request (method, path without query, status, duration, requestId).
- `apps/commerce/src/scripts/spike-redis.ts` (new) -- run with `medusa exec`: emit an event a subscriber records, run a one-step workflow, acquire and release a lock through the locking module; print OK per item or the component and error; exit non-zero on failure.
- `apps/web/check-env-variables.js` -- replace with a zod check (same exit behaviour); `apps/web/src/app/api/health/route.ts` (new).
- `apps/web/src/lib/session.ts` -- server-side calls use `COMMERCE_INTERNAL_URL` when set (container network), else `NEXT_PUBLIC_MEDUSA_BACKEND_URL`.
- `infra/compose.yaml`, `infra/.env.template`, `infra/Caddyfile`, `infra/init/create-buckets.mjs` (one-shot service using `@aws-sdk/client-s3` to create `catalog`, enable versioning, set a public-read policy) -- new.
- `apps/commerce/Dockerfile`, `apps/web/Dockerfile`, `.dockerignore` -- new; build from the repository root with pnpm (`--filter`), commerce runs migrations then `medusa start`; a seed step creates the publishable key the web needs (reuse the starter's initial seed migration and read the key into web at start, or document a one-time step).
- `docs/local-environment.md` (new); `infra/README.md` -- update.

## Tasks & Acceptance

**Execution:**
- [x] commerce config, env schema, middlewares, spike script, Dockerfile -- per Code Map
- [x] web env check, health route, internal URL, Dockerfile -- per Code Map
- [x] `infra/*` -- compose with healthchecks for all six services and the one-shot bucket init; Caddy serves the site on `http://localhost:8080` and proxies `/store`, `/auth`, `/admin`, `/health` to commerce
- [x] tests -- vitest for `apps/commerce/src/env.ts` (missing and malformed rows) and the web env check; a unit test that the access-log formatter drops query strings and never includes body fields
- [x] `scripts/compose-smoke.sh` (new) -- brings the stack up, waits for health, checks Redis config, runs the spike, uploads and fetches a file, runs the Story 1.2 e2e through Caddy, prints a summary; not run in CI yet
- [x] docs -- how to start, stop, reset volumes, and set an image mirror

**Acceptance Criteria:**
- Given Docker Compose v2, when `scripts/compose-smoke.sh` runs, then every matrix row passes and the script exits 0.
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build` run, then all pass.

## Implementation Notes

- Request id and access log live in `apps/commerce/src/lib/request-log.ts`, hooked from `apps/commerce/instrumentation.ts` (Node's `http.server.request.start` diagnostics channel), not in `src/api/middlewares.ts`. App middlewares run after the kernel's CORS, publishable-key and auth middlewares, so requests those answer (400 without a key, 401 on `/admin`) were never logged. The formatter is `src/lib/access-log.ts`. The kernel's own HTTP log is off with `LOG_LEVEL=info` (it records client IP and query strings). Health probes are logged too.
- `workerMode` reads `MEDUSA_WORKER_MODE` (zod default and compose value `shared`), because `medusa exec` sets `server` for its own process. Otherwise the spike script's process would also consume events.
- Spike event proof: a file subscriber (`src/subscribers/spike-redis-ping.ts`) runs a stored one-step workflow; the script polls the stored run. This works across processes.
- File provider runs with `acl: false`: Floci, like S3, rejects ACL headers on new buckets. `catalog` is public by bucket policy (public-access block relaxed for policies). Floci does not enforce bucket policies (anonymous GET works on any bucket), which matters for `documents` in Story 1.9.
- Publishable key: commerce runs `migrate` → `export-publishable-key` (writes a shared volume file) → `start`. The web entrypoint reads that file when `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is empty. The web server reads the kernel URL and key by dynamic `process.env[name]` lookup (`src/lib/server-env.ts`), so they are not inlined at `next build`. The Dockerfiles pass placeholder env values only to the build step.
- Image builds take an optional `certs` build context (`BUILD_CA_DIR`, default `infra/certs`, git-ignored) for TLS-intercepting proxies. This session copied the agent proxy CA there.
- `@aws-sdk/client-s3` is a direct commerce dependency (the bucket init runs with the commerce image). Web gained `zod` and `vitest`, commerce gained `vitest` (config is `vitest.config.mts`, because commerce is CommonJS), and `ansi-colors` was removed from web.
- CI (`.github/workflows/ci.yml`) now has a `redis:8` service plus `REDIS_URL` and `S3_*` env values, because the kernel requires them at start and build.
- `floci/floci:2.5.0` pulled fine, so there was no retag. This session used mirror images from `mirror.gcr.io` for postgres, caddy and node, set in `infra/.env`.
- Not proxied by Caddy: the admin UI at `/app` (the spec lists only `/store`, `/auth`, `/admin`, `/health`).

## Spec Change Log

## Review Triage Log

## Design Notes

Session facts: the Docker daemon runs in this container (`dockerd` started; `docker compose` v5.7.1). Docker Hub rate-limits anonymous pulls here, so set `infra/.env` image variables to `mirror.gcr.io/library/postgres:17`, `mirror.gcr.io/library/caddy:2`, `mirror.gcr.io/library/node:24-bookworm-slim` (already pulled), `redis:8` and `floci/floci:latest` are pulled (retag `floci/floci:latest` as `floci/floci:2.5.0` locally only if `docker pull floci/floci:2.5.0` is rate-limited, and say so). Host PostgreSQL 16 and Redis 7 are running on 5432/6379 — map container ports elsewhere (for example 55432, 56379) or keep them internal. Another agent is editing `apps/mobile`, `packages/contracts` and `packages/api-client`; do not touch those. Do not commit.

## Verification

**Commands:**
- `bash scripts/compose-smoke.sh` -- expected: exit 0, every row OK
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
