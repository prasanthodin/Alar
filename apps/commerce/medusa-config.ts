import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { logger } from '@medusajs/framework/logger'
import { loadEnvOrExit } from './src/env'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Exits naming the variable (never its value) when one is missing or malformed.
const env = loadEnvOrExit()

// The logger is created before this file loads, so apply the level (default "info")
// to it as well: at "http" the kernel would log client addresses and query strings.
process.env.LOG_LEVEL = env.LOG_LEVEL
logger.setLogLevel(env.LOG_LEVEL)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.DATABASE_URL,
    // Shared mode: the HTTP server, subscribers and scheduled jobs run in one process.
    // `medusa exec` sets MEDUSA_WORKER_MODE=server for its own short-lived process.
    workerMode: env.MEDUSA_WORKER_MODE,
    redisUrl: env.REDIS_URL,
    http: {
      storeCors: env.STORE_CORS,
      adminCors: env.ADMIN_CORS,
      authCors: env.AUTH_CORS,
      jwtSecret: env.JWT_SECRET,
      cookieSecret: env.COOKIE_SECRET,
    },
  },
  // Redis carries the event bus, the workflow engine and locking only. It is never a
  // cache: the kernel keeps its default in-memory cache module (AD-8).
  modules: [
    // Dated shop settings (Story 1.5): shop name, time zone, tax bands. Module
    // key `shopSettings`; the kernel's own `settings` module (admin layouts) stays.
    {
      resolve: './src/modules/settings',
    },
    // A Design's typed attributes, linked to its kernel product, and every
    // Variant price change (Story 1.6). Written only by the Design workflows.
    {
      resolve: './src/modules/design-attributes',
    },
    {
      resolve: './src/modules/price-history',
    },
    // Append-only stock-movement rows (Story 1.7, AD-6), written only by the
    // stock workflows inside the stock lock.
    {
      resolve: './src/modules/stock-ledger',
    },
    // Checkouts and Holds (Story 1.9, AD-6): a Checkout's snapshot of what the
    // Shopper agreed to pay for, and the Hold that keeps her Pieces (with
    // kernel reservations tagged with its id). Written only by the
    // begin-checkout and release-hold workflows.
    {
      resolve: './src/modules/checkout',
    },
    {
      resolve: './src/modules/hold',
    },
    // The shop's own tax provider is the only tax code (AD-5). `dependencies`
    // lets the provider, which lives in the tax module's container, read the
    // settings module and the cart and order line adjustments. The India tax
    // region uses provider `tp_shop_shop`.
    {
      resolve: '@medusajs/medusa/tax',
      dependencies: ['shopSettings', 'cart', 'order'],
      options: {
        providers: [
          {
            resolve: './src/providers/tax',
            id: 'shop',
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: env.REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          redisUrl: env.REDIS_URL,
        },
      },
    },
    {
      resolve: '@medusajs/medusa/locking',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/locking-redis',
            id: 'locking-redis',
            is_default: true,
            options: {
              redisUrl: env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-s3',
            id: 's3',
            options: {
              endpoint: env.S3_ENDPOINT,
              bucket: env.S3_BUCKET,
              file_url: env.S3_FILE_URL,
              region: env.S3_REGION,
              access_key_id: env.S3_ACCESS_KEY_ID,
              secret_access_key: env.S3_SECRET_ACCESS_KEY,
              // Buckets with owner-enforced object ownership (the S3 default) reject
              // ACL headers; the catalog bucket is public through its bucket policy.
              acl: false,
              additional_client_config: { forcePathStyle: true },
            },
          },
        ],
      },
    },
  ],
})
