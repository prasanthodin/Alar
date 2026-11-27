#!/usr/bin/env bash
# Smoke test for the local stack (Story 1.3). Brings infra/compose.yaml up, waits
# for every service to be healthy, then checks each row of the story's matrix:
# Redis configuration, the Redis 8 spike, file storage, health routes, request
# logs, the environment checks and the Story 1.2 end-to-end test through Caddy.
# Prints a summary and exits non-zero if any check fails. Not run in CI yet.
#
#   bash scripts/compose-smoke.sh
#
# Env:
#   SMOKE_DOWN=1          stop the stack at the end (volumes are kept)
#   SMOKE_SKIP_E2E=1      skip the Playwright test (needs pnpm, Node 24 and a browser); reported as SKIP
#
# Needs Linux with GNU tools (bash, sed, sha256sum, timeout, /proc), curl, openssl, node and Docker Compose v2.
#   SMOKE_TIMEOUT=900     seconds to wait for the stack to become healthy
#   E2E_CHROME_PATH       a local Chrome for Playwright (passed through)
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f infra/compose.yaml)
SERVICES=(postgres redis floci commerce web caddy)
TIMEOUT="${SMOKE_TIMEOUT:-900}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

declare -a RESULTS=()
FAILED=0

pass() { RESULTS+=("OK    $1"); echo "OK    $1"; }
skip() { RESULTS+=("SKIP  $1${2:+: $2}"); echo "SKIP  $1${2:+: $2}"; }
fail() { RESULTS+=("FAIL  $1${2:+: $2}"); echo "FAIL  $1${2:+: $2}"; FAILED=1; }
env_value() { grep -E "^$1=" infra/.env | tail -1 | cut -d= -f2-; }

summary() {
  echo
  echo "== Summary =="
  printf '%s\n' "${RESULTS[@]}"
  if [ "$FAILED" -eq 0 ]; then echo "All checks passed (SKIP rows were not run)."; else echo "Some checks failed."; fi
  if [ "${SMOKE_DOWN:-0}" = "1" ]; then "${COMPOSE[@]}" down; fi
}

# --- Configuration ---------------------------------------------------------------
if [ ! -f infra/.env ]; then
  echo "infra/.env not found: creating it from infra/.env.template with random secrets"
  cp infra/.env.template infra/.env
  for key in POSTGRES_PASSWORD JWT_SECRET COOKIE_SECRET S3_SECRET_ACCESS_KEY; do
    sed -i "s|^$key=\$|$key=$(openssl rand -hex 24)|" infra/.env
  done
  sed -i "s|^S3_ACCESS_KEY_ID=\$|S3_ACCESS_KEY_ID=local-emulator|" infra/.env
fi
CADDY_PORT="$(env_value CADDY_PORT)"; CADDY_PORT="${CADDY_PORT:-8080}"
PUBLIC_URL="$(env_value PUBLIC_URL)"; PUBLIC_URL="${PUBLIC_URL:-http://localhost:$CADDY_PORT}"; PUBLIC_URL="${PUBLIC_URL%/}"

# --- Stack up ----------------------------------------------------------------------
echo "== Starting the stack =="
if ! "${COMPOSE[@]}" up -d --build; then
  fail "stack up" "docker compose up failed"
  "${COMPOSE[@]}" ps -a
  summary; exit 1
fi

# Compose does not notice edits to the bind-mounted Caddyfile; load the current one.
"${COMPOSE[@]}" exec -T caddy caddy reload --config /etc/caddy/Caddyfile > /dev/null 2>&1 || true

deadline=$(( $(date +%s) + TIMEOUT ))
while :; do
  unhealthy=()
  for service in "${SERVICES[@]}"; do
    id="$("${COMPOSE[@]}" ps -q "$service")"
    status="$( [ -n "$id" ] && docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$id" 2>/dev/null || echo missing)"
    [ "$status" = "healthy" ] || unhealthy+=("$service=$status")
  done
  [ "${#unhealthy[@]}" -eq 0 ] && break
  if [ "$(date +%s)" -ge "$deadline" ]; then
    fail "stack up" "not healthy after ${TIMEOUT}s: ${unhealthy[*]}"
    "${COMPOSE[@]}" ps -a
    summary; exit 1
  fi
  sleep 5
done
init_exit="$(docker inspect -f '{{.State.ExitCode}}' "$("${COMPOSE[@]}" ps -aq bucket-init)" 2>/dev/null || echo "?")"
if [ "$init_exit" = "0" ]; then
  pass "stack up: ${SERVICES[*]} healthy; bucket-init completed"
else
  fail "stack up" "bucket-init exit code $init_exit"
fi

