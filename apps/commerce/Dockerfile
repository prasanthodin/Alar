# Commerce kernel image. Build from the repository root:
#   docker build -f apps/commerce/Dockerfile --build-context certs=infra/certs .
# (infra/compose.yaml does this). Multi-architecture friendly: no arch-specific
# binaries are fetched here; pnpm installs the native packages for the build platform.
ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS build
WORKDIR /repo
ENV CI=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    MEDUSA_DISABLE_TELEMETRY=true \
    NODE_EXTRA_CA_CERTS=/tmp/extra-ca.pem
# Optional extra CA certificates (*.crt, *.pem) for networks that intercept TLS.
# Used only while building; the runtime image does not contain them.
COPY --from=certs . /tmp/build-certs/
RUN cat /tmp/build-certs/*.crt /tmp/build-certs/*.pem > /tmp/extra-ca.pem 2>/dev/null || true; \
    corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter "@shop/commerce..."
# Build-time placeholders so the configuration check passes during `medusa build`.
# Nothing here is baked into the build output; the real values come at runtime.
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    REDIS_URL=redis://localhost:6379 \
    STORE_CORS=http://localhost ADMIN_CORS=http://localhost AUTH_CORS=http://localhost \
    JWT_SECRET=build-placeholder COOKIE_SECRET=build-placeholder \
    S3_ENDPOINT=http://localhost:4566 S3_BUCKET=build S3_REGION=us-east-1 \
    S3_FILE_URL=http://localhost:4566/build S3_ACCESS_KEY_ID=build S3_SECRET_ACCESS_KEY=build \
    pnpm --filter @shop/commerce build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    MEDUSA_DISABLE_TELEMETRY=true \
    PATH=/repo/apps/commerce/node_modules/.bin:$PATH
RUN mkdir -p /var/lib/shop && chown node:node /var/lib/shop
COPY --from=build --chown=node:node /repo /repo
USER node
# The kernel runs from its build output; dependencies resolve from apps/commerce/node_modules.
WORKDIR /repo/apps/commerce/.medusa/server
EXPOSE 9000
ENTRYPOINT ["/repo/apps/commerce/docker-entrypoint.sh"]
CMD ["start"]
