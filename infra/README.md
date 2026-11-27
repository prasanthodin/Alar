# infra

Deployment and local-environment files.

| File | Purpose |
| --- | --- |
| `compose.yaml` | The whole system: PostgreSQL 17, Redis 8, Floci (AWS emulator), Caddy 2, `commerce` and `web`, plus the one-shot `bucket-init`. Local now, staging in Story 1.24 (AD-16). |
| `.env.template` | Every setting `compose.yaml` reads: image references (set a mirror here), ports, public addresses and the required secrets. Copy to `.env` (git-ignored). |
| `Caddyfile` | The entry point on `http://localhost:8080`: kernel routes to commerce, everything else to the website. |
| `init/create-buckets.mjs` | Creates the public, versioned `catalog` bucket on the emulator. |
| `certs/` | Optional extra CA certificates trusted while building images (git-ignored). |

```bash
cp infra/.env.template infra/.env   # fill in the secrets
docker compose -f infra/compose.yaml up -d --build
bash scripts/compose-smoke.sh       # checks the whole stack
```

How to start, stop, reset volumes and set an image mirror: `docs/local-environment.md`.