# --- Versions ----------------------------------------------------------------------
pg_version="$("${COMPOSE[@]}" exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d commerce -Atc "show server_version"' 2>/dev/null | tr -d '\r')"
redis_version="$("${COMPOSE[@]}" exec -T redis redis-cli INFO server 2>/dev/null | tr -d '\r' | sed -n 's/^redis_version://p')"
node_version="$("${COMPOSE[@]}" exec -T commerce node -v 2>/dev/null | tr -d '\r')"
if [[ "$pg_version" == 17* && "$redis_version" == 8* && "$node_version" == v24* ]]; then
  pass "versions: PostgreSQL $pg_version, Redis $redis_version, Node.js $node_version"
else
  fail "versions" "PostgreSQL '$pg_version', Redis '$redis_version', Node.js '$node_version'"
fi

# --- Redis configuration --------------------------------------------------------------
policy="$("${COMPOSE[@]}" exec -T redis redis-cli CONFIG GET maxmemory-policy 2>/dev/null | tr -d '\r' | sed -n 2p)"
aof="$("${COMPOSE[@]}" exec -T redis redis-cli CONFIG GET appendonly 2>/dev/null | tr -d '\r' | sed -n 2p)"
if [ "$policy" = "noeviction" ] && [ "$aof" = "yes" ]; then
  pass "redis config: maxmemory-policy=$policy appendonly=$aof"
else
  fail "redis config" "maxmemory-policy=$policy appendonly=$aof"
fi

# --- Spike: event, workflow, lock on Redis 8 ---------------------------------------------
"${COMPOSE[@]}" exec -T commerce medusa exec ./src/scripts/spike-redis.js > "$WORK/spike.log" 2>&1
spike_exit=$?
grep -E '^(OK|FAIL) ' "$WORK/spike.log" | sed 's/^/      /'
if [ "$spike_exit" -eq 0 ] && grep -q '^SPIKE OK' "$WORK/spike.log"; then
  pass "spike: event emitted and received, workflow run, lock taken and released"
else
  fail "spike" "$(grep -E '^FAIL ' "$WORK/spike.log" | head -3 | tr '\n' ' ')(exit $spike_exit; full log: docker compose logs commerce)"
  tail -20 "$WORK/spike.log"
fi

