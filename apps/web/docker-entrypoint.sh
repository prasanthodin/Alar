#!/bin/sh
# Website container entry point. `start` (the default) takes the kernel's
# publishable key from PUBLISHABLE_KEY_FILE (written by the commerce container)
# when NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set, then starts Next.js. The
# configuration check in next.config.js stops the process, naming any missing
# or malformed variable. Any other command runs as given.
set -eu

if [ "${1:-start}" = "start" ]; then
  # The key is read once here; restart web after it changes (for example after `down -v`).
  if [ -n "${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-}" ]; then
    echo "Publishable key: from NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
  elif [ -z "${PUBLISHABLE_KEY_FILE:-}" ]; then
    echo "Publishable key: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY and PUBLISHABLE_KEY_FILE are both unset" >&2
  elif [ -s "$PUBLISHABLE_KEY_FILE" ]; then
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$(cat "$PUBLISHABLE_KEY_FILE")"
    export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    echo "Publishable key: from PUBLISHABLE_KEY_FILE ($PUBLISHABLE_KEY_FILE)"
  else
    echo "Publishable key: PUBLISHABLE_KEY_FILE ($PUBLISHABLE_KEY_FILE) is missing or empty; is commerce running?" >&2
  fi
  exec next start -p 8000 -H 0.0.0.0
fi

exec "$@"
