# Website image. Build from the repository root:
#   docker build -f apps/web/Dockerfile --build-context certs=infra/certs .
# (infra/compose.yaml does this). Multi-architecture friendly: no arch-specific
# binaries are fetched here; pnpm installs the native packages for the build platform.
ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS build
WORKDIR /repo
ARG NEXT_PUBLIC_BASE_URL=http://localhost:8080
ENV CI=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_EXTRA_CA_CERTS=/tmp/extra-ca.pem \
    NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
# Optional extra CA certificates (*.crt, *.pem) for networks that intercept TLS.
# Used only while building; the runtime image does not contain them.
COPY --from=certs . /tmp/build-certs/
RUN cat /tmp/build-certs/*.crt /tmp/build-certs/*.pem > /tmp/extra-ca.pem 2>/dev/null || true; \
    corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter "@shop/web..."
# Build-time placeholders so the configuration check passes during `next build`.
# The server reads the kernel URL and publishable key at request time
# (src/lib/server-env.ts), so these values are not baked into the build.
RUN NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://commerce.invalid \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_build_placeholder \
    pnpm --filter @shop/web build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PATH=/repo/apps/web/node_modules/.bin:$PATH
COPY --from=build --chown=node:node /repo /repo
USER node
WORKDIR /repo/apps/web
EXPOSE 8000
ENTRYPOINT ["/repo/apps/web/docker-entrypoint.sh"]
CMD ["start"]
