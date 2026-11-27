#!/bin/sh
# Website container entry point. `start` (the default) takes the kernel's
# publishable key from PUBLISHABLE_KEY_FILE (written by the commerce container)
# when NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set, then starts Next.js. The
# configuration check in next.config.js stops the process, naming any missing
# or malformed variable. Any other command runs as given.
set -eu

if [ "${1:-start}" = "start" ]; then
  if [ -z "${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-}" ] && [ -n "${PUBLISHABLE_KEY_FILE:-}" ] && [ -s "$PUBLISHABLE_KEY_FILE" ]; then
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$(cat "$PUBLISHABLE_KEY_FILE")"
    export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  fi
  exec next start -p 8000 -H 0.0.0.0
fi

exec "$@"
