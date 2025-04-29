"use client"

import { useEffect } from "react"
import { useisGameActive } from "@/lib/atoms/game"
import { usePlayerHearts } from "@/lib/atoms/user"

export default function GameSentinel() {
  const [isGameActive, setIsGameActive] = useisGameActive()
  const { removeHeart } = usePlayerHearts()

  useEffect(() => {
    // Early exit if seeing default state
    if (isGameActive === null) return

    if (isGameActive) {
      setTimeout(
        () => {
          const isGameModalOpen = Boolean(document.getElementById("ModalGame"))
          console.debug("GameSentinel", { isGameActive, isGameModalOpen })

          // Exit if user is "playing"
          if (isGameModalOpen) return

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
