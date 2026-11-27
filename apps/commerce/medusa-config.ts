import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { loadEnvOrExit } from './src/env'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Exits naming the variable (never its value) when one is missing or malformed.
const env = loadEnvOrExit()

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
