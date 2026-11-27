import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { readEnv, type Env } from "../env"
import { shopError } from "./shop-errors"

/**
 * The private, versioned `documents` bucket (Story 1.9, AD-30): Checkout
 * recovery files now; invoices, credit notes and labels later. Objects are
 * written and read only through the S3 client, never given a public address
 * (no public URL is ever built for this bucket), and their contents are never
 * logged: errors carry the key and the S3 error name only.
 */

/** How long to wait for a connection to the store, for each request, and how many tries (2 × 15 s, well under the lock's 120 s). */
export const DOCUMENTS_CONNECTION_TIMEOUT_MS = 5_000
export const DOCUMENTS_REQUEST_TIMEOUT_MS = 15_000
export const DOCUMENTS_MAX_ATTEMPTS = 2

let cached: { client: S3Client; bucket: string } | null = null

function documentsClient(env: Env = readEnv()): { client: S3Client; bucket: string } {
  if (cached) return cached
  cached = {
    client: new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      forcePathStyle: true,
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
      // Writes run under the stock lock (120 s, not renewed): bound each request and the retries well inside it.
      requestHandler: { connectionTimeout: DOCUMENTS_CONNECTION_TIMEOUT_MS, requestTimeout: DOCUMENTS_REQUEST_TIMEOUT_MS },
      maxAttempts: DOCUMENTS_MAX_ATTEMPTS,
    }),
    bucket: env.S3_DOCUMENTS_BUCKET,
  }
  return cached
}

/** One stored version of a document. `versionId` is null only where the store does not version (never in the shop). */
export type StoredDocument = { key: string; versionId: string | null }

/** The S3 error's name, without its message or the request (which may echo the object). */
function errorName(e: unknown): string {
  return e && typeof e === "object" && typeof (e as { name?: unknown }).name === "string" ? (e as { name: string }).name : "Error"
}

/** Writes a JSON document to the documents bucket and returns the version written. Fails with `internal`. */
export async function putJsonDocument(key: string, body: unknown): Promise<StoredDocument> {
  const { client, bucket } = documentsClient()
  try {
    const res = await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(body),
        ContentType: "application/json",
      })
    )
    return { key, versionId: res.VersionId ?? null }
  } catch (e) {
    throw shopError("internal", `The document ${key} could not be written (${errorName(e)})`)
  }
}

/**
 * Removes one version of a document (the compensation of a write): with a
 * version id only that version goes, so an earlier version stays. Fails with
 * `internal`.
 */
export async function deleteDocumentVersion(doc: StoredDocument): Promise<void> {
  const { client, bucket } = documentsClient()
  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: doc.key, ...(doc.versionId ? { VersionId: doc.versionId } : {}) })
    )
  } catch (e) {
    throw shopError("internal", `The document ${doc.key} could not be removed (${errorName(e)})`)
  }
}

/** Reads a JSON document (its latest version), or null when there is none. */
export async function readJsonDocument(key: string): Promise<unknown> {
  const { client, bucket } = documentsClient()
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const text = await res.Body?.transformToString()
    return text ? (JSON.parse(text) as unknown) : null
  } catch (e) {
    if (errorName(e) === "NoSuchKey") return null
    throw shopError("internal", `The document ${key} could not be read (${errorName(e)})`)
  }
}
