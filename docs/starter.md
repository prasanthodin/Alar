# Starter

This repository was created from the Medusa DTC starter (Story 1.1).

| | |
| --- | --- |
| Starter | https://github.com/medusajs/dtc-starter |
| Commit | `2e5004fbb3e053869566f093532aac65a6797fbc` (`main`, committed 2026-11-27) |
| Imported | 2026-11-27 |
| Kernel | `@medusajs/medusa` 2.23.1 |
| Storefront | Next.js 16.3.8, React 19.0.5 |
| Toolchain | pnpm 10.11.1 (via corepack), Turborepo 2, TypeScript 6.0.x, Node.js 24 LTS (`.nvmrc`, `engines`) |

## What was copied

Everything in the starter commit except `.git`, `.github/workflows/update.yaml` (the starter's Medusa-update workflow needs third-party secrets) and `apps/storefront/tsconfig.tsbuildinfo` (build output). The lockfile is the starter's, with only the two importer paths renamed, so dependency versions are exactly the starter's.

## Reshaping done

- `apps/backend` became `apps/commerce` (`@shop/commerce`); `apps/storefront` became `apps/web` (`@shop/web`). The root package is `@shop/root`.
- Root scripts `backend:*` and `storefront:*` became `commerce:*` and `web:*`. The starter's `backend:seed` was dropped: the kernel has no `seed` script, because the starter's initial data seed runs as a migration script during `medusa db:migrate`.
- Added a `typecheck` task (`tsc --noEmit` in each app, `turbo typecheck` at the root) and a `test` script in each app. Commerce runs `test:unit` with `--passWithNoTests`; web has no tests yet. The root `test` also runs `node --test "scripts/*.test.mjs"`.
- `engines.node` is `>=24 <25` in the root and both apps.
- `pnpm-workspace.yaml` excludes `apps/commerce/.medusa/**` and includes `packages/*` (empty until Story 1.2).
- `.gitignore` ignores every `.env*` file except `.env.template`, `*.tsbuildinfo` and `.medusa/`.
- The kernel's `.env.template` names the database `commerce`.
- Starter branding that named a product was neutralised in the storefront hero and footer (the starter's "Ecommerce Starter Template" heading, "Medusa Store" name and links to the starter repository). Other "Medusa Store" placeholder copy remains in pages that Story 1.2 removes or rewrites.
- Fixes needed for lint and type-check, without changing behaviour: removed three unused, empty gift-card and discount stubs from `apps/web/src/lib/data/cart.ts` and replaced its `any` casts; removed two unneeded `@ts-ignore` comments in the language selector; typed four callback parameters in `apps/commerce/src/scripts/seed-demo-products.ts` so it type-checks before the kernel has generated `.medusa/types`.
- `AGENTS.md` and `CLAUDE.md` were updated for the new paths, names and commands.
- Added `.nvmrc`, `infra/`, `scripts/check-forbidden-name.mjs` (with tests) and `.github/workflows/ci.yml`.

## Name check

`scripts/check-forbidden-name.mjs` fails when the product name appears, case-insensitively, in the path or text of any tracked or untracked-but-not-ignored file under `apps/` or `packages/`. Content and settings data directories on its in-file `ALLOW_LIST` are skipped. The name is read from `FORBIDDEN_NAME`; CI sets it from the repository variable `FORBIDDEN_NAME`, with a default in the workflow. It matches substrings, so an ordinary word that contains the name also fails the check.

```bash
FORBIDDEN_NAME=<name> node scripts/check-forbidden-name.mjs
```

## Running locally

Needs Node.js 24 (`corepack enable` provides pnpm), PostgreSQL and Redis.

```bash
pnpm install

# Kernel
cp apps/commerce/.env.template apps/commerce/.env
# set DATABASE_URL, e.g. postgres://postgres:postgres@localhost:5432/commerce
createdb commerce
cd apps/commerce && pnpm exec medusa db:migrate   # migrations plus the starter's initial data seed
cd ../.. && pnpm commerce:dev                      # http://localhost:9000, /health answers OK

# Storefront
cp apps/web/.env.template apps/web/.env.local
# set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY to the seeded key:
#   psql "$DATABASE_URL" -Atc "select token from api_key where type = 'publishable'"
pnpm web:dev                                       # http://localhost:8000
```

## Building the storefront

`next build` in `apps/web` prerenders pages (for example `/sitemap.xml`) that read regions and products from the kernel with the publishable key. The kernel must therefore be migrated, seeded and running before `pnpm build`, and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` must hold the seeded key. CI does exactly this: it migrates the database (which runs the seed), starts the kernel with `pnpm dev`, waits for `/health`, reads the publishable key from the database, then runs `pnpm build` at the root.
