# Local environment

The whole system runs from one compose file, `infra/compose.yaml` (Story 1.3). Staging will run the same file (Story 1.24).

| Service | Image | What it does |
| --- | --- | --- |
| `postgres` | `postgres:17` | Database `commerce`. Published on `127.0.0.1:55432`. |
| `redis` | `redis:8` | Event bus, workflow engine and locking for the kernel. Never a cache: `maxmemory-policy noeviction`, append-only persistence. Published on `127.0.0.1:56379`. |
| `floci` | `floci/floci:2.5.0` | Local AWS emulator. Holds the public, versioned `catalog` bucket. Browsers fetch public files through Caddy at `/catalog/...`; also published on `127.0.0.1:4566` for host tools. |
| `bucket-init` | the commerce image (`shop/commerce:local`, built by `commerce`) | One-shot: creates `catalog`, turns on versioning, sets a public-read policy (`infra/init/create-buckets.mjs`), then exits. |
| `commerce` | built from `apps/commerce/Dockerfile` | The kernel in shared worker mode (HTTP, subscribers and scheduled jobs in one process). On start it runs migrations, writes the publishable key for the website, then runs `medusa start`. |
| `web` | built from `apps/web/Dockerfile` | The website (`next start`). Calls commerce over the container network. |
| `caddy` | `caddy:2` | The entry point: `http://localhost:8080` (`CADDY_PORT`). `/store`, `/auth`, `/admin`, `/app` (admin UI), `/hooks/*` and `/health` go to commerce, `/catalog/*` to the emulator, everything else to the website. Stored files therefore live on the site's own origin (`S3_FILE_URL` defaults to `${PUBLIC_URL}/catalog`), reachable from other devices that can reach the site. |

## Start

Needs Docker with Compose v2.

```bash
cp infra/.env.template infra/.env
# Fill in the secrets: POSTGRES_PASSWORD (URL-safe characters only:
# A-Z a-z 0-9 . _ ~ -), JWT_SECRET, COOKIE_SECRET, S3_ACCESS_KEY_ID,
# S3_SECRET_ACCESS_KEY (openssl rand -hex 32 for each; any values work for the emulator keys).
docker compose -f infra/compose.yaml up -d --build
docker compose -f infra/compose.yaml ps        # every service "healthy", bucket-init "Exited (0)"
```

Then open `http://localhost:8080`. The first start builds both images and runs all migrations, which takes a few minutes. The starter's initial data seed runs once as a migration script and creates the publishable key; commerce writes it to a shared volume and the website reads it at start, so there is no manual step. The website reads the key only when it starts (its log says which source it used), so restart it when the key changes, for example after `down -v`: `docker compose -f infra/compose.yaml restart web`.

`scripts/compose-smoke.sh` does all of this and checks every row of the story's test matrix (see below).

## Stop and reset

```bash
docker compose -f infra/compose.yaml stop          # stop, keep containers and data
docker compose -f infra/compose.yaml down          # remove containers, keep data volumes
docker compose -f infra/compose.yaml down -v       # remove containers and all data (database, Redis, files)
```

After `down -v` the next `up` starts from an empty database and bucket and seeds again; a new publishable key is written, which `web` picks up as it is recreated too.

## Logs and checks

```bash
docker compose -f infra/compose.yaml logs -f commerce
docker compose -f infra/compose.yaml exec redis redis-cli CONFIG GET maxmemory-policy   # noeviction
docker compose -f infra/compose.yaml exec commerce medusa exec ./src/scripts/spike-redis.js
docker compose -f infra/compose.yaml exec commerce medusa exec ./src/scripts/check-file-storage.js keep   # prints FILE_URL, FILE_SHA256, FILE_ID
docker compose -f infra/compose.yaml exec commerce medusa exec ./src/scripts/check-file-storage.js delete <FILE_ID>
```

