#!/bin/sh
# Commerce container entry point. `start` (the default) runs migrations (which
# also run the starter's initial data seed once), writes the publishable API key
# for the website, then starts the kernel in the foreground. Any other command
# runs as given, e.g. `medusa exec ./src/scripts/spike-redis.js`.
set -eu

if [ "${1:-start}" = "start" ]; then
  medusa db:migrate
  medusa exec ./src/scripts/export-publishable-key.js
  exec medusa start
fi

exec "$@"
