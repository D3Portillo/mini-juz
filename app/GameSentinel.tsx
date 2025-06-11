"use client"

import { useEffect } from "react"
import { useIsGameActive } from "@/lib/atoms/game"
import { usePlayerHearts } from "@/lib/atoms/user"
import { isAnyModalOpen } from "@/lib/window"

export default function GameSentinel() {
  const [isGameActive, setIsGameActive] = useIsGameActive()
  const { removeHeart } = usePlayerHearts()

  useEffect(() => {
    // Early exit if seeing default state
    if (isGameActive === null) return

    if (isGameActive) {
      setTimeout(
        () => {
          // Exit if user is in any modal (assuming it's game modal)
          if (isAnyModalOpen()) return

          // Remove heart if game is active and no modal open
          removeHeart()

          // Avoid re-taking user's heart
          setIsGameActive(false)
        },
        1_000 // Wait for 1 second
      )
    }
  }, [isGameActive])

  return null
}