Commerce writes one JSON line per HTTP request (`requestId`, method, path without its query string, status, duration), container health probes included. The request id is an incoming `X-Request-Id` when it is a UUID, otherwise a new one, and is echoed in the response. Nothing else from the request is logged: no headers, body, query string, client address or user agent. The kernel's own HTTP log is switched off with `LOG_LEVEL=info`, because it records client addresses and query strings. `info` is the default in `apps/commerce/src/env.ts`, the commerce image and `apps/commerce/.env.template`, so `pnpm commerce:dev` on the host is covered too. A request the client abandons before any response is logged with status 499.

Both applications check their environment with zod when they start (`apps/commerce/src/env.ts`, `apps/web/check-env-variables.js`). A missing or malformed variable stops the process with `Missing or invalid environment variable: NAME`, never the value.

## Smoke test

```bash
bash scripts/compose-smoke.sh
```

It creates `infra/.env` with random secrets if there is none, starts the stack, waits for health, then checks: versions (PostgreSQL 17, Redis 8, Node.js 24), Redis configuration, the Redis spike (event, workflow, lock), a file uploaded through the kernel's file module and fetched from its public address, health routes and the admin UI through Caddy, a stored file fetched through Caddy, the request log, the missing and malformed environment checks for both applications, and the Story 1.2 end-to-end test through Caddy. It prints a summary and exits non-zero on any failure. `SMOKE_DOWN=1` stops the stack at the end; `SMOKE_SKIP_E2E=1` skips the browser test (reported as SKIP, not a failure). The script needs Linux with GNU tools (bash, GNU sed, `sha256sum`, `timeout`, `/proc`), plus curl, openssl and node; it is not written for macOS. The end-to-end step needs Node.js 24, pnpm and a Playwright browser on the host (`E2E_CHROME_PATH` for a local Chrome). It is not run in CI yet.

## Image mirror

Every image reference is a variable in `infra/.env`, with the canonical image as its default. When Docker Hub rate-limits anonymous pulls, point them at a mirror:

```bash
POSTGRES_IMAGE=mirror.gcr.io/library/postgres:17
CADDY_IMAGE=mirror.gcr.io/library/caddy:2
REDIS_IMAGE=mirror.gcr.io/library/redis:8
NODE_IMAGE=mirror.gcr.io/library/node:24-bookworm-slim   # base of the commerce and web images
FLOCI_IMAGE=floci/floci:2.5.0                            # keep the pinned release tag
```

## Building behind a TLS-intercepting proxy

If `pnpm install` fails inside the image build with a certificate error, put the proxy's CA certificate (`*.crt` or `*.pem`) in `infra/certs/` (git-ignored), or set `BUILD_CA_DIR` in `infra/.env` to a directory that holds it. The images trust it only while building; the runtime images do not contain it. Outside compose:

```bash
docker build -f apps/commerce/Dockerfile --build-context certs=infra/certs .
```

## Developing on the host against the stack

The kernel and the website still run on the host with `pnpm commerce:dev` and `pnpm web:dev` (`docs/starter.md`). Point `apps/commerce/.env` at the stack's services:

```bash
DATABASE_URL=postgres://commerce:<POSTGRES_PASSWORD>@localhost:55432/commerce
REDIS_URL=redis://localhost:56379
S3_ENDPOINT=http://localhost:4566
S3_FILE_URL=http://localhost:8080/catalog     # through Caddy, or http://localhost:4566/catalog without it
S3_ACCESS_KEY_ID=<as in infra/.env>
S3_SECRET_ACCESS_KEY=<as in infra/.env>
```

To run only the services, start them by name: `docker compose -f infra/compose.yaml up -d postgres redis floci bucket-init`.

## Notes

- The emulator serves objects from any bucket without credentials; it does not enforce the bucket policy. The policy is still set so the same set-up works on real object storage. Do not rely on the emulator to prove a bucket is private (relevant for `documents` in Story 1.9).
- The emulator, like S3, rejects ACL headers on new buckets, so the kernel's S3 provider runs with `acl: false`; `catalog` is public through its bucket policy.
- Container images use `node:24-bookworm-slim` and fetch no architecture-specific binaries in the Dockerfiles, so the same files build on ARM64 and x86-64. The multi-architecture build itself is Story 1.24.
- The images copy the whole build output and dependencies (about 1.5 GB each); trimming them is left for the staging story.
