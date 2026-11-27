#!/usr/bin/env node
// Name check (NFR-12): fails when the product name appears in any file under
// apps/ or packages/, other than content and settings data.
//
// The forbidden name is read from the FORBIDDEN_NAME environment variable,
// which CI sets from the FORBIDDEN_NAME repository variable, with a default in
// the CI workflow only. It is never written in application or package code.
//
// Usage: FORBIDDEN_NAME=<name> node scripts/check-forbidden-name.mjs [root]
// Exit codes: 0 no offenders, 1 offenders found (each path printed), 2 misuse.

import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

/** Top-level directories that are scanned, relative to the repository root. */
export const SCANNED_DIRS = ["apps", "packages"]

/**
 * Paths that may contain the product name: content and settings data only.
 * Each entry is a path prefix relative to the repository root, using "/".
 * Add an entry only for a directory that holds content or settings data,
 * never for code.
 */
export const ALLOW_LIST = [
  // Seeded shop settings (seller legal details, shop name) - Story 1.5.
  "apps/commerce/src/settings-data/",
  // Content application data (pages, blocks, translations) - Story 1.23.
  "apps/content/content-data/",
]

/** Directories skipped when the root is not a git work tree. */
const SKIPPED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".medusa",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
])

function toPosix(path) {
  return path.split(sep).join("/")
}

function walk(root, dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) {
        walk(root, full, files)
      }
    } else if (entry.isFile()) {
      files.push(toPosix(relative(root, full)))
    }
  }
}

/**
 * Lists the files to scan: tracked and untracked-but-not-ignored files under
 * the scanned directories. Falls back to a directory walk outside git.
 */
export function listFiles(root) {
  const existing = SCANNED_DIRS.filter((dir) => {
    try {
      return statSync(join(root, dir)).isDirectory()
    } catch {
      return false
    }
  })
  if (existing.length === 0) {
    return []
  }
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...existing],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    )
    return out
      .split("\0")
      .filter(Boolean)
      .filter((path) => {
        // Deleted but still tracked files are listed by --cached.
        try {
          return statSync(join(root, path)).isFile()
        } catch {
          return false
        }
      })
  } catch {
    const files = []
    for (const dir of existing) {
      walk(root, join(root, dir), files)
    }
    return files
  }
}

export function isAllowed(path, allowList = ALLOW_LIST) {
  return allowList.some((prefix) => path.startsWith(prefix))
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0)
}

/**
 * True when the text contains the name anywhere, in any letter case,
 * including inside longer identifiers ("NameShop", "namedb", "names").
 */
export function containsName(text, name) {
  return text.toLowerCase().includes(name.toLowerCase())
}

/**
 * Returns the paths (relative, "/"-separated, sorted) whose path or text
 * content contains the forbidden name, case-insensitively.
 */
export function findOffenders(root, name, allowList = ALLOW_LIST) {
  const offenders = []
  for (const path of listFiles(root)) {
    if (isAllowed(path, allowList)) {
      continue
    }
    if (containsName(path, name)) {
      offenders.push(path)
      continue
    }
    const buffer = readFileSync(join(root, path))
    if (isBinary(buffer)) {
      continue
    }
    if (containsName(buffer.toString("utf8"), name)) {
      offenders.push(path)
    }
  }
  return offenders.sort()
}

export function main(argv = process.argv.slice(2), env = process.env) {
  const name = (env.FORBIDDEN_NAME ?? "").trim()
  if (!name) {
    console.error(
      "check-forbidden-name: FORBIDDEN_NAME is not set. CI sets it from the repository variable."
    )
    return 2
  }
  const root = resolve(argv[0] ?? process.cwd())
  const offenders = findOffenders(root, name)
  if (offenders.length > 0) {
    console.error(
      `check-forbidden-name: the forbidden name appears in ${offenders.length} file(s) under ${SCANNED_DIRS.join("/, ")}/:`
    )
    for (const path of offenders) {
      console.error(path)
    }
    console.error(
      "Move product naming into settings or content data, or add a content/settings data path to ALLOW_LIST."
    )
    return 1
  }
  console.log("check-forbidden-name: no offending files.")
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
