// One-shot bucket set-up for the local AWS emulator (the `bucket-init` service in
// infra/compose.yaml). Creates each bucket if it is missing, turns on versioning
// and, for public buckets, sets a public-read bucket policy. A private bucket
// gets no policy at all (and any policy found on it is an error). Safe to run again.
//
// Runs with the commerce image, from apps/commerce, so `@aws-sdk/client-s3` (the
// only cloud client the repository uses) resolves from that package.
//
// Env: S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, CATALOG_BUCKET (default "catalog"),
// DOCUMENTS_BUCKET (default "documents").
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(path.join(process.cwd(), "package.json"))
const {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketVersioningCommand,
  GetBucketVersioningCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  GetBucketPolicyCommand,
} = require("@aws-sdk/client-s3")

// `catalog` (public, Story 1.3) and `documents` (private: Checkout recovery files,
// later invoices, credit notes and labels; Story 1.9). Later stories add `tiles`
// and `shopper-media`.
const BUCKETS = [
  { name: process.env.CATALOG_BUCKET || "catalog", public: true },
  { name: process.env.DOCUMENTS_BUCKET || "documents", public: false },
]

function required(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing or invalid environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

const region = required("S3_REGION")

const client = new S3Client({
  endpoint: required("S3_ENDPOINT"),
  region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
  },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function bucketExists(name) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: name }))
    return true
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") {
      return false
    }
    throw err
  }
}

async function withRetry(label, fn, attempts = 30) {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i >= attempts) {
        throw err
      }
      console.log(`${label}: not ready (${err?.name ?? err}); retrying`)
      await sleep(1000)
    }
  }
}

function publicReadPolicy(name) {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${name}/*`],
      },
    ],
  })
}

async function setUp(bucket) {
  const { name } = bucket
  if (await withRetry("emulator", () => bucketExists(name))) {
    console.log(`${name}: exists`)
  } else {
    // S3 needs the region as a location constraint everywhere except us-east-1.
    await client.send(
      new CreateBucketCommand({
        Bucket: name,
        ...(region === "us-east-1" ? {} : { CreateBucketConfiguration: { LocationConstraint: region } }),
      })
    )
    console.log(`${name}: created`)
  }

  await client.send(
    new PutBucketVersioningCommand({ Bucket: name, VersioningConfiguration: { Status: "Enabled" } })
  )
  const versioning = await client.send(new GetBucketVersioningCommand({ Bucket: name }))
  if (versioning.Status !== "Enabled") {
    throw new Error(`${name}: versioning is ${versioning.Status ?? "off"}`)
  }
  console.log(`${name}: versioning enabled`)

  if (bucket.public) {
    // New buckets block public policies by default, as on AWS.
    await client.send(
      new PutPublicAccessBlockCommand({
        Bucket: name,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    )
    await client.send(new PutBucketPolicyCommand({ Bucket: name, Policy: publicReadPolicy(name) }))
    const { Policy } = await client.send(new GetBucketPolicyCommand({ Bucket: name }))
    if (!Policy?.includes("s3:GetObject")) {
      throw new Error(`${name}: public-read policy not applied`)
    }
    console.log(`${name}: public-read policy set`)
  } else {
    // A private bucket: block every kind of public access and make sure no policy grants any.
    await client.send(
      new PutPublicAccessBlockCommand({
        Bucket: name,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      })
    )
    if (await bucketPolicy(name)) {
      throw new Error(`${name}: a private bucket must have no bucket policy`)
    }
    console.log(`${name}: private (no bucket policy)`)
  }
}

/** The bucket's policy, or null when it has none. */
async function bucketPolicy(name) {
  try {
    const { Policy } = await client.send(new GetBucketPolicyCommand({ Bucket: name }))
    return Policy ?? null
  } catch (err) {
    if (err?.name === "NoSuchBucketPolicy" || err?.$metadata?.httpStatusCode === 404) return null
    throw err
  }
}

try {
  for (const bucket of BUCKETS) {
    await setUp(bucket)
  }
  console.log("buckets ready")
} catch (err) {
  console.error(`bucket set-up failed: ${err?.name ?? "Error"}: ${err?.message ?? err}`)
  process.exit(1)
}
