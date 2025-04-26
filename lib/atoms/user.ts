import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { ONE_DAY_IN_MS } from "@/lib/constants"
import { useUserTopics } from "./topics"

const atomIsExplainerConfirmed = atomWithStorage(
  "juz.isExplainerConfirmed",
  false
)

/**
 * Used to know if the user has confirmed the explainer in main page
 */
export const useAtomExplainerConfirmed = () => useAtom(atomIsExplainerConfirmed)

const INITIAL_PLAYER_HEARTS = 3
const atomPlayerHearts = atomWithStorage(
  "juz.totalPlayerHearts",
  INITIAL_PLAYER_HEARTS
)
export const usePlayerHearts = () => {
  const [hearts, setHearts] = useAtom(atomPlayerHearts)

  return {
    hearts,
    setHearts,
    refill: () => setHearts(INITIAL_PLAYER_HEARTS),
    removeHeart: () => setHearts((current) => Math.max(current - 1, 0)),
  }
}

export const useNextRefillTime = () => {
  const { lastUpdated } = useUserTopics()

  return {
    lastUpdated,
    nextRefill: lastUpdated + ONE_DAY_IN_MS,
  }
}
