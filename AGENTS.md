# AGENTS.md

## Overview

A pnpm + Turborepo workspace monorepo created from the Medusa DTC starter (see `docs/starter.md`). It contains the commerce kernel `apps/commerce` (`@shop/commerce`, `@medusajs/medusa` 2.23.1, Node 24 LTS, TypeScript 6.0.x, PostgreSQL 15+) the Next.js website `apps/web` (`@shop/web`) and the shared packages `packages/contracts` (zod schemas and inferred types), `packages/api-client` (the only code that talks to the kernel) and `packages/tokens` (DESIGN.md tokens). All workspace packages use the `@shop/*` scope; other `apps/*` and `packages/*` directories are created by the story that first needs them.

## Before You Start

1. **Detect the package manager** (see [Package Manager](#package-manager)). Never assume pnpm.
2. **Commerce, web, contracts, api-client and tokens exist**; do not add other `apps/*` or `packages/*` directories unless your story creates them.
3. **Load the matching Medusa skill** if available (see [Medusa Skills & MCP Server](#medusa-skills--mcp-server)).
4. **Read the `AGENTS.md` of the `@medusajs/*` package you're about to use** (see [Medusa Package Docs](#medusa-package-docs-node_modules)). It describes the installed version, which beats memory.

## Where to Look

| Task | Location | Read first |
| --- | --- | --- |
| Store/admin API route | `apps/commerce/src/api/{store,admin}/<path>/route.ts` | `@medusajs/framework` (`/http`), `@medusajs/medusa` |
| Middleware, auth, body validation | `apps/commerce/src/api/middlewares.ts` | `@medusajs/framework` (`/http`) |
| Call a built-in kernel route | add it to `packages/contracts/src/kernel-routes.ts` in the story that first calls it; others get 403 `route.not_allowed` | `docs/kernel-routes.md` |
| Business logic | `apps/commerce/src/workflows/` | `@medusajs/framework` (`/workflows-sdk`), `@medusajs/core-flows` |
| Reuse a built-in flow (create cart, product, order...) | import from `@medusajs/medusa/core-flows` | `@medusajs/core-flows` |
| Custom data model + service | `apps/commerce/src/modules/<name>/` | `@medusajs/framework` (`/utils`) |
| Extend a commerce module (product, cart, order...) | `apps/commerce/src/links/` | `@medusajs/<module>` (e.g. `@medusajs/product`) |
| Events / cron | `apps/commerce/src/subscribers/`, `apps/commerce/src/jobs/` | `@medusajs/framework` |
| Product search index | `apps/commerce/src/search/` | `@medusajs/framework` (`/types` `SearchTypes`) |
| One-off scripts | `apps/commerce/src/scripts/` (run with `medusa exec`) | `@medusajs/cli` |
| Admin widgets / pages | `apps/commerce/src/admin/` | `@medusajs/admin-sdk`, `@medusajs/ui`, `@medusajs/icons` |
| Module/plugin config | `apps/commerce/medusa-config.ts` | `@medusajs/framework` |
| Tests | `apps/commerce/integration-tests/`, `src/**/__tests__/` | `@medusajs/test-utils` |
| Cross-unit shapes (view models, error codes) | `packages/contracts/src/` | zod 4.6.7 |
| Kernel calls from any client | `packages/api-client/src/` (UI never imports `@medusajs/js-sdk` or `@medusajs/types`; lint fails) | `@medusajs/js-sdk` |
| Website UI | routes in `apps/web/src/app/`, server actions in `src/app/actions.ts`, text in `apps/web/messages/en.json` | `packages/tokens`, DESIGN.md |
| Lint failure | the flagged file | `@medusajs/eslint-plugin` |

## Directory Structure

```text
.
├── apps/
│   ├── commerce/                 # Medusa application (@shop/commerce)
│   │   ├── medusa-config.ts      # Medusa config: DB URL, CORS, secrets, modules
│   │   ├── integration-tests/    # setup.js (Jest setupFiles) and http/*.spec.ts suites
│   │   └── src/
│   │       ├── admin/            # Admin dashboard extensions (widgets/, routes/, i18n/)
│   │       ├── api/              # API routes: api/store/*, api/admin/* (file-based) + middlewares.ts
│   │       ├── jobs/             # Scheduled jobs
│   │       ├── links/            # Module links between modules
│   │       ├── migration-scripts/# Data migrations run by db:migrate (e.g. initial-data-seed.ts)
│   │       ├── modules/          # Custom modules (service + models + migrations)
│   │       ├── scripts/          # medusa exec scripts (e.g. seed-demo-products.ts)
│   │       ├── search/           # Product search index definition
│   │       ├── subscribers/      # Event subscribers
│   │       └── workflows/        # Workflows and workflow steps
│   └── web/                      # Next.js storefront (@shop/web)
│       └── src/
│           ├── app/              # Next.js App Router routes
│           ├── components/       # Shared UI pieces
│           └── lib/              # i18n helper, cookie-backed api-client session
├── packages/
│   ├── contracts/                # @shop/contracts: zod schemas, inferred types
│   ├── api-client/               # @shop/api-client: the only kernel caller
│   └── tokens/                   # @shop/tokens: DESIGN.md tokens and Tailwind theme
├── infra/                        # compose.yaml (whole stack), Caddyfile, bucket init; see docs/local-environment.md
├── scripts/                      # Repository scripts (check-forbidden-name.mjs and its tests)
├── eslint.config.ts              # Root ESLint: @medusajs/eslint-plugin recommended
└── turbo.json                    # Task graph: build, dev, start, lint, typecheck, test, seed
```

**`apps/web` is part of this repository** (the starter treats it as optional; here it is required).

Each app can have its own nested `AGENTS.md`; agents read the nearest one in the directory tree, so put app-specific context there rather than expanding this file.

## Package Manager

**The package manager is chosen at install time and is not fixed.** Detect it before running anything, in this order:

1. The `packageManager` field in the root `package.json` (e.g. `"pnpm@10.11.1"`) — authoritative when present.
2. The lockfile at the repo root: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm.

```bash
node -p "require('./package.json').packageManager ?? 'unset'"
ls pnpm-lock.yaml yarn.lock package-lock.json bun.lock bun.lockb 2>/dev/null
```

Use that manager for every command and never introduce a second lockfile. Below, `<pm>` means the detected manager. The `<pm> run <script>` and `<pm> exec <bin>` forms work across npm, pnpm, yarn, and bun; workspace-filter flags do not, so the per-app commands below `cd` into the app instead.

## Commands

Run from the repo root unless noted. Turbo skips missing apps automatically.

### Development

```bash
<pm> run dev                # all apps
<pm> run commerce:dev       # commerce kernel only (http://localhost:9000, admin at /app)
<pm> run web:dev            # storefront only (http://localhost:8000)
```

### Build

`@shop/web`'s `next build` does not need the kernel, but needs `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` set; see `docs/starter.md`.

```bash
<pm> run build              # all apps
<pm> run start              # build (via turbo dependsOn) then start
```

### Lint

```bash
<pm> run lint                          # all apps via turbo
cd apps/commerce && <pm> run lint      # medusa lint
cd apps/web && <pm> run lint           # eslint (flat config)
```

### Type-check

```bash
<pm> run typecheck                     # tsc --noEmit in every app via turbo
```

### Test

The root `<pm> run test` runs each app's `test` script via turbo: commerce runs `test:unit` (passes with no tests), the packages run vitest, web's e2e suite runs separately with Playwright when `E2E_BASE_URL` is set, and `node --test "scripts/*.test.mjs"` covers the repository scripts. Integration suites need a live database and run from `apps/commerce`:

```bash
cd apps/commerce && <pm> run test:unit                      # **/src/**/__tests__/**/*.unit.spec.ts
cd apps/commerce && <pm> run test:integration:modules       # **/src/modules/*/__tests__/**
cd apps/commerce && <pm> run test:integration:http          # **/integration-tests/http/*.spec.ts
cd apps/commerce && <pm> run test:integration               # builds @shop/contracts, then the http suites (CI runs this)
```

Single test — pass a path/pattern through to Jest, keeping `TEST_TYPE`:

```bash
cd apps/commerce && <pm> run test:unit -- src/modules/foo/__tests__/service.unit.spec.ts
cd apps/commerce && <pm> run test:unit -- -t "returns the cart"
```

### Database

```bash
cd apps/commerce
<pm> exec medusa db:generate <module-name>   # generate migrations for a custom module
<pm> exec medusa db:migrate                  # run migrations + migration-scripts (initial data seed)
<pm> exec medusa user -e admin@test.com -p supersecret
<pm> exec medusa exec ./src/scripts/seed-demo-products.ts   # optional demo products
```

## Medusa Package Docs (`node_modules`)

Medusa packages ship their own `AGENTS.md` inside the published package (`node_modules/@medusajs/<pkg>/AGENTS.md`). Each covers that package's public API, usage examples, architecture, and gotchas **for the exact installed version**, so prefer them over memory when writing code against a Medusa API. Older Medusa versions don't include them — if the file is missing, fall back to the MCP server and skills.

Find them (works for npm, yarn, and pnpm's `.pnpm` store):

```bash
find node_modules apps/*/node_modules -maxdepth 6 -path "*/@medusajs/*/AGENTS.md" 2>/dev/null
find node_modules -maxdepth 6 -path "*/@medusajs/product/AGENTS.md" 2>/dev/null | head -1
```

Most useful for this project:

| Package | Read it for |
| --- | --- |
| `@medusajs/framework` | Import subpaths (`/utils`, `/types`, `/http`, `/workflows-sdk`, `/zod`...), `medusa-config.ts`, `model`, `MedusaService`, `defineLink` |
| `@medusajs/medusa` | Built-in API routes, core subscribers, module re-exports (`@medusajs/medusa/<module>`, `/core-flows`) |
| `@medusajs/core-flows` | Prebuilt workflows/steps and their hooks — reuse these instead of calling module services directly |
| `@medusajs/<module>` (`product`, `cart`, `order`, `pricing`, `inventory`, `payment`, `fulfillment`, ...) | That commerce module's data models, service methods, and gotchas |
| `@medusajs/admin-sdk`, `@medusajs/ui`, `@medusajs/icons` | Admin widgets/routes and UI components |
| `@medusajs/js-sdk`, `@medusajs/types` | Storefront client config, store/auth namespaces, `HttpTypes` |
| `@medusajs/test-utils` | `medusaIntegrationTestRunner`, `moduleIntegrationTestRunner` |
| `@medusajs/eslint-plugin` | What each `@medusajs/*` lint rule enforces and how to fix it |
| `@medusajs/cli` | `medusa` commands (`db:*`, `exec`, `user`, `build`) |
| `@medusajs/draft-order` | The draft order plugin used by this backend |

Don't import from `@medusajs/utils`, `@medusajs/workflows-sdk`, etc. directly in the backend; use the `@medusajs/framework/*` subpaths.

## Medusa Skills & MCP Server

These are optional but strongly recommended — they give documentation-backed answers instead of guesses about Medusa APIs. **Use them when available; if they are not, mention to the user that installing them meaningfully improves development on this project.**

**Agentic skills** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/agentic-skills)) — if the `medusa-dev` skills are listed as available, load them *before* writing code, not after:

- `building-with-medusa` — any backend work: modules, API routes, workflows, data models, module links
- `building-admin-dashboard-customizations` — anything under `apps/commerce/src/admin`
- `building-storefronts` — anything under `apps/web`
- `db-generate` / `db-migrate` / `new-user` — the DB and user commands above

If they are not installed, suggest:

```bash
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
```

**MCP server** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/mcp-server)) — a `medusa` MCP server exposing the official docs. Prefer it over web search or memory for any Medusa API, config, or upgrade question. If it is not connected, suggest:

```bash
claude mcp add --transport http medusa https://docs.medusajs.com/mcp # or agent equivalent
```

**Medusa Cloud MCP server** — for projects deployed on Medusa Cloud. Exposes the user's Cloud deployments, build and runtime logs, environment variables, and store data (scoped to a project environment). Use it to debug failed deploys or production errors instead of asking the user to copy logs. If the user deploys on Cloud and it is not connected, suggest:

```bash
claude mcp add --transport http medusa-cloud https://cloud.medusajs.com/mcp # or agent equivalent
```

- It authenticates with the user's Medusa Cloud account; never ask for or handle Cloud credentials yourself.
- Never reveal environment variable values unless the user explicitly asks.
- Confirm with the user before any write to a live store (products, orders, etc.), especially a production environment.

**Plain-text docs** — without MCP, fetch [`llms.txt`](https://docs.medusajs.com/llms.txt) (index) or append `.md` to any `docs.medusajs.com` page URL for its Markdown.

**Which source to use:** package `AGENTS.md` for the installed API surface → skills for project patterns → MCP/docs for concepts, guides, and upgrades.

## Code Style

- **The backend must satisfy `@medusajs/eslint-plugin`'s recommended config** (`eslint.config.ts`). Its rules encode Medusa framework requirements — correct route/workflow/module shapes, not just cosmetics — so a lint failure usually means the code is actually wrong, not just badly formatted. Never disable a `@medusajs/*` rule to make lint pass; fix the code.
- No semicolons. Double quotes, 2-space indent.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. DB columns: snake_case.
- No emojis in code, comments, or commit messages.

## Conventions

- **Backend routing is file-based.** A store endpoint is `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc. Don't add a router or register routes manually.
- **Business logic belongs in workflows**, not in route handlers. Routes resolve and run a workflow; workflows compose steps.
- **Mutate commerce data through `core-flows` workflows**, not raw module service calls, so links, events, and inventory stay consistent.
- Adding a task to `turbo.json` requires declaring its `outputs`, or Turbo will cache nothing/the wrong thing.

## Common Mistakes

- Putting the product name anywhere under `apps/` or `packages/` outside content or settings data; CI's name check (`scripts/check-forbidden-name.mjs`) fails the build.
- Assuming a package manager instead of detecting it, or running a command that creates a second lockfile.
- Installing a dependency at the root instead of inside the app that needs it (`cd apps/commerce && <pm> add <pkg>`).
- Editing a custom module's model without running `<pm> exec medusa db:generate <module>` — the migration is missing and the change silently never applies.
- Writing raw SQL or importing DB clients directly in the backend instead of going through module services / workflows.
- Guessing a Medusa API signature from memory when the package's `AGENTS.md` or the MCP server is available.
- Calling the Medusa API from the storefront without `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; requests fail with a publishable-key error, not an obvious 401.
- Running the test task without a reachable PostgreSQL — integration suites need a live DB.
- Silencing `@medusajs/*` ESLint rules instead of fixing the underlying pattern.

## Off-Limits

- `apps/commerce/.medusa/`, `.next/`, `dist/`, `out/`, `.turbo/` — build output, excluded from the workspace and regenerated.
- `node_modules/` — read package `AGENTS.md` files there, but never edit installed packages.
- The lockfile (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` — whichever this install produced) — never hand-edit or delete; change it only as a side effect of a package manager command.
- `.env` / `.env.local` — never commit, print, or copy secret values out of them. Edit `.env.template` instead when documenting a new variable.
- Existing migrations in `src/modules/*/migrations/` — add a new migration rather than rewriting one that may already have run.
- Don't run destructive DB commands (drops, resets) against the user's database without explicit confirmation.