# --- File storage --------------------------------------------------------------------------
"${COMPOSE[@]}" exec -T commerce medusa exec ./src/scripts/check-file-storage.js keep > "$WORK/file.log" 2>&1
file_url="$(sed -n 's/^FILE_URL=//p' "$WORK/file.log" | tr -d '\r')"
file_sha="$(sed -n 's/^FILE_SHA256=//p' "$WORK/file.log" | tr -d '\r')"
file_id="$(sed -n 's/^FILE_ID=//p' "$WORK/file.log" | tr -d '\r')"
s3_file_url="$(env_value S3_FILE_URL)"; s3_file_url="${s3_file_url:-$PUBLIC_URL/catalog}"; s3_file_url="${s3_file_url%/}"
fetch_matches() { # url -> prints the status; returns 0 when 200 with the same bytes
  local status fetched_sha
  status="$(curl -s -o "$WORK/fetched" -w '%{http_code}' "$1")"
  fetched_sha="$(sha256sum "$WORK/fetched" | cut -d' ' -f1)"
  echo "$status"
  [ "$status" = "200" ] && [ "$fetched_sha" = "$file_sha" ]
}
if [ -n "$file_url" ] && [[ "$file_url" == "$s3_file_url"/* ]]; then
  if status="$(fetch_matches "$file_url")"; then
    pass "file storage: stored in catalog, public URL returns 200 with the same bytes"
  else
    fail "file storage" "GET $file_url -> $status or different bytes"
  fi
  caddy_url="$PUBLIC_URL/catalog/${file_url#"$s3_file_url"/}"
  if status="$(fetch_matches "$caddy_url")"; then
    pass "file through Caddy: $PUBLIC_URL/catalog/... returns 200 with the same bytes"
  else
    fail "file through Caddy" "GET $caddy_url -> $status or different bytes"
  fi
else
  fail "file storage" "no file URL under $s3_file_url"
  tail -20 "$WORK/file.log"
fi
if [ -n "$file_id" ]; then
  "${COMPOSE[@]}" exec -T commerce medusa exec ./src/scripts/check-file-storage.js delete "$file_id" > "$WORK/file-delete.log" 2>&1
  after="$(curl -s -o /dev/null -w '%{http_code}' "$file_url")"
  if grep -q '^FILE_DELETED=' "$WORK/file-delete.log" && [ "$after" != "200" ]; then
    pass "file cleanup: check file deleted (now $after)"
  else
    fail "file cleanup" "check file $file_id still served ($after)"
  fi
fi

# --- Health routes ---------------------------------------------------------------------------
commerce_health="$(curl -s -o /dev/null -w '%{http_code}' "$PUBLIC_URL/health")"
web_health="$(curl -s -o /dev/null -w '%{http_code}' "$PUBLIC_URL/api/health")"
site="$(curl -s -o /dev/null -w '%{http_code}' "$PUBLIC_URL/")"
if [ "$commerce_health" = "200" ] && [ "$web_health" = "200" ] && [ "$site" = "200" ]; then
  pass "health through Caddy: commerce /health 200, web /api/health 200, site / 200"
else
  fail "health" "commerce /health $commerce_health, web /api/health $web_health, site / $site"
fi
admin_ui="$(curl -s -L -o "$WORK/app.html" -w '%{http_code}' "$PUBLIC_URL/app")"
if [ "$admin_ui" = "200" ] && grep -qi '<div id="medusa"\|<html' "$WORK/app.html"; then
  pass "admin UI through Caddy: /app 200 from commerce"
else
  fail "admin UI" "GET $PUBLIC_URL/app -> $admin_ui"
fi

# --- Request logs ---------------------------------------------------------------------------
request_id="$(cat /proc/sys/kernel/random/uuid)"
probe_email="smoke-$(date +%s)@example.com"
curl -s -o /dev/null -D "$WORK/headers" -H "X-Request-Id: $request_id" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$probe_email\",\"password\":\"smoke-password-1\"}" \
  "$PUBLIC_URL/auth/customer/emailpass?email=$probe_email&token=smoke-token" || true
sleep 1
"${COMPOSE[@]}" logs --no-log-prefix --since 5m commerce > "$WORK/commerce.log" 2>&1
log_lines="$(grep -F "\"requestId\":\"$request_id\"" "$WORK/commerce.log" || true)"
echoed="$(grep -i '^x-request-id:' "$WORK/headers" | tr -d '\r' | awk '{print $2}')"
if [ "$(printf '%s\n' "$log_lines" | grep -c .)" = "1" ] \
  && printf '%s' "$log_lines" | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8"))' 2>/dev/null \
  && [ "$echoed" = "$request_id" ] \
  && ! grep -qiE "$probe_email|smoke-token|smoke-password" "$WORK/commerce.log"; then
  pass "logs: one JSON line with requestId, echoed in X-Request-Id; no email, token or password"
else
  fail "logs" "line: ${log_lines:-none}; echoed id: ${echoed:-none}"
fi

# --- Environment checks ------------------------------------------------------------------------
ENV_CHECK_N=0
check_env() { # service var value label
  local service="$1" var="$2" value="$3" label="$4" out code name
  ENV_CHECK_N=$((ENV_CHECK_N + 1))
  name="shop-envcheck-$$-$ENV_CHECK_N"
  out="$(timeout 180 "${COMPOSE[@]}" run --rm --no-deps -T --name "$name" -e "$var=$value" "$service" 2>&1)"
  code=$?
  # A process that unexpectedly keeps running is stopped by the timeout; never leave it behind.
  docker rm -f "$name" > /dev/null 2>&1 || true
  if [ "$code" -ne 0 ] && printf '%s' "$out" | grep -q "Missing or invalid environment variable: $var" \
    && { [ -z "$value" ] || ! printf '%s' "$out" | grep -qF "$value"; }; then
    pass "env: $service exits $code naming $var ($label), value not printed"
  else
    fail "env: $service $label $var" "exit $code"
    printf '%s\n' "$out" | tail -5
  fi
}
check_env commerce DATABASE_URL "" "missing"
check_env commerce DATABASE_URL "not-a-url" "malformed"
check_env web NEXT_PUBLIC_MEDUSA_BACKEND_URL "" "missing"
check_env web NEXT_PUBLIC_MEDUSA_BACKEND_URL "not-a-url" "malformed"

# --- Story 1.2 end-to-end test through Caddy ----------------------------------------------------
if [ "${SMOKE_SKIP_E2E:-0}" = "1" ]; then
  skip "e2e" "SMOKE_SKIP_E2E=1"
elif ! command -v pnpm > /dev/null; then
  fail "e2e" "pnpm not found"
elif E2E_BASE_URL="$PUBLIC_URL" pnpm --filter @shop/web e2e > "$WORK/e2e.log" 2>&1; then
  pass "e2e: Story 1.2 sign-up and sign-in through Caddy ($(grep -Eo '[0-9]+ passed' "$WORK/e2e.log" | tail -1))"
else
  fail "e2e" "Playwright failed"
  tail -30 "$WORK/e2e.log"
fi

summary
exit "$FAILED"
