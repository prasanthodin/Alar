"use client"

import { useEffect } from "react"
import { clearStaleBagAction } from "@/app/actions"

/**
 * Rendered when the stored Bag no longer exists: a page render cannot change
 * cookies, so this asks a server action to clear the stale Bag cookie once.
 */
export function ClearStaleBag() {
  useEffect(() => {
    void clearStaleBagAction()
  }, [])
  return null
}
